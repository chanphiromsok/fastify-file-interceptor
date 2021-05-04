**Installation**

```npm install fastify-file-interceptor```
</br>
```yarn add fastify-file-interceptor```
</br>
**FastifyFileInterceptor() may not be compatible with third party cloud providers like Google Firebase or others.**
**This package is base on NestJs ,fastify-multer**

>main.ts
```javascript
import { contentParser } from 'fastify-multer';
import 'reflect-metadata';
import {FastifyAdapter,NestFastifyApplication} from '@nestjs/platform-fastify';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  //add this line
  app.register(contentParser);
}
bootstrap();
```

**Example**
>app.controller.ts
```typescript
import {FastifyFileInterceptor,FastifyFilesInterceptor,FastifyMulterFile,} from "fastify-file-interceptor"
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
import { AnyFileDto } from './dto/any-file-dto';
import { MultipleFileDto } from './dto/multiple-files-dto';
import { SingleFileDto } from './dto/single-file-dto';
import { FastifyAnyFileInterceptor } from './interceptor/fastify-any-file-interceptor';
import { FastifyFileFieldsInterceptor } from './interceptor/fastify-file-field-interceptor';
import { FastifyFileInterceptor } from './interceptor/fastify-file-interceptor';
import { FastifyFilesInterceptor } from './interceptor/fastify-files-interceptor';
import { editFileName, imageFileFilter } from './utils/file-upload-util';
import { FieldsFileDto } from './dto/fields-file-fto';

@Controller()
@ApiTags('Upload File ')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiConsumes('multipart/form-data')
  @Post('single-file')
  @UseInterceptors(
    FastifyFileInterceptor('photo_url', {
      storage: diskStorage({
        destination: './upload/single',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  single(
    @UploadedFile() file: FastifyMulterFile,
    @Body() body: SingleFileDto,
  ) {
    console.log({ ...body, file });
    return { ...body, photo_url: file };
  }

  @ApiConsumes('multipart/form-data')
  @Post('multiple-file')
  @UseInterceptors(
    FastifyFilesInterceptor('photo_url', 10, {
      storage: diskStorage({
        destination: './upload/single',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  multiple(
    @UploadedFiles() files: FastifyMulterFile[],
    @Body() body: MultipleFileDto,
  ) {
    console.log({ ...body, photo_url: files });
    return { ...body, photo_url: files };
  }



  @ApiConsumes('multipart/form-data')
  @Post('any-file')
  @UseInterceptors(
    FastifyAnyFileInterceptor({
      storage: diskStorage({
        destination: './upload/any',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  anyFile(
    @UploadedFiles() files: FastifyMulterFile[],
    @Body() body: AnyFileDto,
  ) {
    console.log({ ...body, files });
    return { ...body,photo_url: files };
  }



  @ApiConsumes('multipart/form-data')
  @Post('fields-file')
  @UseInterceptors(
    FastifyFileFieldsInterceptor(
      [
        {
          name: 'photo_url',
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
  fields(@Body() body: FieldsFileDto,
          @UploadedFiles() { photo_url } ) {
    console.log(photo_url);
    return { ...body, photo_url };
  }
}

```
**NOTE property destination inside distStorage is the location in our project directory where we want to store the image**
</br>
> -Why we using FastifyAdatper then define interface Request of Express instead FastifyRequest on @Req()  decorator ? because I wrote this package is reply on fastify-multer and fastify-multer reply on express-multer the "req" is fastify,
> another reason function fileFiler and filename inside diskStorage use Request interface Express

>file-upload-util.ts
```javascript
import { FastifyReply } from 'fastify';
import { extname } from 'path';

export const editFileName = (
  req: FastifyReply,
  file: Express.Multer.File,
  callback
) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const imageFileFilter = (
  req: FastifyReply,
  file: Express.Multer.File,
  callback
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};
```

>file-mapper.ts
```javascript
import { Request } from 'express';

interface FileMapper {
  file: Express.Multer.File;
  req: Request;
}

interface FilesMapper {
  files: Express.Multer.File[];
  req: Request;
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

**Example Source Code :** <a href="https://github.com/chanphiromsok/Fastify-Upload">https://github.com/chanphiromsok/Fastify-Upload</a>
