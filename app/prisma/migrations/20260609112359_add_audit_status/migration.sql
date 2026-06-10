-- AlterTable
ALTER TABLE "sync_events" ADD COLUMN     "audit_status" TEXT NOT NULL DEFAULT 'pending';
