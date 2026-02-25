export interface ClientUserEntity {
    id: string;
    clientId: string; // Foreign key to clients table
    email: string;
    passwordHash: string;
    createdAt: Date;
}

export class ClientUser implements ClientUserEntity {
    id: string;
    clientId: string;
    email: string;
    passwordHash: string;
    createdAt: Date;

    static fromRow(row: any): ClientUser {
        const entity = new ClientUser();
        entity.id = row.id;
        entity.clientId = row.client_id;
        entity.email = row.email;
        entity.passwordHash = row.password_hash;
        entity.createdAt = row.created_at;
        return entity;
    }
}
