import { sql } from 'drizzle-orm';
import { text, pgTable, serial, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';
import { Block } from '../types';
import { SearchSources } from '../agents/search/types';

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  messageId: text('messageId').notNull(),
  chatId: text('chatId').notNull(),
  backendId: text('backendId').notNull(),
  query: text('query').notNull(),
  createdAt: text('createdAt').notNull(),
  responseBlocks: jsonb('responseBlocks')
    .$type<Block[]>()
    .default(sql`'[]'::jsonb`),
  status: text('status', { enum: ['answering', 'completed', 'error'] }).default(
    'answering',
  ),
});

interface DBFile {
  name: string;
  fileId: string;
}

export const chats = pgTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('createdAt').notNull(),
  sources: jsonb('sources')
    .$type<SearchSources[]>()
    .default(sql`'[]'::jsonb`),
  files: jsonb('files')
    .$type<DBFile[]>()
    .default(sql`'[]'::jsonb`),
});

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('passwordHash').notNull(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const verificationTokens = pgTable('verificationTokens', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
