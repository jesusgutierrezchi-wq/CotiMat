import multer from "multer";
import { AppError } from "../../utils/AppError";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// multer en memoria: el buffer se pasa a StorageService, que decide dónde
// persistirlo (disco local hoy, S3 mañana) sin que este middleware lo sepa.
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(AppError.badRequest("Formato de imagen no soportado (usa JPG, PNG o WEBP)"));
      return;
    }
    cb(null, true);
  },
});
