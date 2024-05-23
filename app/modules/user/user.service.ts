import User from "#models/user";
import { ModelPaginatorContract } from "@adonisjs/lucid/types/model";
import { Meta, UserServiceContract } from "./user.types.js";

export default class UserService implements UserServiceContract {
    public async findAll(meta: Meta): Promise<ModelPaginatorContract<User>> {
        return await User
            .query()
            .preload('accounts')
            .preload('profiles')
            .paginate(meta.currentPage, meta.perPage)
    }

    public async findOne(id: string) {
        return await User.query().where('id', id).firstOrFail()
    }
}