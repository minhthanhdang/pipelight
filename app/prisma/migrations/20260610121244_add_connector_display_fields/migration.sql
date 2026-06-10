-- AlterTable
ALTER TABLE "connectors" ADD COLUMN     "destination_service" TEXT,
ADD COLUMN     "group_id" TEXT,
ADD COLUMN     "schema_prefix" TEXT;
