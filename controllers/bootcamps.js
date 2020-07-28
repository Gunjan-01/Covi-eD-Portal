const path = require('path');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');

// @desc get all bootcamps
// @routes GET  /api/v1/bootcamps
// @access PUBLIC

exports.getbootcamps = asyncHandler(async (req, res, next) => {
  let query;
  // copy querystring
  const reqQuery = {
    ...req.query,
  };

  // fields to remove
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // loop over removeFields and delete them
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(
    /\b(gte|gt|lte|lt|in)\b/g,
    (match) => `$${match}`
  );

  // finding resource
  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses       ');

  // select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
    console.log(fields);
  }
  // sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  // vars of pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);
  // executing query
  const bootcamps = await query;

  // pagination
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
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
      new ErrorResponse(`bootcamp not found with id ${req.params.id}`, 404)
    );
  }
  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});

exports.updatebootcamps = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp not found with id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc upload a photo
// @routes   /api/v1/bootcamps/:id/photo
// @access PUBLIC

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp not found with id ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`please upload a file`, 400));
  }
  console.log(req.files);
  //make sure that file is image type
  const file = req.files.file;

  if (!file.mimetype.StartsWith('image')) {
    return next(ErrorResponse(`please upload image file`));
  }
  //make sure the size of image file
  if (!file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      ErrorResponse(
        `please upload image file of size < ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  //create custom file name so as to avoid overwriting
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  console.log(file.name);
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(ErrorResponse(`problem with upload`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).jsonn({
      success: true,
      data: file.name,
    });
  });
});
