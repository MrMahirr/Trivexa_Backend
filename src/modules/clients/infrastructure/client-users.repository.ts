import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { ClientUser, ClientUserEntity } from '../domain/client-user.entity';
import { ClientUsersSql } from './sql/client-users.sql';

@Injectable()
export class ClientUsersRepository {
  private schemaEnsured = false;

  constructor(private readonly dbPool: DatabasePool) {}

  private async ensureSchema(client: PoolClient): Promise<void> {
    if (this.schemaEnsured) {
      return;
    }
    await BaseQuery.execute(
      client,
      ClientUsersSql.ENSURE_FORCE_PASSWORD_CHANGE_COLUMN,
    );
    this.schemaEnsured = true;
  }

  async create(data: {
    clientId: string;
    email: string;
    passwordHash: string;
    forcePasswordChange?: boolean;
  }): Promise<ClientUserEntity> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      const row = await BaseQuery.queryOne(client, ClientUsersSql.CREATE, [
        data.clientId,
        data.email,
        data.passwordHash,
        data.forcePasswordChange ?? false,
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
      await this.ensureSchema(client);
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
      await this.ensureSchema(client);
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
      await this.ensureSchema(client);
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
      await this.ensureSchema(client);
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
    clientUserId: string,
    passwordHash: string,
    forcePasswordChange = false,
  ): Promise<void> {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();
    try {
      await this.ensureSchema(client);
      await BaseQuery.queryOne(client, ClientUsersSql.UPDATE_PASSWORD_HASH, [
        passwordHash,
        forcePasswordChange,
        clientUserId,
      ]);
    } finally {
      client.release();
    }
  }
}
