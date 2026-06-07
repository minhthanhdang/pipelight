-- Add fivetran creds to User
ALTER TABLE "User" ADD COLUMN "fivetran_api_key" TEXT;
ALTER TABLE "User" ADD COLUMN "fivetran_api_secret" TEXT;

-- Drop old primary key and restructure connectors
ALTER TABLE "connectors" DROP CONSTRAINT "connectors_pkey";
ALTER TABLE "connectors" RENAME COLUMN "id" TO "fivetran_id";
ALTER TABLE "connectors" ADD COLUMN "id" TEXT;
ALTER TABLE "connectors" ADD COLUMN "user_id" TEXT;

-- Delete existing rows (no user to assign them to)
DELETE FROM "connectors";

-- Make columns required
ALTER TABLE "connectors" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "connectors" ALTER COLUMN "fivetran_id" SET NOT NULL;
ALTER TABLE "connectors" ALTER COLUMN "user_id" SET NOT NULL;

-- Add constraints
ALTER TABLE "connectors" ADD CONSTRAINT "connectors_pkey" PRIMARY KEY ("id");
ALTER TABLE "connectors" ADD CONSTRAINT "connectors_fivetran_id_user_id_key" UNIQUE ("fivetran_id", "user_id");
ALTER TABLE "connectors" ADD CONSTRAINT "connectors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
