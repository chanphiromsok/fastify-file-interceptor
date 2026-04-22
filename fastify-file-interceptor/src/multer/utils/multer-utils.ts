import {
  BadRequestException,
  HttpException,
  PayloadTooLargeException,
} from "@nestjs/common";

export function transformException(error: Error | undefined) {
  if (!error || error instanceof HttpException) {
    return error;
  }

  switch (error.name) {
    case "RequestFileTooLargeError":
      return new PayloadTooLargeException(error.message);
    case "FilesLimitError":
    case "FieldsLimitError":
    case "PartsLimitError":
    case "PrototypeViolationError":
    case "InvalidMultipartContentTypeError":
      return new BadRequestException(error.message);
  }

  return error;
}
