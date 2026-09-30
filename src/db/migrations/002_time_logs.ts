/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

// Create a `time_logs` table for tracking hours logged on tickets

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('time_logs')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    // must point to real ticket, deleting a ticket will delete its time logs
    .addColumn('ticket_id', 'integer', (col) =>
      col.references('tickets.id').onDelete('cascade').notNull(),
    )
    // must point to a real user, deleting a user will delete their time logs
    .addColumn('user_id', 'integer', (col) =>
      col.references('users.id').onDelete('cascade').notNull(),
    )
    .addColumn('hours', 'integer', (col) => col.notNull())
    // timestamp with time zone, defaults to now
    .addColumn('logged_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('time_logs').ifExists().execute();
}
