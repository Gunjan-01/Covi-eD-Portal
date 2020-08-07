const advancedResults = (model, populate) => async (req, res, next) => { // copy querystring
    const reqQuery = {
        ...req.query
    };

    // fields to remove
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // loop over removeFields and delete them
    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => `$${match}`);

    // finding resource
    query = model.find(JSON.parse(queryStr));

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
    const total = await model.countDocuments();


    query = query.skip(startIndex).limit(limit);


    if (populate) {
        query = query.populate(populate);
    }
    // executing query
    const results = await query;

    // pagination
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results

    }
    next();
}
module.exports = advancedResults;
