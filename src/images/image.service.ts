import { Injectable, NotFoundException } from '@nestjs/common';
import { createReadStream, existsSync, ReadStream } from 'fs';
import { ensureDir } from 'fs-extra';
import { unlink } from 'fs/promises';
import { join } from 'path';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
    private readonly uploadPath = join(__dirname, '..', '..', 'uploads');

    getImageStream(filename: string): { stream: ReadStream; contentType: string } {
        const filePath = join(this.uploadPath, filename);

        if (!existsSync(filePath)) {
            throw new NotFoundException('Image not found');
        }

        const ext = filename.split('.').pop()?.toLowerCase();

        const contentTypeMap: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
        };

        const contentType = contentTypeMap[ext] || 'application/octet-stream';
        const stream = createReadStream(filePath);

        return { stream, contentType };
    }

    async saveImage(
        file: Express.Multer.File | string,
        options?: {
            resize?: { width: number; height: number };
            format?: 'webp' | 'jpeg' | 'png';
            quality?: number;
        },
    ): Promise<{ fileName: string; path: string }> {
        await ensureDir(this.uploadPath);

        let buffer: Buffer;

        if (typeof file === 'string' && file.startsWith('data:image')) {
            const base64Data = file.split(';base64,').pop();
            buffer = Buffer.from(base64Data, 'base64');
        } else if (file instanceof Buffer) {
            buffer = file;
        } else if (typeof file !== 'string' && 'buffer' in file) {
            buffer = file.buffer;
        } else {
            throw new Error('Unsupported file type');
        }

        const fileExt = options?.format || 'jpeg';
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = join(this.uploadPath, fileName);
        let imageProcessor = sharp(buffer);

        if (options?.resize) {
            imageProcessor = imageProcessor.resize(
                options.resize.width,
                options.resize.height,
            );
        }

        if (options?.format === 'webp') {
            imageProcessor = imageProcessor.webp({
                quality: options.quality || 80,
            });
        } else if (options?.format === 'jpeg') {
            imageProcessor = imageProcessor.jpeg({
                quality: options.quality || 80,
            });
        } else if (options?.format === 'png') {
            imageProcessor = imageProcessor.png({ compressionLevel: 9 });
        }

        await imageProcessor.toFile(filePath);

        return {
            fileName,
            path: filePath,
        };
    }

    async deleteImage(fileName: string): Promise<void> {
        const filePath = join(this.uploadPath, fileName);
        await unlink(filePath).catch((err) => {
            if (err.code !== 'ENOENT') throw err;
        });
    }
}
