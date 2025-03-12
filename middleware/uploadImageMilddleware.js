const multer = require("multer");
const ApiError = require("../utils/apiError");

const multerOptions = () => {
  const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image")) {
        return cb(new ApiError("Only Image allowed", 400), false);
      }
      cb(null, true);
    },
  });
  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName); //single file

exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields); // single or multi array
