// User repository port (interface)
export interface IUserRepository {
    findById(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
