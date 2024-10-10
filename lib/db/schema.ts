import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userSystemEnum = pgEnum("user_system_enum", ["user", "system"]);

//chat table contains different chats, each chat is a row in db
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  pdfName: text("pdf_name").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  fileKey: text("file_key").notNull(), //retrieve file from S3
});

//chat table contains different chats, each chat is a row in db
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatsId: serial("chats_id")
    .references(() => chats.id)
    .notNull(), //form 1-to-many relationship here, reference chats table the id there
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: userSystemEnum("role").notNull(),
});

//drizzle-kit create migration and database sync up with above
