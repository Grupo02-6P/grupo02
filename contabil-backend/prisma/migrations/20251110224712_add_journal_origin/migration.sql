-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_tittleId_fkey";

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "entryId" TEXT,
ALTER COLUMN "tittleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_tittleId_fkey" FOREIGN KEY ("tittleId") REFERENCES "Tittle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
