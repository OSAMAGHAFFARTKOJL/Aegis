// Minimal ambient types for Node's built-in SQLite (node:sqlite).
declare module "node:sqlite" {
  interface StatementResultingChanges {
    changes: number;
    lastInsertRowid: number | bigint;
  }
  interface Statement {
    run(...params: unknown[]): StatementResultingChanges;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }
  export class DatabaseSync {
    constructor(
      path: string,
      options?: { open?: boolean; readOnly?: boolean; allowExtension?: boolean },
    );
    exec(sql: string): void;
    prepare(sql: string): Statement;
    loadExtension(path: string): void;
    enableLoadExtension(enabled: boolean): void;
    close(): void;
  }
}
