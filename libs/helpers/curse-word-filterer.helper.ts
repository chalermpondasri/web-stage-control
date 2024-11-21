import en from 'assets/en.json'
import BadWordsNext from 'bad-words-next'
import fs from 'fs'
import path from 'path'
import thaiCut from 'thai-cut-slim'

export class CurseWordFilterer {
    private static _instance: CurseWordFilterer
    private _thWords: string[] = []
    private _thCurseWords: string[] = []
    public badwords: BadWordsNext

    private constructor() {
        this._initializeFilters()
        this._loadThaiWords()
        this._loadThaiCurseWords()
    }

    static getInstance(): CurseWordFilterer {
        if (!CurseWordFilterer._instance) {
            CurseWordFilterer._instance = new CurseWordFilterer()
        }
        return CurseWordFilterer._instance
    }

    private _initializeFilters() {
        if (!this.badwords) this.badwords = new BadWordsNext({ data: en })
    }

    private _loadThaiWords() {
        if (this._thWords.length > 0) {
            return
        }

        this._thWords = fs
            .readFileSync(path.join('assets', 'words_th.txt'), {
                encoding: 'utf-8',
            })
            .split(/[\r\n]+/)
            .filter(function (w) {
                return w.length > 1
            })

        thaiCut.addon(this._thWords)
    }

    private _loadThaiCurseWords() {
        if (this._thCurseWords.length > 0) {
            return
        }

        this._thCurseWords = fs
            .readFileSync(path.join('assets', 'curse_words_th.txt'), {
                encoding: 'utf-8',
            })
            .split(/[\r\n]+/)
            .filter(function (w) {
                return w.length > 1
            })
    }

    public censorThaiCurseWords(message: string): string {
        const words = thaiCut.cut(message)
        words.forEach((word) => {
            if (this._thCurseWords.includes(word)) {
                message = message.replace(new RegExp(word, 'g'), '***')
            }
        })

        return message
    }

    public censorEnglishCurseWords(message: string): string {
        return this.badwords.filter(message)
    }
}
