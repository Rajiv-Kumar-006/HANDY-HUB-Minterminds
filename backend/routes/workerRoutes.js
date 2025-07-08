const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const workerController = require('../controllers/workerController');
const {validateWorkerApplication} = require("../middleware/validation")
const Worker = require('../models/Worker');
const router = express.Router();

// Worker Application Routes
router.get('/config', workerController.getWorkerConfig);
router.get('/application', authMiddleware, workerController.getWorkerApplication);
router.post('/apply', authMiddleware, validateWorkerApplication, workerController.submitWorkerApplication);
router.post('/upload/id', authMiddleware, workerController.uploadIdDocument);
router.post('/upload/certifications', authMiddleware, workerController.uploadCertifications);
router.put('/draft', authMiddleware, workerController.saveApplicationDraft);
router.get('/status', authMiddleware, workerController.getApplicationStatus);

// Profile Get/Update
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const worker = await Worker.findOne({
      user: req.user.id,
      applicationStatus: 'approved',
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found or not approved',
      });
    }

    res.json({
      success: true,
      data: worker,
    });
  } catch (error) {
    console.error('Get worker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get worker profile',
    });
  }
});

router.put(
  '/profile',
  authMiddleware,
  [
    body('bio').optional().trim().isLength({ min: 50, max: 500 }),
    body('hourlyRate').optional().isFloat({ min: 10, max: 200 }),
    body('availability').optional().isArray({ min: 1 }),
    body('isAvailable').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const worker = await Worker.findOne({
        user: req.user.id,
        applicationStatus: 'approved',
      });

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker profile not found or not approved',
        });
      }

      const updateFields = ['bio', 'hourlyRate', 'availability', 'isAvailable'];
      updateFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          worker[field] = req.body[field];
        }
      });

      await worker.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: worker,
      });
    } catch (error) {
      console.error('Update worker profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
      });
    }
  }
);

// Dashboard Route
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const worker = await Worker.findOne({
      user: req.user.id,
      applicationStatus: 'approved',
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found or not approved',
      });
    }

    const dashboardData = {
      worker: {
        id: worker._id,
        fullName: worker.fullName,
        email: worker.email,
        phone: worker.phone,
        services: worker.services,
        hourlyRate: worker.hourlyRate,
        rating: worker.rating,
        isAvailable: worker.isAvailable,
        isVerified: worker.isVerified,
      },
      stats: worker.stats,
      completionRate: worker.completionRate,
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Get worker dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
    });
  }
});

module.exports = router;