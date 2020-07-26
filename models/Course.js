const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({

    title: {
        type: String,
        required: [
            true, 'please add title'
        ],
        trim: true
    },

    description: {
        type: String,
        required: [true, 'please give description about the course']
        // ,
        // maxlength: [50, 'not more than 50 words']

    },

    weeks: {
        type: Number,
        required: [true, 'please add no. of weeks required for completion']
    },

    tuition: {
        type: Number,
        required: [true, 'please add tuition fees']

    },

    minimumSkill: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced']
    },

    scholarshipsAvailable: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    }

});
module.exports = mongoose.model('Course', CourseSchema);
