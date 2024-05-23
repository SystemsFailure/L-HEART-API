import { HttpContext } from '@adonisjs/core/http'


export default class ApiResponse {
  public static apiSuccess(ctx: HttpContext, data: any, message:string, result: boolean, statusCode = 200) {
    return ctx.response.status(statusCode).json({
      status: 'success',
      data,
      message,
      result,
    })
  }

  public static apiError(ctx: HttpContext, message: string, statusCode = 400) {
    return ctx.response.status(statusCode).json({
      status: 'error',
      message,
    })
  }
}