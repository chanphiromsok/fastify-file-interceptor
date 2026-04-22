import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { tmpdir } from "os";
import { pipeline } from "stream/promises";
import { FastifyRequest } from "fastify";
import type { MultipartFile } from "@fastify/multipart";
import type { FastifyMultipartOptions } from "../interface/fastify-multer-module-interface";
import type { MulterFile } from "../interface/fastify-multer-interface";

export async function drainStream(stream: NodeJS.ReadableStream): Promise<void> {
  return new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.on("end", resolve);
    stream.resume();
  });
}

function buildMulterFile(
  part: MultipartFile,
  info: {
    size?: number;
    buffer?: Buffer;
  }
): MulterFile {
  const file: MulterFile = {
    fieldname: part.fieldname,
    originalname: part.filename,
    encoding: part.encoding,
    mimetype: part.mimetype,
    size: info.size ?? info.buffer?.length ?? 0,
    stream: part.file,
    buffer: info.buffer,
    filename: part.filename,
  };

  return file;
}

export async function processMultipartPart(
  req: FastifyRequest,
  part: MultipartFile,
  options?: FastifyMultipartOptions
): Promise<MulterFile | null> {
  const file: MulterFile = {
    fieldname: part.fieldname,
    originalname: part.filename,
    encoding: part.encoding,
    mimetype: part.mimetype,
    stream: part.file,
    filename: part.filename,
  };

  if (options?.fileFilter) {
    const accepted = await new Promise<boolean>((resolve, reject) => {
      options.fileFilter!(req, file, (error, acceptFile) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(acceptFile === undefined ? true : acceptFile);
      });
    });

    if (!accepted) {
      await drainStream(part.file);
      return null;
    }
  }

  const storage = options?.storage ?? (options?.destination ? "disk" : "memory");
  if (storage === "disk") {
    const destination = typeof options?.destination === "function"
      ? options.destination(req, file)
      : options?.destination || tmpdir();

    const filename = typeof options?.filename === "function"
      ? options.filename(req, file)
      : file.filename || file.originalname || `${Date.now()}-${Math.random()}`;

    const filepath = join(destination, filename);
    await mkdir(dirname(filepath), { recursive: true });

    const writeStream = createWriteStream(filepath);
    await pipeline(part.file, writeStream);

    return {
      ...file,
      destination,
      path: filepath,
      size: writeStream.bytesWritten,
    };
  }

  const buffer = await part.toBuffer();
  return buildMulterFile(part, { buffer, size: buffer.length });
}
