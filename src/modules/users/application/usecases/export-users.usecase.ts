import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { ExportUsersQueryDto } from '../../api/dto/export-users.query';

@Injectable()
export class ExportUsersUseCase {
    constructor(private readonly usersRepo: UsersRepository) { }

    async execute(query: ExportUsersQueryDto): Promise<string> {
        // 1. Fetch all matching users (no pagination or a very high limit)
        const { data } = await this.usersRepo.findAll({
            page: 1,
            limit: 10000,
            role: query.role,
            department: query.department,
            isActive: query.isActive !== undefined ? String(query.isActive) : undefined,
        });

        if (!data || data.length === 0) {
            return this.generateCSVHeader();
        }

        // 2. Convert to CSV format
        const header = this.generateCSVHeader();
        const rows = data.map(user => {
            return [
                user.id,
                user.firstName,
                user.lastName,
                user.email,
                user.role,
                user.department || '',
                user.isActive ? 'Active' : 'Inactive',
                new Date(user.createdAt).toISOString()
            ].map(val => `"${val}"`).join(',');
        });

        return [header, ...rows].join('\n');
    }

    private generateCSVHeader(): string {
        return 'ID,First Name,Last Name,Email,Role,Department,Status,Created At';
    }
}
