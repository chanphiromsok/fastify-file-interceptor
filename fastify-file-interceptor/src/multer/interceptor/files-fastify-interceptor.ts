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
import type { FastifyMultipartOptions } from "../interface/fastify-multer-module-interface";
import { MULTER_MODULE_OPTIONS } from "../constant/multer-module-option";
import { transformException } from "../utils/multer-utils";
import { processMultipartPart } from "../utils/multipart-utils";

export function FilesFastifyInterceptor(
  fieldName: string,
  maxCount?: number,
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
      const uploadedFiles: MulterFile[] = [];

      try {
        for await (const part of request.files(parseOptions)) {
          const file = await processMultipartPart(request as FastifyRequest, part, this.options);
          if (file && part.fieldname === fieldName) {
            if (maxCount == null || uploadedFiles.length < maxCount) {
              uploadedFiles.push(file);
            }
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
