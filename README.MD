## Installation

This libray for Nest.Js Application use FastifyAdapter that can't use 
@UseInterceptor or UploadFile decorator this package has provide same functionality as Nest.Js Application use ExpressAdaper,Now it support @UseInterceptor for upload file

### Warning
FileFastifyInterceptor() may not be compatible with third party cloud providers like Google Firebase or others ,This package is base on fastify-multer

### npm
```shell
$ npm install fastify-file-interceptor
```

### yarn
```shell
$ yarn add fastify-file-interceptor
```


 
---


```typescript
/* main.ts */

import { contentParser } from 'fastify-file-interceptor';
import 'reflect-metadata';
import { FastifyAdapter,NestFastifyApplication } from '@nestjs/platform-fastify';
import { join } from "path"

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.listen(3000);

  //add this line
  app.register(contentParser); yarn add fastify-multer
  app.useStaticAsset({root: join(__dirname,"../../example")}) yarn add fastify-static
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
  diskStorage
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
      storage: diskStorage({
        destination: "./upload/single",
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  single(
    @UploadedFile() file: Express.Multer.File,
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
      storage: diskStorage({
        destination: "./upload/multiple",
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  multiple(
    @UploadedFiles() files: Express.Multer.File[],
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
      storage: diskStorage({
        destination: "./upload/any",
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  anyFile(
    @UploadedFiles() files: Express.Multer.File,
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
        storage: diskStorage({
          destination: "./upload/fields",
          filename: editFileName,
        }),
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
import { Request } from "express";
import { extname } from "path";

export const editFileName = (
  req: Request,
  file: Express.Multer.File,
  callback
) => {
  const name = file.originalname.split(".")[0];
  const fileExtName = extname(file.originalname);
  callback(null, `${name}${fileExtName}`);
};

export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
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
  file: Express.Multer.File;
  req: FastifyRequest;
}

interface FilesMapper {
  files: Express.Multer.File[];
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

**Usage**

### @nestjs/platform-fastify
```typescript
 
import {
  FastifyMulterModule,
  AnyFilesFastifyInterceptor,
  FileFastifyInterceptor,
  FileFieldsFastifyInterceptor,
  FilesFastifyInterceptor,
  diskStorage, 
  memoryStorage,
  MulterFile
  contentParser
} from "fastify-file-interceptor";
```




### @nestjs/platform-express
```typescript

import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from "@nestjs/platform-express";
```

#### you can install example test on swagger