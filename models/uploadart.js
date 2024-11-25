const multer = require("multer");
const crypto = require("crypto");

var fileCount = 0; // Initialize a variable to keep track of the file count

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/"); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    const filename =
      req.body.plant +
      "-" +
      crypto.randomBytes(16).toString("hex").slice(0, 16) +
      "." +
      fileExtension; // Generate a unique filename
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
}).array("files");

const middleware = function (req, res, next) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during file upload
      return res.status(500).json({ message: "File upload error" });
    } else if (err) {
      // An unknown error occurred during file upload
      return res.status(500).json({ message: "Unknown error occurred" });
    }

    // Set the file count to the number of uploaded files at the moment
    fileCount = req.files ? req.files.length : 0; // Check if req.files exist before getting the length

    next();
  });
};

const getFileCount = function () {
  return fileCount; // Return the file count
};

module.exports = {
  middleware,
  getFileCount,
};
