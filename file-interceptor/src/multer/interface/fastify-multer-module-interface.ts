import { Type } from "@nestjs/common";
import { ModuleMetadata } from "@nestjs/common/interfaces";
import { Options } from "multer";

export type MulterModuleOptions = Options;

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
