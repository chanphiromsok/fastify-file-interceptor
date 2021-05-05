**Installation**

```npm install fastify-file-interceptor```
</br>
```yarn add fastify-file-interceptor```
</br>
**FileFastifyInterceptor() may not be compatible with third party cloud providers like Google Firebase or others.**
**This package is base on NestJs ,fastify-multer**

>main.ts
```javascript
you can import from both source
1- import { contentParser } from 'fastify-multer';
2- import { contentParser } from 'fastify-file-interceptor';

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


**Example
NOTE diskStorage you can import from "multer" or "fastify-file-interceptor" is the same**
>app.controller.ts
```typescript
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { AppService } from './app.service';
import {
  MultipleFileDto,
  SingleFileDto,
  AnyFileDto,
  FieldsFileDto,
} from './dto/re-export-dto';
import { editFileName, imageFileFilter } from './utils/file-upload-util';
import {
  AnyFilesFastifyInterceptor,
  FileFastifyInterceptor,
  FileFieldsFastifyInterceptor,
  FilesFastifyInterceptor,
} from 'fastify-file-interceptor';
@Controller()
@ApiTags('Upload File ')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiConsumes('multipart/form-data')
  @Post('single-file')
  @UseInterceptors(
    FileFastifyInterceptor('photo_url', {
      storage: diskStorage({
        destination: './upload/single',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  single(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: SingleFileDto,
  ) {
    console.log({ ...body, photo_url: file });
    return { ...body, photo_url: file };
  }

  @ApiConsumes('multipart/form-data')
  @Post('multiple-file')
  @UseInterceptors(
    FilesFastifyInterceptor('photo_url', 10, {
      storage: diskStorage({
        destination: './upload/multiple',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  multiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: MultipleFileDto,
  ) {
    console.log({ ...body, photo_url: files });
    return { ...body, photo_url: files };
  }

  @ApiConsumes('multipart/form-data')
  @Post('any-file')
  @UseInterceptors(
    AnyFilesFastifyInterceptor({
      storage: diskStorage({
        destination: './upload/any',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  anyFile(
    @UploadedFiles() files: Express.Multer.File,
    @Body() body: AnyFileDto,
  ) {
    console.log({ ...body, photo_url: files });
    return { ...body, photo_url: files };
  }

  @ApiConsumes('multipart/form-data')
  @Post('fields-file')
  @UseInterceptors(
    FileFieldsFastifyInterceptor(
      [
        {
          name: 'photo_url',
          maxCount: 10,
        },
        {
          name: 'images',
          maxCount: 10,
        },
      ],
      {
        storage: diskStorage({
          destination: './upload/fields',
          filename: editFileName,
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  fields(@UploadedFiles() { photo_url, images }, @Body() body: FieldsFileDto) {
    console.log({ ...body, photo_url, images });
    return { ...body, photo_url, images };
  }
}


```
**NOTE property destination inside distStorage is the location in our project directory where we want to store the image**
</br>
> -Why we using FastifyAdatper then define interface Request of Express instead FastifyRequest on @Req()  decorator ? because I wrote this package is reply on fastify-multer and fastify-multer reply on express-multer the "req" is fastify,
> another reason function fileFiler and filename inside diskStorage use Request interface Express

>file-upload-util.ts
```javascript
import { Request } from 'express';
import { extname } from 'path';

export const editFileName = (
  req: Request,
  file: Express.Multer.File,
  callback
) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  callback(null, `${name}${fileExtName}`);
};

export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};
```
**If you want to create as CDN from for image and display in browser look at this**
**This page we use interface FastifyRequest  instead of interface Request Express because out application use FastifyAdapter and request object is fastify not express**
>file-mapper.ts
```javascript
import { FastifyRequest } from 'fastify';

interface FileMapper {
  file: Express.Multer.File;
  req: FastifyRequest;
}

interface FilesMapper {
  files: Express.Multer.File[];
  req: FastifyRequest;
}

export const fileMapper = ({ file, req }: FileMapper) => {
  const image_url = `${req.protocol}://${req.headers.host}/${file.path}`;
  return {
    originalname: file.originalname,
    filename: file.filename,
    image_url,
  };
};

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
```typescript
"fastify-file-interceptor"
import {
  AnyFilesFastifyInterceptor,
  FileFastifyInterceptor,
  FileFieldsFastifyInterceptor,
  FilesFastifyInterceptor,
} from 'fastify-file-interceptor';
```
```typescript
"fastify-file-interceptor" using same as  "@nestjs/platform-express" a little different with some interface more document on Nest official page
```

```typescript
"@nestjs/platform-express"
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from "@nestjs/platform-express";
```

**you can install example test on swagger**
**Example** <a href="https://github.com/chanphiromsok/exmaple-fastify-file-interceptor">https://github.com/chanphiromsok/exmaple-fastify-file-interceptor</a>
**I hope creator NestJs add this feature to "@nestjs/platform-fastify"**
