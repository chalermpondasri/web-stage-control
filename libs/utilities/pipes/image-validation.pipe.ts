import { HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class ImageValidationPipe implements PipeTransform {
    private readonly _imagesMimeType = ['image/jpeg', 'image/jpg', 'image/png']
    public transform(value: Array<Express.Multer.File>) {
        if (value.length === 0) {
            return []
        }
        const isValidMimeType = value.every((e) => this._imagesMimeType.includes(e.mimetype))
        if (!isValidMimeType) {
            throw new HttpException('invalid mimetype', HttpStatus.UNSUPPORTED_MEDIA_TYPE)
        }
        const IMAGE_MAX_SIZE = 1_048_576 * 2 // 2 MB
        const isLseeThanMaxsize = value.every((e) => e.size <= IMAGE_MAX_SIZE)
        if (!isLseeThanMaxsize) {
            throw new HttpException('max size of every images is 2MB', HttpStatus.PAYLOAD_TOO_LARGE)
        }
        return value
    }
}
