import { IRepository } from "../database/adapter";
import { UserDocument } from "./schema";

export abstract class IUserRepository extends IRepository<UserDocument> {}
