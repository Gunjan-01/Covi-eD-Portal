const express = require('express');
const router = express.Router();
const {
    getbootcamps,
    createbootcamp,
    updatebootcamps,
    deletebootcamp,
    getbootcamp
} = require('../controllers/bootcamps');

// include other resource routers
const courseRouter = require('./courses');

// re-route into other resource router
router.use('/:bootcampId/courses', courseRouter);

router.route('/').get(getbootcamps).post(createbootcamp);

router.route('/:id').delete(deletebootcamp).get(getbootcamp).put(updatebootcamps);


module.exports = router;
