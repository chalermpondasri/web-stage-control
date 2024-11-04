import { ArgumentMetadata, PipeTransform } from '@nestjs/common'
import { ObjectId } from 'mongodb'

export class ObjectIdPipeTransform implements PipeTransform<string, ObjectId> {
    public transform(value: string, metadata: ArgumentMetadata): ObjectId {
        if (ObjectId.isValid(value)) {
            return new ObjectId(value)
        }
        return null
    }
}
