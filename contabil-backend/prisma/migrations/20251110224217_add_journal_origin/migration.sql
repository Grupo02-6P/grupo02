-- CreateEnum
CREATE TYPE "JournalOrigin" AS ENUM ('TITTLE', 'ENTRY', 'ADJUSTMENT', 'TRANSFER');

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "originId" TEXT,
ADD COLUMN     "originType" "JournalOrigin";
