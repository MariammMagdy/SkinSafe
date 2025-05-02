const formidable = require("formidable");

// ميدل وير لاستقبال الفورم داتا
const parseFormData = (req, res, next) => {
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: "Error parsing form data", err });
    }
    req.body = fields;
    req.files = files;
    next();
  });
};

module.exports = parseFormData;
