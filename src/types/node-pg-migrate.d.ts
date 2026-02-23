// Type declarations for node-pg-migrate
// This file bridges the gap between node-pg-migrate's "exports" field
// and TypeScript's classic "node" module resolution used with module: commonjs

import type {} from '../../../node_modules/node-pg-migrate/dist/bundle/index';

declare module 'node-pg-migrate' {
  import type { ClientBase, ClientConfig } from 'pg';

  type LogFn = (msg: string) => void;
  type Logger = {
    debug?: LogFn;
    info: LogFn;
    warn: LogFn;
    error: LogFn;
  };

  type Value = null | boolean | string | number | PgLiteral | Value[];

  type Type = string | { type: string };
  type Name = string | { schema?: string; name: string };

  interface IfNotExistsOption {
    ifNotExists?: boolean;
  }
  interface IfExistsOption {
    ifExists?: boolean;
  }
  interface CascadeOption {
    cascade?: boolean;
  }
  type DropOptions = IfExistsOption & CascadeOption;

  type Action =
    | 'NO ACTION'
    | 'RESTRICT'
    | 'CASCADE'
    | 'SET NULL'
    | 'SET DEFAULT';

  interface ReferencesOptions {
    referencesConstraintName?: string;
    referencesConstraintComment?: string;
    references: Name;
    onDelete?: Action;
    onUpdate?: Action;
    match?: 'FULL' | 'SIMPLE';
  }

  interface SequenceGeneratedOptions {
    precedence: 'ALWAYS' | 'BY DEFAULT';
  }

  interface ColumnDefinition extends Partial<ReferencesOptions> {
    type: string;
    collation?: string;
    unique?: boolean;
    primaryKey?: boolean;
    notNull?: boolean;
    default?: Value;
    check?: string;
    deferrable?: boolean;
    deferred?: boolean;
    comment?: string | null;
    sequenceGenerated?: SequenceGeneratedOptions;
    expressionGenerated?: string;
  }

  interface ColumnDefinitions {
    [name: string]: ColumnDefinition | string;
  }

  interface ConstraintOptions {
    check?: string | string[];
    unique?: Name | Array<Name | Name[]>;
    primaryKey?: Name | Name[];
    foreignKeys?: any;
    exclude?: string;
    deferrable?: boolean;
    deferred?: boolean;
    comment?: string;
  }

  interface TableOptions extends IfNotExistsOption {
    temporary?: boolean;
    inherits?: Name;
    like?: Name | { table: Name; options?: any };
    constraints?: ConstraintOptions;
    comment?: string | null;
  }

  interface IndexColumn {
    name: string;
    opclass?: Name;
    sort?: 'ASC' | 'DESC';
  }

  interface CreateIndexOptions extends IfNotExistsOption {
    name?: string;
    unique?: boolean;
    where?: string;
    concurrently?: boolean;
    method?: 'btree' | 'hash' | 'gist' | 'spgist' | 'gin';
    include?: string | string[];
  }

  class PgLiteral {
    static create(str: string): PgLiteral;
    readonly literal: true;
    readonly value: string;
    constructor(value: string);
    toString(): string;
  }

  class MigrationBuilder {
    createTable(
      tableName: Name,
      columns: ColumnDefinitions,
      options?: TableOptions & DropOptions,
    ): void;
    dropTable(tableName: Name, options?: DropOptions): void;
    addColumns(
      tableName: Name,
      newColumns: ColumnDefinitions,
      options?: IfNotExistsOption & DropOptions,
    ): void;
    dropColumns(
      tableName: Name,
      columns: string | string[] | { [name: string]: unknown },
      options?: DropOptions,
    ): void;
    alterColumn(tableName: Name, columnName: string, options: any): void;
    renameColumn(
      tableName: Name,
      oldColumnName: string,
      newColumnName: string,
    ): void;
    renameTable(tableName: Name, newtableName: Name): void;
    createIndex(
      tableName: Name,
      columns: string | Array<string | IndexColumn>,
      options?: CreateIndexOptions & DropOptions,
    ): void;
    dropIndex(
      tableName: Name,
      columns: string | Array<string | IndexColumn>,
      options?: DropOptions,
    ): void;
    addConstraint(
      tableName: Name,
      constraintName: string | null,
      expression: ConstraintOptions | string,
    ): void;
    dropConstraint(
      tableName: Name,
      constraintName: string,
      options?: DropOptions,
    ): void;
    createType(tableName: Name, values: any): void;
    dropType(tableName: Name, options?: DropOptions): void;
    createExtension(extension: string | string[], options?: any): void;
    dropExtension(extension: string | string[], options?: any): void;
    createSchema(schemaName: string, options?: any): void;
    dropSchema(schemaName: string, options?: any): void;
    sql(sqlStr: string, args?: { [key: string]: any }): void;
    func(sqlStr: string): PgLiteral;
    db: any;
  }

  type MigrationDirection = 'up' | 'down';

  interface RunMigration {
    readonly path: string;
    readonly name: string;
    readonly timestamp: number;
  }

  interface RunnerOption {
    migrationsTable: string;
    dir: string | string[];
    direction: MigrationDirection;
    databaseUrl?: string | ClientConfig;
    dbClient?: ClientBase;
    schema?: string | string[];
    migrationsSchema?: string;
    checkOrder?: boolean;
    count?: number;
    timestamp?: boolean;
    ignorePattern?: string | string[];
    file?: string;
    dryRun?: boolean;
    createSchema?: boolean;
    createMigrationsSchema?: boolean;
    singleTransaction?: boolean;
    noLock?: boolean;
    fake?: boolean;
    decamelize?: boolean;
    log?: LogFn;
    logger?: Logger;
    verbose?: boolean;
  }

  function runner(options: RunnerOption): Promise<RunMigration[]>;

  export {
    MigrationBuilder,
    ColumnDefinitions,
    ColumnDefinition,
    TableOptions,
    ConstraintOptions,
    CreateIndexOptions,
    IndexColumn,
    ReferencesOptions,
    DropOptions,
    Name,
    Type,
    Value,
    PgLiteral,
    MigrationDirection,
    RunMigration,
    RunnerOption,
    runner,
  };
}
