CREATE TYPE "public"."notification_mode" AS ENUM('none', 'individual', 'grouped');--> statement-breakpoint
CREATE TABLE "notifications_sent" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" text,
	"notification_mode" "notification_mode" NOT NULL,
	"in_stock" boolean NOT NULL,
	"message_sent" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ADD COLUMN "notification_mode" "notification_mode" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications_sent" ADD CONSTRAINT "notifications_sent_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications_sent" ADD CONSTRAINT "notifications_sent_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;