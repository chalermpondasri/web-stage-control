import { ProviderName } from '@libs/common/constants'
import { Locale } from '@libs/common/models'
import { DomainErrorException } from '@libs/factories/domain-error'
import { RequestContext } from '@libs/providers'
import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Inject,
    Injectable,
    LoggerService,
    NestInterceptor,
} from '@nestjs/common'
import { HttpException } from '@nestjs/common/exceptions/http.exception'
import * as os from 'os'
import { Observable, catchError, throwError } from 'rxjs'
import { IErrorLocaleService } from '../../../apps/main/src/domains/i18n/interfaces/service.interface'

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
    public constructor(
        @Inject(ProviderName.ERROR_LOCALE_RESOLVER)
        private readonly _errorLocale: IErrorLocaleService,
        @Inject(ProviderName.ELASTIC_HTTP_LOGGER)
        private readonly _elasticHttpLogger: LoggerService,
        @Inject(ProviderName.ELASTIC_ERROR_LOGGER)
        private readonly _elasticErrorLogger: LoggerService,
        @Inject(ProviderName.REQUEST_CONTEXT)
        private readonly _requestContext: RequestContext,
    ) {}

    public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        return next.handle().pipe(
            catchError((err) => {
                if (err instanceof DomainErrorException) {
                    const localeMessage = this._errorLocale.get(
                        (<any>err.getResponse())?.statusCode,
                        <keyof Locale>this._requestContext.languages[0].code,
                    )

                    if (localeMessage) {
                        Object.assign({}, err, {
                            response: {
                                error: localeMessage,
                            },
                        })
                    }
                } else if (err instanceof HttpException) {
                    console.log(err)

                    return throwError(
                        () =>
                            new DomainErrorException(
                                'EAU000000',
                                null,
                                (<any>err.getResponse())?.message[0],
                                HttpStatus.BAD_REQUEST,
                            ),
                    )
                    /* 
                    Do nothing at the moment,
                    because we already apply http request middleware
                     */
                    // this._elasticHttpLogger.error(err)
                } else {
                    // other errors excluding http exception
                    const e = <Error>err
                    this._elasticErrorLogger.error({
                        source: os.hostname(),
                        name: e.name,
                        message: e.message,
                        stack: e.stack,
                        cause: e.cause,
                    })
                }

                return throwError(() => err)
            }),
        )
    }
}
