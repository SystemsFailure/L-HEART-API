import Account from "#models/account";
import { AccessToken } from "@adonisjs/auth/access_tokens";

declare module '@adonisjs/core/http' {
  interface Request {
    account: Account & { currentAccessToken: AccessToken;};
  }
}