import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { FileSizeValidationPipe } from './file-size-validation.pipe';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      fs.mkdirSync(path.join(process.cwd(), 'uploads'));
    } catch (err) {}

    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname;
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});
const uploadOptions: MulterOptions = { dest: 'uploads', storage };

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        exceptionFactory(error) {
          return new HttpException(error, HttpStatus.BAD_REQUEST);
        },
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 }),
          new FileTypeValidator({ fileType: 'image/png' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body,
  ) {
    console.log(`Reqest body: ${JSON.stringify(body, null, 2)}`);
    console.log(`Reqest file: ${JSON.stringify(file, null, 2)}`);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10, uploadOptions))
  uploadMultiFiles(
    @UploadedFiles(FileSizeValidationPipe) files: Array<Express.Multer.File>,
    @Body() body,
  ) {
    console.log(`Reqest body: ${JSON.stringify(body, null, 2)}`);
    console.log(`Reqest files: ${JSON.stringify(files, null, 2)}`);
  }

  @Post('upload-multiple-with-specified-fields')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'a-type-files', maxCount: 2 },
        { name: 'b-type-files', maxCount: 3 },
      ],
      uploadOptions,
    ),
  )
  uploadMultiFilesWithSpecifiedFields(
    @UploadedFiles(FileSizeValidationPipe)
    files: {
      'a-type-files'?: Array<Express.Multer.File>;
      'b-type-files'?: Array<Express.Multer.File>;
    },
    @Body() body,
  ) {
    console.log(`Reqest body: ${JSON.stringify(body, null, 2)}`);
    console.log(`Reqest files: ${JSON.stringify(files, null, 2)}`);
  }

  @Post('upload-multiple-with-fields')
  @UseInterceptors(AnyFilesInterceptor(uploadOptions))
  uploadMultiFilesWithFields(
    @UploadedFiles(FileSizeValidationPipe)
    files: Array<Express.Multer.File>,
    @Body() body,
  ) {
    console.log(`Reqest body: ${JSON.stringify(body, null, 2)}`);
    console.log(`Reqest files: ${JSON.stringify(files, null, 2)}`);
  }
}
