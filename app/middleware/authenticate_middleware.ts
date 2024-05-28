import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthenticateMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const account = await ctx.auth.use('api').authenticate();

    // Make the account available in the request object
    ctx.request.account = account;

    /**
     * Call next method in the pipeline and return its output
     */
    await next()
  }
}