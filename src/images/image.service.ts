import { Injectable } from '@nestjs/common';
import { ensureDir } from 'fs-extra';
import { unlink } from 'fs/promises';
import { join } from 'path';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
    private readonly uploadPath = join(__dirname, '..', '..', 'uploads');

    // Save image, accepting base64 string or file object
    async saveImage(
        file: Express.Multer.File | string,
        options?: {
            resize?: { width: number; height: number };
            format?: 'webp' | 'jpeg' | 'png';
            quality?: number;
        },
    ): Promise<{ fileName: string; path: string }> {
        // Ensure upload directory exists
        await ensureDir(this.uploadPath);

        let buffer: Buffer;

        if (typeof file === 'string' && file.startsWith('data:image')) {
            // Convert base64 string to buffer if it's a base64 image
            const base64Data = file.split(';base64,').pop();
            buffer = Buffer.from(base64Data, 'base64');
        } else if (file instanceof Buffer) {
            // If it's already a Buffer, use it directly
            buffer = file;
        } else if (typeof file !== 'string' && 'buffer' in file) {
            // If it's a Multer file, use the file buffer
            buffer = file.buffer;
        } else {
            throw new Error('Unsupported file type');
        }

        // Generate unique filename
        const fileExt = options?.format || 'jpeg'; // Default to jpeg if not provided
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = join(this.uploadPath, fileName);

        // Process image if options provided
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

        // Save processed image
        await imageProcessor.toFile(filePath);

        return {
            fileName,
            path: filePath,
        };
    }

    // Delete the image by filename
    async deleteImage(fileName: string): Promise<void> {
        const filePath = join(this.uploadPath, fileName);
        await unlink(filePath).catch((err) => {
            if (err.code !== 'ENOENT') throw err; // Ignore if file doesn't exist
        });
    }
}
