import { IsDefined, IsString, MinLength } from 'class-validator'

export class SearchSuggestionRequest {
    @IsString()
    @IsDefined()
    @MinLength(1)
    public keyword: string
}
