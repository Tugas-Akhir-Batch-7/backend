const ApiError = require('../helpers/api-error');

const errorHandler = (err, req, res, next) => {
  // kalo tidak ada error dia akan langsung next
  console.log('masuk helper error-handler');
  console.log(err);
  // console.log('masuk error-handler');
  // console.log('err');
  if (err instanceof ApiError) {
    console.log('masuk if');
    return res.status(err.status).json({
      success: err.success,
      message: err.message,
    });
  }
  return res.status(500).json({
    success: false,
    message: 'Something went wrong!',
  });
};

module.exports = errorHandler;
