const path = require('path');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');

// @desc get all bootcamps
// @routes GET  /api/v1/bootcamps
// @access PUBLIC

exports.getbootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
exports.getbootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp not found with id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});
// @desc create new bootcamps
// @routes POST  /api/v1/bootcamps/:id
// @access PUBLIC

exports.createbootcamp = asyncHandler(async (req, res, next) => {
  // add user to req.body
  req.body.user = req.user.id;

  // check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // if user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `THe user with id ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({ sucess: true, data: bootcamp });
});

// @desc delete  bootcamp
// @routes   /api/v1/bootcamps/:id
// @access PUBLIC

exports.deletebootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  //make sure user is bootcmp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this bootcamp`,
        401
      )
    );
  }

  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc update  bootcamp
// @routes   /api/v1/bootcamps/:id
// @access Private

exports.updatebootcamps = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.params.id} is not authorize to this update`,
        401
      )
    );
  }

  //update
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    sucess: true,
    data: bootcamp,
  });
});

// @desc upload a photo
// @routes   /api/v1/bootcamps/:id/photo
// @access PUBLIC

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`please upload a file`, 400));
  }
  console.log(req.files);
  // make sure that file is image type
  const file = req.files.file;

  if (!file.mimetype.StartsWith('image')) {
    return next(ErrorResponse(`please upload image file`));
  }
  // make sure the size of image file
  if (!file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      ErrorResponse(
        `please upload image file of size < ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // create custom file name so as to avoid overwriting
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  console.log(file.name);
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(ErrorResponse(`problem with upload`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).jsonn({ success: true, data: file.name });
  });
});
