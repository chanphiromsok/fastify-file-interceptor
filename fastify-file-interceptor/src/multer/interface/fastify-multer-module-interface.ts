import type { FastifyRequest } from "fastify";
import type { Type } from "@nestjs/common";
import type { ModuleMetadata } from "@nestjs/common/interfaces";
import type { MulterFile } from "./fastify-multer-interface";

export interface FastifyMultipartLimits {
  fieldNameSize?: number;
  fieldSize?: number;
  fields?: number;
  fileSize?: number;
  files?: number;
  headerPairs?: number;
  parts?: number;
}

export interface FastifyMultipartOptions {
  limits?: FastifyMultipartLimits;
  storage?: "memory" | "disk";
  destination?: string | ((req: FastifyRequest, file: MulterFile) => string);
  filename?: (req: FastifyRequest, file: MulterFile) => string;
  fileFilter?: (
    req: FastifyRequest,
    file: MulterFile,
    callback: (error: Error | null, acceptFile: boolean) => void
  ) => void;
}

export interface Field {
  name: string;
  maxCount?: number;
}

export type MulterModuleOptions = FastifyMultipartOptions;

export interface FastifyMulterOptionsFactory {
  createMulterOptions(): Promise<MulterModuleOptions> | MulterModuleOptions;
}

export interface FastifyMulterModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports"> {
  useExisting?: Type<FastifyMulterOptionsFactory>;
  useClass?: Type<FastifyMulterOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MulterModuleOptions> | MulterModuleOptions;
  inject?: any[];
}
