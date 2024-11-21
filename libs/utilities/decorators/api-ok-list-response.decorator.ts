import {
    applyDecorators,
    Type,
} from '@nestjs/common'
import {
    ApiExtraModels,
    ApiOkResponse,
    getSchemaPath,
} from '@nestjs/swagger'
import { ListResponse } from '@libs/common/models'

export const ApiOkListResponse = <DataDto extends Type<unknown>>(dataDto: DataDto) =>
    applyDecorators(
        ApiExtraModels(ListResponse, dataDto),
        ApiOkResponse({
            schema: {
                allOf: [
                    { $ref: getSchemaPath(ListResponse) },
                    {
                        properties: {
                            data: {
                                type: 'array',
                                items: { $ref: getSchemaPath(dataDto) },
                            },
                        },
                    },
                ],
            },
        }),
    )