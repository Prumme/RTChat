import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { MinioService } from '../files/minio.service';
import { Response } from 'express';
import { UserService } from 'src/users/users.service';
import { User as UserDecorator } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user';
import { Public } from 'src/common/decorators/public.decorators';

@Controller('avatar')
export class AvatarController {
  constructor(
    private readonly minioService: MinioService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Get(':filename')
  async serveAvatar(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const { stream, contentType } =
        await this.minioService.getFileStream(filename);

      res.set({
        'Content-Type': contentType,
      });

      stream.pipe(res);
    } catch (err) {
      throw new NotFoundException('Fichier introuvable');
    }
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @UserDecorator() user: User,
  ) {
    const filename = await this.minioService.uploadFile(file);

    //update user avatar
    return await this.userService.update(user.id, { avatar: filename });
  }
}
