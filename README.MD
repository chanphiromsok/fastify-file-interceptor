#### Installation

This library for Nestjs applications using FastifyAdapter provides file interceptor support using @fastify/multipart. It now supports interceptor-based upload handling without relying on multer storage helpers.

#### Warning

FileFastifyInterceptor() may not be compatible with third party cloud providers like Google Firebase or others. This package now uses @fastify/multipart for Fastify file uploads.

### yarn

```shell
$ yarn add fastify-file-interceptor
```

### Example

Run the provided example app from the repository root:

```shell
npm run example:start
```

Then open Swagger UI at:

```text
http://localhost:3000/api
```

Run the example upload test:

```shell
npm run example:test
```

---

```typescript
/* main.ts */

import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { contentParser } from "fastify-file-interceptor";
import "reflect-metadata";
import { join } from "path";
import helmet from "@fastify/helmet";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const swaggerDocument = new DocumentBuilder()
  .setTitle("API")
  .setDescription("API")
  .setVersion("1.0")
  .addTag("API")
  .build();
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, "data:", "validator.swagger.io"],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });
  // yarn add @fastify/multipart
  await app.register(contentParser);
  // yarn add @fastify/static
  await app.useStaticAssets({
    root: join(__dirname, "../../example"),
  });
  // open API
  SwaggerModule.setup(
    "api",
    app,
    SwaggerModule.createDocument(app, swaggerDocument)
  );
  await app.listen(3000);
  console.log(`APP IS RUNNING ON PORT ${await app.getUrl()}/api`);
}
bootstrap();
```

```typescript
/* app.controller.ts */

import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";
import {
  MultipleFileDto,
  SingleFileDto,
  AnyFileDto,
  FieldsFileDto,
} from "./dto/re-export-dto";
import { editFileName, imageFileFilter } from "./utils/file-upload-util";
import {
  AnyFilesFastifyInterceptor,
  FileFastifyInterceptor,
  FileFieldsFastifyInterceptor,
  FilesFastifyInterceptor,
} from "fastify-file-interceptor";
@Controller()
@ApiTags("Upload File ")
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Upload single file
  @ApiConsumes("multipart/form-data")
  @Post("single-file")
  @UseInterceptors(
    FileFastifyInterceptor("photo_url", {
      limits: { fileSize: 1000000 },
      fileFilter: imageFileFilter,
    })
  )
  single(
    @UploadedFile() file: MulterFile,
    @Body() body: SingleFileDto
  ) {
    console.log({ ...body, photo_url: file });
    return { ...body, photo_url: file };
  }

  // Upload single file to disk
  @ApiConsumes("multipart/form-data")
  @Post("single-file-disk")
  @UseInterceptors(
    FileFastifyInterceptor("photo_url", {
      limits: { fileSize: 1000000 },
      storage: "disk",
      destination: "./uploads",
      filename: (req, file) => `${Date.now()}-${file.originalname}`,
      fileFilter: imageFileFilter,
    })
  )
  singleDisk(
    @UploadedFile() file: MulterFile,
    @Body() body: SingleFileDto
  ) {
    console.log({ ...body, photo_url: file });
    return { ...body, photo_url: file };
  }

  // Upload multiple file
  @ApiConsumes("multipart/form-data")
  @Post("multiple-file")
  @UseInterceptors(
    FilesFastifyInterceptor("photo_url", 10, {
      limits: { fileSize: 1000000 },
      fileFilter: imageFileFilter,
    })
  )
  multiple(
    @UploadedFiles() files: MulterFile[],
    @Body() body: MultipleFileDto
  ) {
    console.log({ ...body, photo_url: files });
    return { ...body, photo_url: files };
  }

  // Upload any file
  @ApiConsumes("multipart/form-data")
  @Post("any-file")
  @UseInterceptors(
    AnyFilesFastifyInterceptor({
      limits: { fileSize: 1000000 },
      fileFilter: imageFileFilter,
    })
  )
  anyFile(
    @UploadedFiles() files: MulterFile[],
    @Body() body: AnyFileDto
  ) {
    console.log({ ...body, photo_url: files });
    return { ...body, photo_url: files };
  }

  // Upload multiple files with different fields
  @ApiConsumes("multipart/form-data")
  @Post("fields-file")
  @UseInterceptors(
    FileFieldsFastifyInterceptor(
      [
        {
          name: "photo_url",
          maxCount: 10,
        },
        {
          name: "images",
          maxCount: 10,
        },
      ],
      {
        limits: { fileSize: 1000000 },
        fileFilter: imageFileFilter,
      }
    )
  )
  fields(@UploadedFiles() { photo_url, images }, @Body() body: FieldsFileDto) {
    console.log({ ...body, photo_url, images });
    return { ...body, photo_url, images };
  }
}
```

#### Notes : property destination inside distStorage is the location in our project directory where we want to store the image

> file-upload-util.ts

```javascript
import { FastifyRequest } from "fastify";
import { extname } from "path";

export const editFileName = (
  req: FastifyRequest,
  file: MulterFile,
  callback
) => {
  const name = file.originalname.split(".")[0];
  const fileExtName = extname(file.originalname);
  callback(null, `${name}${fileExtName}`);
};

export const imageFileFilter = (
  req: FastifyRequest,
  file: MulterFile,
  callback
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error("Only image files are allowed!"), false);
  }
  callback(null, true);
};
```

### Create url display image in browser

#### We use interface FastifyRequest

```javascript
/* file-mapper.ts */

import { FastifyRequest } from "fastify";

interface FileMapper {
  file: MulterFile;
  req: FastifyRequest;
}

interface FilesMapper {
  files: MulterFile[];
  req: FastifyRequest;
}

// file (single)
export const fileMapper = ({ file, req }: FileMapper) => {
  const image_url = `${req.protocol}://${req.headers.host}/${file.path}`;
  return {
    originalname: file.originalname,
    filename: file.filename,
    image_url,
  };
};

// files (multiple)
export const filesMapper = ({ files, req }: FilesMapper) => {
  return files.map((file) => {
    const image_url = `${req.protocol}://${req.headers.host}/${file.path}`;
    return {
      originalname: file.originalname,
      filename: file.filename,
      image_url,
    };
  });
};
```

### @nestjs/platform-fastify

```typescript

import {
  FastifyMulterModule,
  AnyFilesFastifyInterceptor,
  FileFastifyInterceptor,
  FileFieldsFastifyInterceptor,
  FilesFastifyInterceptor,
  MulterFile,
  contentParser,
} from "fastify-file-interceptor";
```

[If it useful please give me some star on github :star: :star: :star: :star: :star: ](https://www.google.com)
