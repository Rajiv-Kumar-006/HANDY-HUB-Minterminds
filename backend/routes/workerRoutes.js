const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); 

router.get('/me', authMiddleware, getMyApplication);
router.post('/', authMiddleware, createApplication);
router.put('/', authMiddleware, updateApplication);
router.post('/submit', authMiddleware, submitApplication);
router.post('/upload', authMiddleware, upload.single('file'), uploadDocument);




// const express = require('express');
// const {
//   submitWorkerApplication,
//   uploadDocuments,
//   submitForReview,
//   getWorkerApplication,
//   updateWorkerApplication,
//   getAllWorkers,
//   updateWorkerStatus,
//   getWorkerById
// } = require('../controllers/workerController');
// const { protect, authorize } = require('../middleware/auth');
// const upload = require('../middleware/upload');

// const router = express.Router();

// // Public routes
// // None for workers

// // Protected routes (require authentication)
// router.use(protect);

// // Worker application routes
// router.post('/apply', submitWorkerApplication);
// router.post('/documents', upload.single('document'), uploadDocuments);
// router.put('/submit', submitForReview);
// router.get('/me', getWorkerApplication);
// router.put('/me', updateWorkerApplication);

// // Admin only routes
// router.use(authorize('admin'));

// router.get('/', getAllWorkers);
// router.get('/:id', getWorkerById);
// router.put('/:id/status', updateWorkerStatus);

// module.exports = router;
