const Service = require("../models/Service");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getAllServices = catchAsync(async (req, res, next) => {
  const { category, active = true, page = 1, limit = 10 } = req.query;

  // Build query
  let query = {};

  if (category) {
    query.category = category;
  }

  if (active) {
    query.isActive = active === "true";
  }

  const services = await Service.find(query)
    .sort({ popularity: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Service.countDocuments(query);

  res.status(200).json({
    success: true,
    count: services.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
    data: services,
  });
});

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  res.status(200).json({
    success: true,
    data: service,
  });
});

// @desc    Create service
// @route   POST /api/services
// @access  Private/Admin
exports.createService = catchAsync(async (req, res, next) => {
  const {
    name,
    title,
    description,
    category,
    icon,
    basePrice,
    duration,
    requirements,
    includes,
  } = req.body;

  // Validate required fields
  if (!name || !title || !description || !category) {
    return next(new AppError("Please provide all required fields", 400));
  }

  // Validate category
  if (!["cleaning", "cooking", "laundry"].includes(category)) {
    return next(new AppError("Invalid service category", 400));
  }

  // Validate base price
  if (!basePrice || !basePrice.min || !basePrice.max) {
    return next(new AppError("Please provide valid base price range", 400));
  }

  if (basePrice.min > basePrice.max) {
    return next(
      new AppError("Minimum price cannot be greater than maximum price", 400)
    );
  }

  // Validate duration
  if (!duration || !duration.min || !duration.max) {
    return next(new AppError("Please provide valid duration range", 400));
  }

  if (duration.min > duration.max) {
    return next(
      new AppError(
        "Minimum duration cannot be greater than maximum duration",
        400
      )
    );
  }

  const service = await Service.create({
    name,
    title,
    description,
    category,
    icon: icon || "wrench",
    basePrice: {
      min: parseFloat(basePrice.min),
      max: parseFloat(basePrice.max),
    },
    duration: {
      min: parseInt(duration.min),
      max: parseInt(duration.max),
    },
    requirements: requirements || [],
    includes: includes || [],
  });

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    data: service,
  });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
exports.updateService = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  const allowedUpdates = [
    "name",
    "title",
    "description",
    "category",
    "icon",
    "basePrice",
    "duration",
    "requirements",
    "includes",
    "isActive",
  ];

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Validate category if provided
  if (
    updates.category &&
    !["cleaning", "cooking", "laundry"].includes(updates.category)
  ) {
    return next(new AppError("Invalid service category", 400));
  }

  // Validate base price if provided
  if (updates.basePrice) {
    if (!updates.basePrice.min || !updates.basePrice.max) {
      return next(new AppError("Please provide valid base price range", 400));
    }
    if (updates.basePrice.min > updates.basePrice.max) {
      return next(
        new AppError("Minimum price cannot be greater than maximum price", 400)
      );
    }
  }

  // Validate duration if provided
  if (updates.duration) {
    if (!updates.duration.min || !updates.duration.max) {
      return next(new AppError("Please provide valid duration range", 400));
    }
    if (updates.duration.min > updates.duration.max) {
      return next(
        new AppError(
          "Minimum duration cannot be greater than maximum duration",
          400
        )
      );
    }
  }

  const updatedService = await Service.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Service updated successfully",
    data: updatedService,
  });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
exports.deleteService = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  await Service.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Service deleted successfully",
  });
});

// @desc    Get service categories
// @route   GET /api/services/categories
// @access  Public
exports.getServiceCategories = catchAsync(async (req, res, next) => {
  const categories = [
    {
      name: "cleaning",
      label: "Cleaning",
      description: "Professional cleaning services for homes and offices",
    },
    {
      name: "cooking",
      label: "Cooking",
      description: "Professional cooking and meal preparation services",
    },
    {
      name: "laundry",
      label: "Laundry",
      description: "Professional laundry and dry cleaning services",
    },
  ];

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// @desc    Update service popularity
// @route   PUT /api/services/:id/popularity
// @access  Private
exports.updateServicePopularity = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  service.popularity += 1;
  await service.save();

  res.status(200).json({
    success: true,
    message: "Service popularity updated",
    data: service,
  });
});

// const Service = require("../models/Service");
// const Worker = require("../models/Worker");
// const { validationResult } = require("express-validator");

// // @desc    Get all services
// // @route   GET /api/services
// // @access  Public
// exports.getServices = async (req, res) => {
//   try {
//     const {
//       category,
//       search,
//       minPrice,
//       maxPrice,
//       sortBy = "popularity",
//       page = 1,
//       limit = 10,
//     } = req.query;

