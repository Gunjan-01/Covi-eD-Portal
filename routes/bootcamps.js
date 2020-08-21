const express = require('express');
const router = express.Router();
const {
    getbootcamps,
    createbootcamp,
    updatebootcamps,
    deletebootcamp,
    getbootcamp,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');


// include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const advancedResults = require('../middleware/advancedResults');
const {protect, authorize} = require('../middleware/auth');

// re-route into other resource router
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/').get(advancedResults(Bootcamp, 'courses'), getbootcamps).post(protect, authorize('publisher', 'admin'), createbootcamp);

router.route('/:id').delete(protect, authorize('publisher', 'admin'), deletebootcamp).get(getbootcamp).put(protect, authorize('publisher', 'admin'), updatebootcamps);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

module.exports = router;
