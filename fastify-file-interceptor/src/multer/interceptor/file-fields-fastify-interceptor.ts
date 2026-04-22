import {
  CallHandler,
  ExecutionContext,
  Inject,
  mixin,
  NestInterceptor,
  Optional,
  Type,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import type { FastifyRequest } from "fastify";
import type { MulterFile } from "../interface/fastify-multer-interface";
import type { FastifyMultipartOptions, Field } from "../interface/fastify-multer-module-interface";
import { MULTER_MODULE_OPTIONS } from "../constant/multer-module-option";
import { transformException } from "../utils/multer-utils";
import { processMultipartPart } from "../utils/multipart-utils";

export function FileFieldsFastifyInterceptor(
  fields: ReadonlyArray<Field>,
  localOptions: FastifyMultipartOptions = {}
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    protected options: FastifyMultipartOptions;

    constructor(
      @Optional()
      @Inject(MULTER_MODULE_OPTIONS)
      options: FastifyMultipartOptions
    ) {
      this.options = { ...(options || {}), ...localOptions };
    }

    async intercept(
      context: ExecutionContext,
      next: CallHandler
    ): Promise<Observable<any>> {
      const ctx = context.switchToHttp();
      const request = ctx.getRequest() as any;
      const parseOptions = { limits: this.options?.limits } as any;
      const uploadedFiles: Record<string, MulterFile[]> = {};

      fields.forEach((field) => {
        uploadedFiles[field.name] = [];
      });

      try {
        for await (const part of request.files(parseOptions)) {
          const file = await processMultipartPart(request as FastifyRequest, part, this.options);
          if (!file) {
            continue;
          }

          const target = uploadedFiles[part.fieldname];
          const fieldConfig = fields.find((field) => field.name === part.fieldname);
          if (!target || !fieldConfig) {
            continue;
          }

          if (fieldConfig.maxCount == null || target.length < fieldConfig.maxCount) {
            target.push(file);
          }
        }
      } catch (err: any) {
        const error = transformException(err);
        return Promise.reject(error);
      }

      const anyRequest = request as any;
      anyRequest.files = uploadedFiles;
      if (anyRequest.raw) {
        anyRequest.raw.files = uploadedFiles;
      }

      return next.handle();
    }
  }

  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
}
