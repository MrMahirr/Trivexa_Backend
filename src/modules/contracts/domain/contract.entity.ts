export enum ContractStatus {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    SIGNED = 'SIGNED',
    EXPIRED = 'EXPIRED',
    TERMINATED = 'TERMINATED',
}

export interface ContractEntity {
    id: string;
    clientId: string;
    title: string;
    description?: string;
    status: ContractStatus;
    startDate: Date;
    endDate?: Date;
    value?: number;
    signedUrl?: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Contract implements ContractEntity {
    id: string;
    clientId: string;
    title: string;
    description?: string;
    status: ContractStatus;
    startDate: Date;
    endDate?: Date;
    value?: number;
    signedUrl?: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;

    static fromRow(row: any): Contract {
        const entity = new Contract();
        entity.id = row.id;
        entity.clientId = row.client_id;
        entity.title = row.title;
        entity.description = row.description;
        entity.status = row.status;
        entity.startDate = row.start_date;
        entity.endDate = row.end_date;
        entity.value = row.value ? parseFloat(row.value) : undefined;
        entity.signedUrl = row.signed_url;
        entity.createdBy = row.created_by;
        entity.createdAt = row.created_at;
        entity.updatedAt = row.updated_at;
        return entity;
    }
}
