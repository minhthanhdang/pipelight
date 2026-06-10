/*
  Warnings:

  - You are about to drop the `incidents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "incidents" DROP CONSTRAINT "incidents_user_id_fkey";

-- DropTable
DROP TABLE "incidents";
