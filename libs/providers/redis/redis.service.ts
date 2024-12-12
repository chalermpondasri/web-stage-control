import { RedisClientType, SetOptions } from '@redis/client'
import { isNil, set } from 'lodash'
import { Observable, Subject, catchError, from, map, mergeMap, of } from 'rxjs'
import { ICacheService } from './redis.interface'

export class RedisService implements ICacheService {
    private readonly _ttl: number = 1800
    public constructor(private readonly _redisClient: RedisClientType) {}

    public scan<T>(pattern: string): Observable<{ key: string; data: T }> {
        this._redisClient.scanIterator({ MATCH: pattern })

        const subject = new Subject<{ key: string; data: T }>()
        const asyncIteration = async () => {
            for await (const key of this._redisClient.scanIterator({ MATCH: pattern })) {
                const data: T = await this._get(key)
                const result: { key: string; data: T } = {
                    key,
                    data,
                }
                subject.next(result)
            }

            subject.complete()
        }
        asyncIteration()

        return subject
    }

    public get(key: string): Observable<any> {
        return from(this._get(key))
    }

    private async _get(key: string): Promise<any> {
        const raw = await this._redisClient.get(key)
        try {
            return JSON.parse(raw)
        } catch (e) {
            return raw
        }
    }

    public set(key: string, value: any, options: SetOptions = {}): Observable<{ status: boolean }> {
        let preValue = value
        if (typeof value !== 'string') {
            preValue = JSON.stringify(value)
        }
        const isKeepTtl = !isNil(options.KEEPTTL) && options.KEEPTTL
        if (isNil(options.EX) && !isKeepTtl) {
            set(options, 'EX', this._ttl)
        }

        return from(this._redisClient.set(key, preValue, options)).pipe(
            map(() => ({ status: true })),
            catchError(() => {
                return of({ status: false })
            }),
        )
    }

    public getAndSet<T>(key: string, $defaultValue: () => Observable<T>, options?: SetOptions): Observable<T> {
        return this.get(key).pipe(
            mergeMap((value) => {
                if (!!value) {
                    return of(value)
                }
                return of({}).pipe(
                    mergeMap($defaultValue),
                    mergeMap((defaultValue) => {
                        return this.set(key, defaultValue, options).pipe(map(() => defaultValue))
                    }),
                )
            }),
        )
    }

    public delete(key: string): Observable<{ status: boolean }> {
        return from(this._redisClient.del(key)).pipe(
            map((val) => {
                return { status: val > 0 }
            }),
        )
    }

    public flushAll(): Observable<{
        status: boolean
    }> {
        return from(this._redisClient.flushAll()).pipe(
            map((val) => {
                return { status: val === 'OK' }
            }),
        )
    }
}
