import {
    Logger,
    LoggerService,
    Provider,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import BadWordsNext, { Data } from 'bad-words-next'
import fs from 'fs'
import path from 'path'
import thaiCut from 'thai-cut-slim'
import en from '../../assets/en.json'
import {
    from,
    Observable,
    of,
    reduce,
    tap,
} from 'rxjs'

export interface IBadWordService {
    censorThaiCurseWords(text: string): Observable<string>

    censorEnglishCurseWords(text: string): Observable<string>
}

export class BadWordService implements IBadWordService {
    private _badWords: BadWordsNext
    private _thWords: string[] = []
    private readonly _logger: LoggerService

    constructor() {
        this._logger = new Logger('BadWord')
        this._badWords = new BadWordsNext()
        this._badWords.add(en)
        this._loadThaiWords()
    }

    private _loadThaiWords() {
        this._thWords = fs
            .readFileSync(path.join('assets', 'words_th.txt'), {
                encoding: 'utf-8',
            })
            .split(/[\r\n]+/)
            .filter((w) => {
                return w.length > 1
            })
        thaiCut.addon(this._thWords)
        const badWordsThai = fs
            .readFileSync(path.join('assets', 'curse_words_th.txt'), {
                encoding: 'utf-8',
            })
            .split(/[\r\n]+/)
            .filter(function(w) {
                return w.length > 1
            })
        const extraWord = [
            '*เย็ด',
            '*เหี้ย',
            '*ควย*',
            '*สัส*',
            '*ขี้',
            'อี+เย็ด',
        ]
        const dataTH: Data = {
            id: 'th',
            words: [ ...badWordsThai, ...extraWord],
            lookalike: {
                'x': 'ห',
                'l': 'เ',
                'll': 'แ',
                'i': 'เ',
                'e': 'อี',
                'E': 'อี',
                'o': 'อ',
                'n': 'ท',
                'N': 'ท',
            },
        }
        this._badWords.add(dataTH)
    }

    public censorThaiCurseWords(message: string): Observable<string> {
        const words = thaiCut.cut(message) as string[]
        const startTime = new Date()
        this._logger.debug(`Start censor : ${startTime.toISOString()}`)
        return from(words).pipe(
            reduce((acc, value) => {
                const newText = this._badWords.filter(value)
                if (newText !== value) {
                    acc = message.replace(new RegExp(value, 'g'), newText)
                }
                return this._badWords.filter(acc)
            }, ''),
            tap(() => {
                const endTime = new Date()
                this._logger.debug(`End censor : ${endTime.toISOString()} : Using time : ${endTime.valueOf() - startTime.valueOf()} ms`)
            }),
        )
    }

    public censorEnglishCurseWords(message: string): Observable<string> {
        const messageFilter = this._badWords.filter(message)
        return of(messageFilter)
    }

}

export const badWordProvider: Provider = {
    provide: ProviderName.BAD_WORD_SERVICE,
    useFactory: () => {
        return new BadWordService()
    },
}