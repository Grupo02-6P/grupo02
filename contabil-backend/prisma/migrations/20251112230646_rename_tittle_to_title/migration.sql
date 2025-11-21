/*
  Renaming Tittle to Title
  This migration renames the table and columns without losing data
*/

-- Step 1: Drop foreign keys that reference the Tittle table
ALTER TABLE "public"."Entry" DROP CONSTRAINT "Entry_tittleId_fkey";
ALTER TABLE "public"."JournalEntry" DROP CONSTRAINT "JournalEntry_tittleId_fkey";

-- Step 2: Drop foreign keys from the Tittle table
ALTER TABLE "public"."Tittle" DROP CONSTRAINT "Tittle_movementId_fkey";
ALTER TABLE "public"."Tittle" DROP CONSTRAINT "Tittle_partnerId_fkey";

-- Step 3: Rename columns in Entry and JournalEntry tables
ALTER TABLE "public"."Entry" RENAME COLUMN "tittleId" TO "titleId";
ALTER TABLE "public"."JournalEntry" RENAME COLUMN "tittleId" TO "titleId";

-- Step 4: Rename the table from Tittle to Title
ALTER TABLE "public"."Tittle" RENAME TO "Title";

-- Step 5: Rename the primary key constraint
ALTER TABLE "public"."Title" RENAME CONSTRAINT "Tittle_pkey" TO "Title_pkey";

-- Step 6: Rename the unique index
ALTER INDEX "public"."Tittle_code_key" RENAME TO "Title_code_key";

-- Step 7: Recreate foreign keys with new names
ALTER TABLE "public"."Title" ADD CONSTRAINT "Title_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "public"."typeMovement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."Title" ADD CONSTRAINT "Title_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."JournalEntry" ADD CONSTRAINT "JournalEntry_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "public"."Title"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."Entry" ADD CONSTRAINT "Entry_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "public"."Title"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Rename JournalOrigin enum: rename TITTLE to TITLE
ALTER TYPE "JournalOrigin" RENAME VALUE 'TITTLE' TO 'TITLE';