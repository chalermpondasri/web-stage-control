import { SetOptions } from '@redis/client'
import { Observable } from 'rxjs'

export interface ICacheService {
    scan<T>(pattern: string): Observable<{ key: string; data: T }>
    get<T = any>(key: string): Observable<T>
    set(key: string, value: any, options?: SetOptions): Observable<{ status: boolean }>
    /**
     * get existing value by key, if it has value return the existing value, or else set default value and return
     */
    getAndSet<T>(key: string, $defaultValue: () => Observable<T>, options?: SetOptions): Observable<T>
    delete(key: string): Observable<{ status: boolean }>
    flushAll(): Observable<{ status: boolean }>
}
