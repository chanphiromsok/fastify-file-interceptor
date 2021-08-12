import { CallHandler } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { expect } from "chai";
import { FilesFastifyInterceptor } from "../../multer/interceptor/files-fastify-interceptor";
import { of } from "rxjs";
import * as sinon from "sinon";

describe("FilesInterceptor", () => {
  it("should return metatype with expected structure", async () => {
    const targetClass = FilesFastifyInterceptor("file");
    expect(targetClass.prototype.intercept).to.not.be.undefined;
  });
  describe("intercept", () => {
    let handler: CallHandler;
    beforeEach(() => {
      handler = {
        handle: () => of("test"),
      };
    });
    it("should call array() with expected params", async () => {
      const fieldName = "file";
      const maxCount = 10;
      const target = new (FilesFastifyInterceptor(fieldName, maxCount))();

      const callback = (req, res, next) => next();
      const arraySpy = sinon
        .stub((target as any).multer, "array")
        .returns(callback);

      await target.intercept(new ExecutionContextHost([]), handler);

      expect(arraySpy.called).to.be.true;
      expect(arraySpy.calledWith(fieldName, maxCount)).to.be.true;
    });
    it("should transform exception", async () => {
      const fieldName = "file";
      const target = new (FilesFastifyInterceptor(fieldName))();
      const err = {};
      const callback = (req, res, next) => next(err);
      (target as any).multer = {
        array: () => callback,
      };
      (target.intercept(new ExecutionContextHost([]), handler) as any).catch(
        (error) => expect(error).to.not.be.undefined
      );
    });
  });
});