//     let query = { isActive: true };

//     // Filter by category
//     if (category && category !== "all") {
//       query.category = category;
//     }

//     // Search functionality
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Price range filter
//     if (minPrice || maxPrice) {
//       query["basePrice.min"] = {};
//       if (minPrice) query["basePrice.min"].$gte = parseFloat(minPrice);
//       if (maxPrice) query["basePrice.max"] = { $lte: parseFloat(maxPrice) };
//     }

//     // Sorting
//     let sortOptions = {};
//     switch (sortBy) {
//       case "price-low":
//         sortOptions = { "basePrice.min": 1 };
//         break;
//       case "price-high":
//         sortOptions = { "basePrice.max": -1 };
//         break;
//       case "rating":
//         sortOptions = { averageRating: -1 };
//         break;
//       case "popularity":
//       default:
//         sortOptions = { popularity: -1, averageRating: -1 };
//         break;
//     }

//     const services = await Service.find(query)
//       .sort(sortOptions)
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await Service.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       services,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Get services error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching services",
//     });
//   }
// };

// // @desc    Get single service
// // @route   GET /api/services/:id
// // @access  Public
// exports.getService = async (req, res) => {
//   try {
//     const service = await Service.findById(req.params.id);

//     if (!service || !service.isActive) {
//       return res.status(404).json({
//         success: false,
//         message: "Service not found",
//       });
//     }

//     // Get available workers for this service
//     const availableWorkers = await Worker.find({
//       services: { $in: [service.name] },
//       applicationStatus: "approved",
//       isAvailable: true,
//       isVerified: true,
//     })
//       .populate("user", "name avatar location")
//       .select("hourlyRate rating stats availability")
//       .limit(5);

//     res.status(200).json({
//       success: true,
//       service,
//       availableWorkers,
//     });
//   } catch (error) {
//     console.error("Get service error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching service",
//     });
//   }
// };

// // @desc    Get service categories
// // @route   GET /api/services/categories
// // @access  Public
// exports.getServiceCategories = async (req, res) => {
//   try {
//     const categories = await Service.aggregate([
//       { $match: { isActive: true } },
//       {
//         $group: {
//           _id: "$category",
//           count: { $sum: 1 },
//           avgPrice: { $avg: "$basePrice.min" },
//           services: { $push: { name: "$name", id: "$_id" } },
//         },
//       },
//       { $sort: { count: -1 } },
//     ]);

//     res.status(200).json({
//       success: true,
//       categories,
//     });
//   } catch (error) {
//     console.error("Get service categories error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching categories",
//     });
//   }
// };

// // @desc    Get popular services
// // @route   GET /api/services/popular
// // @access  Public
// exports.getPopularServices = async (req, res) => {
//   try {
//     const { limit = 6 } = req.query;

//     const services = await Service.find({ isActive: true })
//       .sort({ popularity: -1, averageRating: -1 })
//       .limit(parseInt(limit));

//     res.status(200).json({
//       success: true,
//       services,
//     });
//   } catch (error) {
//     console.error("Get popular services error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching popular services",
//     });
//   }
// };

// // @desc    Search services
// // @route   GET /api/services/search
// // @access  Public
// exports.searchServices = async (req, res) => {
//   try {
//     const { q, category, location, page = 1, limit = 10 } = req.query;

//     if (!q || q.trim().length < 2) {
//       return res.status(400).json({
//         success: false,
//         message: "Search query must be at least 2 characters long",
//       });
//     }

//     let query = {
//       isActive: true,
//       $or: [
//         { name: { $regex: q, $options: "i" } },
//         { description: { $regex: q, $options: "i" } },
//         { includes: { $elemMatch: { $regex: q, $options: "i" } } },
//       ],
//     };

//     // Filter by category
//     if (category && category !== "all") {
//       query.category = category;
//     }

//     const services = await Service.find(query)
//       .sort({ popularity: -1, averageRating: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await Service.countDocuments(query);

//     // If location is provided, also find workers in that area
//     let nearbyWorkers = [];
//     if (location && services.length > 0) {
//       const serviceNames = services.map((s) => s.name);
//       nearbyWorkers = await Worker.find({
//         services: { $in: serviceNames },
//         applicationStatus: "approved",
//         isAvailable: true,
//       })
//         .populate("user", "name location")
//         .limit(10);
//     }

//     res.status(200).json({
//       success: true,
//       services,
//       nearbyWorkers,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Search services error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while searching services",
//     });
//   }
// };

// module.exports = exports;
