import { CallHandler } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { expect } from "chai";
import { AnyFilesFastifyInterceptor } from "fastify-file-interceptor/src/multer/interceptor/any-file-fastify-interceptor";
import { of } from "rxjs";
import * as sinon from "sinon";

describe("FilesInterceptor", () => {
  it("should return metatype with expected structure", async () => {
    const targetClass = AnyFilesFastifyInterceptor();
    expect(targetClass.prototype.intercept).to.not.be.undefined;
  });
  describe("intercept", () => {
    let handler: CallHandler;
    beforeEach(() => {
      handler = {
        handle: () => of("test"),
      };
    });
    it("should call any() with expected params", async () => {
      const target = new (AnyFilesFastifyInterceptor())();

      const callback = (req, res, next) => next();
      const arraySpy = sinon
        .stub((target as any).multer, "any")
        .returns(callback);

      await target.intercept(new ExecutionContextHost([]), handler);

      expect(arraySpy.called).to.be.true;
      expect(arraySpy.calledWith()).to.be.true;
    });
    it("should transform exception", async () => {
      const target = new (AnyFilesFastifyInterceptor())();
      const err = {};
      const callback = (req, res, next) => next(err);
      (target as any).multer = {
        any: () => callback,
      };
      (target.intercept(new ExecutionContextHost([]), handler) as any).catch(
        (error) => expect(error).to.not.be.undefined
      );
    });
  });
});
