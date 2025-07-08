const Worker = require("../models/Worker");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPEG, JPG, PNG, and PDF files are allowed"));
    }
  },
});

// Get worker application configuration
exports.getWorkerConfig = async (req, res) => {
  try {
    const services = ["House Cleaning", "Washing Clothes", "Cooking"];
    const availabilityOptions = [];
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const timeSlots = [
      "Morning (8AM-12PM)",
      "Afternoon (12PM-6PM)",
      "Evening (6PM-10PM)",
      "Late Night (10PM-12AM)",
    ];

    days.forEach((day) => {
      timeSlots.forEach((slot) => {
        availabilityOptions.push(`${day} - ${slot}`);
      });
    });

    res.json({
      success: true,
      data: {
        services,
        availabilityOptions,
      },
    });
  } catch (error) {
    console.error("Get worker config error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load configuration",
    });
  }
};

// Get or create worker application
exports.getWorkerApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    let worker = await Worker.findOne({ user: userId });

    if (!worker) {
      worker = new Worker({
        user: userId,
        firstName: req.user.firstName || "",
        lastName: req.user.lastName || "",
        email: req.user.email || "",
        phone: "",
        address: "",
        services: [],
        experience: "",
        hourlyRate: 0,
        availability: [],
        bio: "",
        documents: {
          idDocument: {},
          certifications: [],
        },
        backgroundCheck: {
          hasConvictions: false,
          convictionDetails: "",
        },
      });
      await worker.save();
    }

    res.json({
      success: true,
      data: worker,
    });
  } catch (error) {
    console.error("Get worker application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load application",
    });
  }
};

// Submit worker application
exports.submitWorkerApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      services,
      experience,
      hourlyRate,
      availability,
      bio,
      hasConvictions,
      convictionDetails,
    } = req.body;

    const existingWorker = await Worker.findOne({
      user: userId,
      applicationStatus: { $in: ["pending", "approved"] },
    });

    if (existingWorker) {
      return res.status(400).json({
        success: false,
        message: "You already have a submitted application",
      });
    }

    let worker =
      (await Worker.findOne({ user: userId })) || new Worker({ user: userId });

    worker.firstName = firstName;
    worker.lastName = lastName;
    worker.email = email;
    worker.phone = phone;
    worker.address = address;
    worker.services = services;
    worker.experience = experience;
    worker.hourlyRate = parseFloat(hourlyRate);
    worker.availability = availability;
    worker.bio = bio;
    worker.backgroundCheck.hasConvictions = hasConvictions;
    worker.backgroundCheck.convictionDetails = convictionDetails || "";

    if (!worker.documents.idDocument || !worker.documents.idDocument.url) {
      return res.status(400).json({
        success: false,
        message:
          "Government ID document is required. Please upload your ID first.",
      });
    }

    await worker.submitApplication();

    res.json({
      success: true,
      message:
        "Application submitted successfully! We will review it within 2-3 business days.",
      data: worker,
    });
  } catch (error) {
    console.error("Submit worker application error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit application",
    });
  }
};

// Upload documents
const uploadToCloudinary = (buffer, originalname, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `handyhub/workers/${folder}`,
        resource_type: "auto",
        public_id: `${Date.now()}-${originalname.split(".")[0]}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Upload ID document
exports.uploadIdDocument = [
  upload.single("idDocument"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const userId = req.user.id;
      let worker = await Worker.findOne({ user: userId });
      if (!worker) {
        worker = new Worker({
          user: userId,
          firstName: req.user.firstName || "",
          lastName: req.user.lastName || "",
          email: req.user.email || "",
          phone: "",
          address: "",
          services: [],
          experience: "",
          hourlyRate: 0,
          availability: [],
          bio: "",
          documents: {
            idDocument: {},
            certifications: [],
          },
          backgroundCheck: {
            hasConvictions: false,
            convictionDetails: "",
          },
        });
      }

      if (worker.documents.idDocument && worker.documents.idDocument.publicId) {
        await cloudinary.uploader.destroy(worker.documents.idDocument.publicId);
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        "id-documents"
      );

      worker.documents.idDocument = {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,
        uploadedAt: new Date(),
      };

      await worker.save();

      res.json({
        success: true,
        message: "ID document uploaded successfully",
        data: {
          url: result.secure_url,
          filename: req.file.originalname,
        },
      });
    } catch (error) {
      console.error("Upload ID document error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload document",
      });
    }
  },
];

// Upload certifications
exports.uploadCertifications = [
  upload.array("certifications", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const userId = req.user.id;
      let worker = await Worker.findOne({ user: userId });
      if (!worker) {
        worker = new Worker({
          user: userId,
          firstName: req.user.firstName || "",
          lastName: req.user.lastName || "",
          email: req.user.email || "",
          phone: "",
          address: "",
          services: [],
          experience: "",
          hourlyRate: 0,
          availability: [],
          bio: "",
          documents: {
            idDocument: {},
            certifications: [],
          },
          backgroundCheck: {
            hasConvictions: false,
            convictionDetails: "",
          },
        });
      }

      const uploadedCertifications = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          file.originalname,
          "certifications"
        );
        uploadedCertifications.push({
          name: file.originalname.split(".")[0],
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          uploadedAt: new Date(),
        });
      }

      worker.documents.certifications.push(...uploadedCertifications);
      await worker.save();

      res.json({
        success: true,
        message: `${uploadedCertifications.length} certification(s) uploaded successfully`,
        data: uploadedCertifications.map((cert) => ({
          name: cert.originalName,
          url: cert.url,
        })),
      });
    } catch (error) {
      console.error("Upload certifications error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload certifications",
      });
    }
  },
];

// Save application draft
g exports.saveApplicationDraft = async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationData = req.body;

    let worker = await Worker.findOne({ user: userId });
    if (!worker) {
      worker = new Worker({ user: userId });
    }

    Object.keys(applicationData).forEach((key) => {
      if (applicationData[key] !== undefined && applicationData[key] !== null) {
        if (key === "backgroundCheck") {
          worker.backgroundCheck = {
            ...worker.backgroundCheck,
            ...applicationData[key],
          };
        } else {
          worker[key] = applicationApplicationData[key];
        }
      }
    });

    await worker.save();

    res.json({
      success: true,
      message: "Draft saved successfully",
      data: worker,
    });
  } catch (error) {
    console.error("Save application draft error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save draft",
    });
  }
};

// Get application status
exports.getApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const worker = await Worker.findOne({ user: userId });

    if (!worker) {
      return res.json({
        success: true,
        data: {
          status: "not_started",
          message: "Application not started",
        },
      });
    }

    res.json({
      success: true,
      data: {
        status: worker.applicationStatus,
        submittedAt: worker.submittedAt,
        approvedAt: worker.approvedAt,
        rejectionReason: worker.rejectionReason,
        message: exports.getStatusMessage(worker.applicationStatus),
      },
    });
  } catch (error) {
    console.error("Get application status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get application status",
    });
  }
};

// Helper function for status messages
exports.getStatusMessage = (status) => {
  switch (status) {
    case "incomplete":
      return "Application is incomplete. Please complete all required fields.";
    case "pending":
      return "Your application is under review. We will get back to you within 2-3 business days.";
    case "approved":
      return "Congratulations! Your application has been approved. You can now start accepting bookings.";
    case "rejected":
      return "Your application has been rejected. Please contact support for more information.";
    default:
      return "Unknown status";
  }
};
