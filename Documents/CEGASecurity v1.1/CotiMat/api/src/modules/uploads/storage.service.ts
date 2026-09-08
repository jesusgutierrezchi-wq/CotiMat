import fs from "node:fs";
import path from "node:path";
import { env } from "../../config/env";

/**
 * Abstracción de almacenamiento de archivos (imágenes de materiales).
 *
 * MVP: implementación en disco local, servida como estático desde `/uploads`
 * (ver app.ts) y persistida vía volumen Docker. Para migrar a S3 (u otro), basta
 * con implementar `StorageService` en una nueva clase y cambiar la instancia
 * exportada abajo — routes/controllers no conocen el detalle de almacenamiento.
 */
export interface StorageService {
  /** Guarda el buffer y devuelve la URL pública relativa para persistir en BD. */
  saveImage(fileName: string, buffer: Buffer): Promise<string>;
  deleteImage(publicUrl: string): Promise<void>;
}

class LocalDiskStorageService implements StorageService {
  private readonly uploadsDir = path.resolve(process.cwd(), env.UPLOADS_DIR);

  constructor() {
    fs.mkdirSync(this.uploadsDir, { recursive: true });
  }

  async saveImage(fileName: string, buffer: Buffer): Promise<string> {
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    fs.writeFileSync(path.join(this.uploadsDir, safeName), buffer);
    return `/uploads/${safeName}`;
  }

  async deleteImage(publicUrl: string): Promise<void> {
    const fileName = publicUrl.replace(/^\/uploads\//, "");
    const filePath = path.join(this.uploadsDir, fileName);
    fs.rm(filePath, { force: true }, () => {});
  }
}

export const storageService: StorageService = new LocalDiskStorageService();
