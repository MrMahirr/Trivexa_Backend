export interface ClientEntity {
    id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class Client {
    static fromRow(row: any): ClientEntity {
        return {
            id: row.id,
            companyName: row.company_name,
            contactPerson: row.contact_person,
            email: row.email,
            phone: row.phone,
            address: row.address,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
