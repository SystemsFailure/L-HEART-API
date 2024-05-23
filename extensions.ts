import { Response } from '@adonisjs/core/http'
Response.macro('apiSuccess', function (this: Response, data, message = '', result = true, code = 200) {
    this.status(code).json({
        data: data,
        message: !!message ? message : undefined,
        result,
    })
})

Response.macro('apiError', function (this: Response, data, message = '', result = false, code = 200) {
    this.status(code).json({
        data: data,
        message: !!message ? message : undefined,
        result: result,
    })
})

declare module '@adonisjs/core/http' {
    interface Response {
        apiSuccess(data: any, message?: string, result?: boolean, code?: number): any
        apiError(data: any, message?: string, result?: boolean, code?: number): any
    }
}
