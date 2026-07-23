const multer = require("multer");
const fs = require("fs").promises;
const {
  MAX_FILES_PER_BATCH,
  batchImageUploadOptions,
  createImageFilename,
  ensureUploadTempDirectory,
  getUploadErrorResponse,
} = require("./uploadPolicy");

var fileCount = 0; // Initialize a variable to keep track of the file count

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      cb(null, ensureUploadTempDirectory());
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      cb(null, createImageFilename(file.mimetype));
    } catch (error) {
      cb(error);
    }
  },
});

const upload = multer({
  storage: storage,
  ...batchImageUploadOptions,
}).array("files", MAX_FILES_PER_BATCH);

const middleware = function (req, res, next) {
  upload(req, res, async function (err) {
    if (err) {
      await Promise.all(
        (req.files || []).map((file) => fs.unlink(file.path).catch(() => {})),
      );
    }

    const uploadError = getUploadErrorResponse(err);
    if (uploadError) {
      return res.status(uploadError.status).json(uploadError.body);
    }

    if (err) {
      console.error("Image upload middleware failed");
      return res.status(500).json({
        success: false,
        message: "Unable to process image upload",
      });
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
