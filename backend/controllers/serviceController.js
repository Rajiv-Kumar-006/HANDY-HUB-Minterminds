const Service = require("../models/Service");
const AppError = require("../utils/appError");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload image to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "handyhub/services", resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(new AppError("Failed to upload image to Cloudinary", 500));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    Readable.from(file.buffer).pipe(stream);
  });
};

// Create a service (admin)
exports.createService = async (req, res, next) => {
  try {
    const {
      name,
      title,
      description,
      category,
      provider,
      basePrice,
      duration,
      location,
      icon,
      requirements,
      includes,
      isActive,
    } = req.body;

    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const service = await Service.create({
      name,
      title,
      description,
      category,
      provider,
      basePrice: { min: basePrice?.min, max: basePrice?.max },
      duration: { min: duration?.min, max: duration?.max },
      location,
      image: imageUrl || req.body.image || "",
      icon: icon || "",
      requirements: requirements || [],
      includes: includes || [],
      isActive: isActive !== undefined ? isActive : true,
      popularity: 0,
      averageRating: 0,
      totalReviews: 0,
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get all services
exports.getServices = async (req, res, next) => {
  try {
    const {
      category,
      search,
      priceMin,
      priceMax,
      active,
      page = 1,
      limit = 10,
    } = req.query;
    let query = {};

    if (category && category !== "all") {
      query.category = category;
    }
    if (search) {
      query.$text = { $search: search };
    }
    if (priceMin || priceMax) {
      query["basePrice.min"] = {};
      if (priceMin) query["basePrice.min"].$gte = Number(priceMin);
      if (priceMax) query["basePrice.max"].$lte = Number(priceMax);
    }
    if (active !== undefined) {
      query.isActive = active === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);
    const services = await Service.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ [req.query.sortBy || "averageRating"]: -1 });

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      count: services.length,
      total,
      data: services,
    });
  } catch (error) {
    next(new AppError("Server error", 500));
  }
};

// Get service by ID
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(new AppError("Service not found", 404));
    }
    res.json({ success: true, data: service });
  } catch (error) {
    next(new AppError("Server error", 500));
  }
};

// Update a service (admin)
exports.updateService = async (req, res, next) => {
  try {
    const {
      name,
      title,
      description,
      category,
      provider,
      basePrice,
      duration,
      location,
      icon,
      requirements,
      includes,
      isActive,
    } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    let imageUrl = service.image;
    if (req.file) {
      if (service.image) {
        const publicId = service.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`handyhub/services/${publicId}`);
      }
      imageUrl = await uploadToCloudinary(req.file);
    }

    service.name = name || service.name;
    service.title = title || service.title;
    service.description = description || service.description;
    service.category = category || service.category;
    service.provider = provider || service.provider;
    service.basePrice = {
      min: basePrice?.min || service.basePrice.min,
      max: basePrice?.max || service.basePrice.max,
    };
    service.duration = {
      min: duration?.min || service.duration.min,
      max: duration?.max || service.duration.max,
    };
    service.location = location || service.location;
    service.image = imageUrl || req.body.image || service.image;
    service.icon = icon || service.icon;
    service.requirements = requirements || service.requirements;
    service.includes = includes || service.includes;
    service.isActive = isActive !== undefined ? isActive : service.isActive;

    await service.save();
    res.json({ success: true, data: service });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Delete a service (admin)
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    if (service.image) {
      const publicId = service.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`handyhub/services/${publicId}`);
    }

    await service.deleteOne();
    res.json({ success: true, message: "Service deleted" });
  } catch (error) {
    next(new AppError("Server error", 500));
  }
};

// Get service categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = [
      {
        name: "cleaning",
        label: "House Cleaning",
        description: "Professional cleaning services for your home",
      },
      {
        name: "plumbing",
        label: "Plumbing",
        description: "Expert plumbing repairs and installations",
      },
      {
        name: "electrical",
        label: "Electrical",
        description: "Safe and reliable electrical services",
      },
      {
        name: "gardening",
        label: "Gardening",
        description: "Lawn care and landscaping services",
      },
      {
        name: "cooking",
        label: "Cooking",
        description: "Personal chef and meal preparation services",
      },
      {
        name: "handyman",
        label: "Handyman",
        description: "General home repair and maintenance",
      },
      {
        name: "painting",
        label: "Painting",
        description: "Interior and exterior painting services",
      },
      {
        name: "automotive",
        label: "Automotive",
        description: "Car repair and maintenance services",
      },
    ];

    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const serviceCount = await Service.countDocuments({
          category: category.name,
          isActive: true,
        });
        return { ...category, serviceCount };
      })
    );

    res.json({ success: true, data: categoryStats });
  } catch (error) {
    next(new AppError("Server error", 500));
  }
};
