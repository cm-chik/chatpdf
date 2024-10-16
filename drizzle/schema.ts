import { pgTable, serial, text, timestamp, varchar, foreignKey, unique, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const userSystemEnum = pgEnum("user_system_enum", ['user', 'system', 'assistant'])



export const chats = pgTable("chats", {
	id: serial().primaryKey().notNull(),
	pdfName: text("pdf_name").notNull(),
	pdfUrl: text("pdf_url").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	userId: varchar("user_id", { length: 256 }).notNull(),
	fileKey: text("file_key").notNull(),
});

export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	chatsId: serial("chats_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	role: userSystemEnum().notNull(),
},
(table) => {
	return {
		messagesChatsIdChatsIdFk: foreignKey({
			columns: [table.chatsId],
			foreignColumns: [chats.id],
			name: "messages_chats_id_chats_id_fk"
		}),
	}
});

export const userSubscriptions = pgTable("user_subscriptions", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 256 }).notNull(),
	stripeCustomerId: varchar("stripe_customer_id", { length: 256 }).notNull(),
	stripeSubscriptionId: varchar("stripe_subscription_id", { length: 256 }).notNull(),
	stripePriceId: varchar("stripe_price_id", { length: 256 }).notNull(),
	stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", { mode: 'string' }),
},
(table) => {
	return {
		userSubscriptionsUserIdUnique: unique("user_subscriptions_user_id_unique").on(table.userId),
		userSubscriptionsStripeCustomerIdUnique: unique("user_subscriptions_stripe_customer_id_unique").on(table.stripeCustomerId),
		userSubscriptionsStripeSubscriptionIdUnique: unique("user_subscriptions_stripe_subscription_id_unique").on(table.stripeSubscriptionId),
	}
});