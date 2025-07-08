const Service = require("../models/Service");
const Worker = require("../models/Worker");
const { validationResult } = require("express-validator");

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = "popularity",
      page = 1,
      limit = 10,
    } = req.query;

    let query = { isActive: true };

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query["basePrice.min"] = {};
      if (minPrice) query["basePrice.min"].$gte = parseFloat(minPrice);
      if (maxPrice) query["basePrice.max"] = { $lte: parseFloat(maxPrice) };
    }

    // Sorting
    let sortOptions = {};
    switch (sortBy) {
      case "price-low":
        sortOptions = { "basePrice.min": 1 };
        break;
      case "price-high":
        sortOptions = { "basePrice.max": -1 };
        break;
      case "rating":
        sortOptions = { averageRating: -1 };
        break;
      case "popularity":
      default:
        sortOptions = { popularity: -1, averageRating: -1 };
        break;
    }

    const services = await Service.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching services",
    });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Get available workers for this service
    const availableWorkers = await Worker.find({
      services: { $in: [service.name] },
      applicationStatus: "approved",
      isAvailable: true,
      isVerified: true,
    })
      .populate("user", "name avatar location")
      .select("hourlyRate rating stats availability")
      .limit(5);

    res.status(200).json({
      success: true,
      service,
      availableWorkers,
    });
  } catch (error) {
    console.error("Get service error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching service",
    });
  }
};

// @desc    Get service categories
// @route   GET /api/services/categories
// @access  Public
exports.getServiceCategories = async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$basePrice.min" },
          services: { $push: { name: "$name", id: "$_id" } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get service categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
  }
};

// @desc    Get popular services
// @route   GET /api/services/popular
// @access  Public
exports.getPopularServices = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const services = await Service.find({ isActive: true })
      .sort({ popularity: -1, averageRating: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("Get popular services error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching popular services",
    });
  }
};

// @desc    Search services
// @route   GET /api/services/search
// @access  Public
exports.searchServices = async (req, res) => {
  try {
    const { q, category, location, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
      });
    }

    let query = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { includes: { $elemMatch: { $regex: q, $options: "i" } } },
      ],
    };

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    const services = await Service.find(query)
      .sort({ popularity: -1, averageRating: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    // If location is provided, also find workers in that area
    let nearbyWorkers = [];
    if (location && services.length > 0) {
      const serviceNames = services.map((s) => s.name);
      nearbyWorkers = await Worker.find({
        services: { $in: serviceNames },
        applicationStatus: "approved",
        isAvailable: true,
      })
        .populate("user", "name location")
        .limit(10);
    }

    res.status(200).json({
      success: true,
      services,
      nearbyWorkers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search services error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching services",
    });
  }
};

module.exports = exports;
