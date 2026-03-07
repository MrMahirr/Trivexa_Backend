import { Injectable } from '@nestjs/common';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { ClientUser, ClientUserEntity } from '../domain/client-user.entity';
import { ClientUsersSql } from './sql/client-users.sql';

@Injectable()
export class ClientUsersRepository {
  constructor(private readonly dbPool: DatabasePool) {}

  async create(data: {
    clientId: string;
    email: string;
    passwordHash: string;
  }): Promise<ClientUserEntity> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, ClientUsersSql.CREATE, [
        data.clientId,
        data.email,
        data.passwordHash,
      ]);
      return ClientUser.fromRow(row);
    } finally {
      client.release();
    }
  }

  async findByEmail(email: string): Promise<ClientUserEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(
        client,
        ClientUsersSql.FIND_BY_EMAIL,
        [email],
      );
      return row ? ClientUser.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<ClientUserEntity | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(client, ClientUsersSql.FIND_BY_ID, [
        id,
      ]);
      return row ? ClientUser.fromRow(row) : null;
    } finally {
      client.release();
    }
  }

  async createAccessLink(
    clientUserId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await BaseQuery.queryOne(client, ClientUsersSql.CREATE_ACCESS_LINK, [
        clientUserId,
        token,
        expiresAt,
      ]);
    } finally {
      client.release();
    }
  }

  async findAccessLinkByToken(token: string): Promise<any | null> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      const row = await BaseQuery.queryOne(
        client,
        ClientUsersSql.FIND_ACCESS_LINK_BY_TOKEN,
        [token],
      );
      return row || null;
    } finally {
      client.release();
    }
  }

  async updatePasswordHash(
    clientId: string,
    passwordHash: string,
  ): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await BaseQuery.queryOne(client, ClientUsersSql.UPDATE_PASSWORD_HASH, [
        passwordHash,
        clientId,
      ]);
    } finally {
      client.release();
    }
  }
}
