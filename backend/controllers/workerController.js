const Worker = require("../models/Worker");
const User = require("../models/User");
const AppError = require("../utils/appError");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const { body, validationResult } = require("express-validator");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          reject(new AppError("Failed to upload file to Cloudinary", 500));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            originalName: file.originalname,
          });
        }
      }
    );
    Readable.from(file.buffer).pipe(stream);
  });
};

// Input validation for submitApplication
const validateApplication = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone")
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage("Valid phone number is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("services")
    .isArray({ min: 1 })
    .withMessage("At least one service is required"),
  body("experience")
    .isIn(["0-1", "1-3", "3-5", "5-10", "10+"])
    .withMessage("Valid experience is required"),
  body("hourlyRate")
    .isFloat({ min: 10, max: 200 })
    .withMessage("Hourly rate must be between 10 and 200"),
  body("availability")
    .isArray({ min: 1 })
    .withMessage("At least one availability slot is required"),
  body("bio")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Bio must be 50-500 characters"),
];

// Submit new worker application
exports.submitApplication = [
  ...validateApplication,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          new AppError(
            errors
              .array()
              .map((err) => err.msg)
              .join(", "),
            400
          )
        );
      }

      const user = req.user;
      if (user.role !== "user") {
        return next(new AppError("Only users can submit applications", 403));
      }

      const existingApplication = await Worker.findOne({ user: user._id });
      if (existingApplication) {
        return next(
          new AppError("You have already submitted an application", 400)
        );
      }

      const applicationData = {
        user: user._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        services: req.body.services,
        experience: req.body.experience,
        hourlyRate: parseFloat(req.body.hourlyRate),
        availability: req.body.availability,
        bio: req.body.bio,
        backgroundCheck: {
          hasConvictions: req.body.hasConvictions || false,
          convictionDetails: req.body.convictionDetails || "",
        },
      };

      const worker = await Worker.create(applicationData);

      res.status(201).json({
        success: true,
        data: worker,
      });
    } catch (error) {
      next(error);
    }
  },
];

// Upload documents
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError("No files uploaded", 400));
    }

    const user = req.user;
    const worker = await Worker.findOne({ user: user._id });
    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    const { documentType } = req.body;
    if (!["idDocument", "certification"].includes(documentType)) {
      return next(new AppError("Invalid document type", 400));
    }

    if (documentType === "idDocument" && req.files.length > 1) {
      return next(new AppError("Only one ID document allowed", 400));
    }

    const uploadedFiles = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file))
    );

    if (documentType === "idDocument") {
      worker.documents.idDocument = uploadedFiles[0];
    } else {
      uploadedFiles.forEach((file) => {
        worker.documents.certifications.push({
          name: file.originalName.split(".")[0],
          ...file,
        });
      });
    }

    await worker.save();

    res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      data: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
};

// Submit application for review
exports.submitForReview = async (req, res, next) => {
  try {
    const user = req.user;
    const worker = await Worker.findOne({ user: user._id });

    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    if (!worker.documents.idDocument) {
      return next(
        new AppError("ID document is required before submission", 400)
      );
    }

    await worker.submitApplication();

    res.status(200).json({
      success: true,
      message: "Application submitted for review",
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// Get current worker's application
exports.getMyApplication = async (req, res, next) => {
  try {
    const user = req.user;
    const worker = await Worker.findOne({ user: user._id }).populate(
      "user",
      "name email role"
    );

    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    res.status(200).json({
      success: true,
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// Update worker application
exports.updateApplication = [
  ...validateApplication,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          new AppError(
            errors
              .array()
              .map((err) => err.msg)
              .join(", "),
            400
          )
        );
      }

      const user = req.user;
      const worker = await Worker.findOne({ user: user._id });

      if (!worker) {
        return next(new AppError("Worker application not found", 404));
      }

      if (worker.applicationStatus === "approved") {
        return next(new AppError("Cannot update approved application", 400));
      }

      const updatableFields = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "address",
        "services",
        "experience",
        "hourlyRate",
        "availability",
        "bio",
        "backgroundCheck.hasConvictions",
        "backgroundCheck.convictionDetails",
      ];

      Object.keys(req.body).forEach((key) => {
        if (updatableFields.includes(key)) {
          if (key.includes(".")) {
            const [parent, child] = key.split(".");
            worker[parent][child] = req.body[key];
          } else {
            worker[key] = req.body[key];
          }
        }
      });

      if (req.body.hourlyRate) {
        worker.hourlyRate = parseFloat(req.body.hourlyRate);
      }

      await worker.save();

      res.status(200).json({
        success: true,
        message: "Application updated successfully",
        data: worker,
      });
    } catch (error) {
      next(error);
    }
  },
];

// Get worker stats
exports.getWorkerStats = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id }).select(
      "stats rating"
    );
    if (!worker) {
      return next(new AppError("Worker not found", 404));
    }
    res.status(200).json({
      success: true,
      data: {
        totalEarnings: worker.stats.totalEarnings,
        completedJobs: worker.stats.completedBookings,
        averageRating: worker.rating.average,
        responseRate: worker.stats.responseRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get worker bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ worker: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all worker applications
exports.getAllApplications = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.applicationStatus = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const workers = await Worker.find(query)
      .populate("user", "name email")
      .select(
        "firstName lastName email services experience applicationStatus submittedAt"
      );

    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Approve worker application
exports.approveApplication = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    if (worker.applicationStatus !== "pending") {
      return next(
        new AppError("Only pending applications can be approved", 400)
      );
    }

    worker.applicationStatus = "approved";
    worker.approvedAt = new Date();
    worker.approvedBy = req.user._id;
    worker.isVerified = true;

    await worker.save();

    const user = await User.findById(worker.user);
    if (user && user.role !== "worker") {
      user.role = "worker";
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Worker application approved",
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Reject worker application
exports.rejectApplication = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    if (worker.applicationStatus !== "pending") {
      return next(
        new AppError("Only pending applications can be rejected", 400)
      );
    }

    worker.applicationStatus = "rejected";
    worker.rejectionReason =
      rejectionReason || "Application did not meet requirements";
    await worker.save();

    res.status(200).json({
      success: true,
      message: "Worker application rejected",
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete worker application
exports.deleteApplication = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return next(new AppError("Worker application not found", 404));
    }

    if (worker.documents.idDocument?.publicId) {
      await cloudinary.uploader.destroy(worker.documents.idDocument.publicId);
    }
    for (const cert of worker.documents.certifications) {
      if (cert.publicId) {
        await cloudinary.uploader.destroy(cert.publicId);
      }
    }

    await worker.remove();

    res.status(204).json({
      success: true,
      message: "Worker application deleted",
    });
  } catch (error) {
    next(error);
  }
};
