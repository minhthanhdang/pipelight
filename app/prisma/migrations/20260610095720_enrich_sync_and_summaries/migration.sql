-- AlterTable
ALTER TABLE "sync_events" ADD COLUMN     "sync_metrics" JSONB,
ADD COLUMN     "sync_type" TEXT;

-- CreateTable
CREATE TABLE "sync_summaries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "connector_id" TEXT,
    "fivetran_id" TEXT,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "period_label" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "stats" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sync_summaries_user_id_created_at_idx" ON "sync_summaries"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "sync_summaries_user_id_connector_id_period_label_idx" ON "sync_summaries"("user_id", "connector_id", "period_label");

-- AddForeignKey
ALTER TABLE "sync_summaries" ADD CONSTRAINT "sync_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
