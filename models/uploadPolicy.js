const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// This stays below the effective Nginx request limit and above the largest
// image currently stored in production. It is a per-file limit, not a claim
// about typical uploads.
const MAX_IMAGE_FILE_SIZE = 16 * 1024 * 1024;
const MAX_FILES_PER_BATCH = 20;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const SUPPORTED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const IMAGE_EXTENSION_BY_MIME_TYPE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const IMAGE_FORMAT_BY_MIME_TYPE = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};
const UPLOAD_TEMP_DIR = path.join(__dirname, "..", "uploads");

function imageFileFilter(req, file, callback) {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const isSupported =
    SUPPORTED_IMAGE_TYPES.has(file.mimetype) &&
    SUPPORTED_IMAGE_EXTENSIONS.has(extension);

  if (isSupported) {
    return callback(null, true);
  }

  return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
}

function createImageFilename(mimetype) {
  const extension = IMAGE_EXTENSION_BY_MIME_TYPE[mimetype];
  if (!extension) {
    throw new Error("Unsupported image type");
  }

  return `${crypto.randomBytes(16).toString("hex")}${extension}`;
}

function ensureUploadTempDirectory() {
  fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true });
  return UPLOAD_TEMP_DIR;
}

function invalidImageError() {
  const error = new Error("Invalid image data");
  error.code = "INVALID_IMAGE";
  return error;
}

async function validateImageFiles(files) {
  try {
    await Promise.all(
      files.map(async (file) => {
        const metadata = await sharp(file.path).metadata();
        if (metadata.format !== IMAGE_FORMAT_BY_MIME_TYPE[file.mimetype]) {
          throw invalidImageError();
        }
      }),
    );
  } catch (_) {
    throw invalidImageError();
  }
}

function getUploadErrorResponse(error) {
  if (error?.code === "INVALID_IMAGE") {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid image upload",
      },
    };
  }

  if (!(error instanceof multer.MulterError)) {
    return null;
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return {
      status: 413,
      body: {
        success: false,
        message: "Image file is too large",
      },
    };
  }

  return {
    status: 400,
    body: {
      success: false,
      message: "Invalid image upload",
    },
  };
}

const batchImageUploadOptions = {
  limits: {
    fileSize: MAX_IMAGE_FILE_SIZE,
    files: MAX_FILES_PER_BATCH,
  },
  fileFilter: imageFileFilter,
};

module.exports = {
  MAX_FILES_PER_BATCH,
  MAX_IMAGE_FILE_SIZE,
  UPLOAD_TEMP_DIR,
  batchImageUploadOptions,
  createImageFilename,
  ensureUploadTempDirectory,
  getUploadErrorResponse,
  imageFileFilter,
  validateImageFiles,
};
