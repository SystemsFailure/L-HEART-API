import User from "#models/user";
import { ModelPaginatorContract } from "@adonisjs/lucid/types/model";

export interface UserServiceContract {
    findAll(meta: Meta): Promise<ModelPaginatorContract<User>>;
}

export type Meta = {
    currentPage: number,
    perPage: number,
    totalPage: number,
}