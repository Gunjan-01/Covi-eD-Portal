const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'please add title'],
    trim: true,
  },

  description: {
    type: String,
    required: [true, 'please give description about the course'],
    // ,
    // maxlength: [50, 'not more than 50 words']
  },

  weeks: {
    type: Number,
    required: [true, 'please add no. of weeks required for completion'],
  },

  tuition: {
    type: Number,
    required: [true, 'please add tuition fees'],
  },

  minimumSkill: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
  },

  scholarshipsAvailable: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});
// Static method to get average oc course tuition

CourseSchema.statics.getAverageCost = async function (bootcampId) {
  // console.log('calculating average cost......');

  const obj = await this.aggregate([
    {
      $match: {
        bootcamp: bootcampId,
      },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: {
          $avg: '$tuition',
        },
      },
    },
  ]);
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.error(err);
  }
};

// call getAverage after save
CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});
// call getAverage before SAve
CourseSchema.post('remove', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
