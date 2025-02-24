const { validationResult } = require("express-validator");

const validatorMiddleware =
  // middlewares => catch errors from rules if exist
  (req, res, next) => {
    //Find the validation errors in this request and wraps then in an object with hand functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ essors: errors.array() });
    }
    //3lshan yn2l 3la el route b2a lw mfesh error
    next();
  };
module.exports = validatorMiddleware;
