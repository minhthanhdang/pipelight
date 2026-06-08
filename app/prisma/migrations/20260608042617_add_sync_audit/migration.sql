-- CreateTable
CREATE TABLE "sync_audits" (
    "id" TEXT NOT NULL,
    "sync_event_id" TEXT NOT NULL,
    "connector_id" TEXT NOT NULL,
    "fivetran_id" TEXT NOT NULL,
    "judgement" TEXT NOT NULL,
    "direct_cause" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,
    "suggestions" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sync_audits_sync_event_id_key" ON "sync_audits"("sync_event_id");

-- CreateIndex
CREATE INDEX "sync_audits_user_id_created_at_idx" ON "sync_audits"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "sync_audits_judgement_idx" ON "sync_audits"("judgement");

-- AddForeignKey
ALTER TABLE "sync_audits" ADD CONSTRAINT "sync_audits_sync_event_id_fkey" FOREIGN KEY ("sync_event_id") REFERENCES "sync_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_audits" ADD CONSTRAINT "sync_audits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
