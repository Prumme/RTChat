// src/minio/minio.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class MinioService implements OnModuleInit {
  private s3: S3Client;
  private readonly bucket = 'avatars';

  constructor() {
    this.s3 = new S3Client({
      region: 'us-east-1',
      endpoint: 'http://minio:9000',
      credentials: {
        accessKeyId: 'admin',
        secretAccessKey: 'admin123',
      },
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      console.log(`ℹ️ Bucket ${this.bucket} déjà existant`);
    } catch {
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      console.log(`✅ Bucket ${this.bucket} créé`);
    }
  }

  async getFileStream(
    filename: string,
  ): Promise<{ stream: Readable; contentType: string }> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filename,
    });

    const response = await this.s3.send(command);

    return {
      stream: response.Body as Readable,
      contentType: response.ContentType || 'application/octet-stream',
    };
  }

  async uploadFile(file: Express.Multer.File) {
    const stream = Readable.from(file.buffer);

    const originalName = file.originalname;
    const extension = extname(originalName);
    const filename = `${uuidv4()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: stream,
      ContentType: file.mimetype,
      ContentLength: file.buffer.length,
      ACL: 'public-read',
    });

    await this.s3.send(command);

    return filename;
  }
}
