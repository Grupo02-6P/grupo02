/*
  Warnings:

  - You are about to drop the column `entryId` on the `JournalEntry` table. All the data in the column will be lost.
  - The `status` column on the `Title` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Entry` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusTitle" AS ENUM ('ACTIVE', 'INACTIVE', 'PAID');

-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_entryTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_titleId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_entryId_fkey";

-- AlterTable
ALTER TABLE "JournalEntry" DROP COLUMN "entryId";

-- AlterTable
ALTER TABLE "Title" ADD COLUMN     "typeEntryId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusTitle" NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "Entry";

-- AddForeignKey
ALTER TABLE "Title" ADD CONSTRAINT "Title_typeEntryId_fkey" FOREIGN KEY ("typeEntryId") REFERENCES "typeEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
