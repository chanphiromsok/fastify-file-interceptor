import { Body, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import {
  AnyFilesFastifyInterceptor,
  FileFastifyInterceptor,
  FileFieldsFastifyInterceptor,
  FilesFastifyInterceptor,
  MulterFile,
} from "../fastify-file-interceptor/src";

@Controller()
@ApiTags("Upload")
export class AppController {
  @Post("/upload")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        title: { type: "string" },
      },
    },
  })
  @UseInterceptors(
    FileFastifyInterceptor("file", {
      limits: { fileSize: 5_000_000 },
    })
  )
  upload(@UploadedFile() file: MulterFile, @Body() body: any) {
    return {
      mode: "memory",
      uploaded: file,
      body,
    };
  }

  @Post("/upload/disk")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        title: { type: "string" },
      },
    },
  })
  @UseInterceptors(
    FileFastifyInterceptor("file", {
      limits: { fileSize: 5_000_000 },
      storage: "disk",
      destination: "./uploads",
      filename: (req, file) => `${Date.now()}-${file.originalname}`,
    })
  )
  uploadToDisk(@UploadedFile() file: MulterFile, @Body() body: any) {
    return {
      mode: "disk",
      uploaded: file,
      body,
    };
  }

  @Post("/upload/any")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: { type: "array", items: { type: "string", format: "binary" } },
        title: { type: "string" },
      },
    },
  })
  @UseInterceptors(
    AnyFilesFastifyInterceptor({
      limits: { fileSize: 5_000_000 },
    })
  )
  anyFile(@UploadedFiles() files: MulterFile[], @Body() body: any) {
    return {
      mode: "any",
      uploaded: files,
      body,
    };
  }

  @Post("/upload/multiple")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        photo_url: { type: "array", items: { type: "string", format: "binary" } },
        title: { type: "string" },
      },
    },
  })
  @UseInterceptors(
    FilesFastifyInterceptor("photo_url", 5, {
      limits: { fileSize: 5_000_000 },
    })
  )
  multipleFiles(@UploadedFiles() files: MulterFile[], @Body() body: any) {
    return {
      mode: "files",
      uploaded: files,
      body,
    };
  }

  @Post("/upload/fields")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        photo_url: { type: "array", items: { type: "string", format: "binary" } },
        images: { type: "array", items: { type: "string", format: "binary" } },
        title: { type: "string" },
      },
    },
  })
  @UseInterceptors(
    FileFieldsFastifyInterceptor(
      [
        { name: "photo_url", maxCount: 1 },
        { name: "images", maxCount: 5 },
      ],
      {
        limits: { fileSize: 5_000_000 },
      }
    )
  )
  fieldsUpload(
    @UploadedFiles() files: Record<string, MulterFile[]>,
    @Body() body: any
  ) {
    return {
      mode: "fields",
      uploaded: files,
      body,
    };
  }
}
