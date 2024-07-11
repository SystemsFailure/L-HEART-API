import Account from "#models/account"
import { AccessToken } from "@adonisjs/auth/access_tokens";

export type AccountType = Account & {
    currentAccessToken: AccessToken;
}