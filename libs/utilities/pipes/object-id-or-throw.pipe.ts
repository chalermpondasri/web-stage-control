import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common'
import { ObjectId } from 'mongodb'

export class ObjectIdOrThrowPipeTransform implements PipeTransform<string, ObjectId> {
    public transform(value: string, metadata: ArgumentMetadata): ObjectId {
        if (!ObjectId.isValid(value)) {
            throw new BadRequestException(`${metadata?.data} should be an object-id`)
        }
        return new ObjectId(value)
    }
}
