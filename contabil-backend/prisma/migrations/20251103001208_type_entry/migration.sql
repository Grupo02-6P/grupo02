-- CreateTable
CREATE TABLE "public"."typeEntry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "accountClearedId" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "typeEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."typeEntry" ADD CONSTRAINT "typeEntry_accountClearedId_fkey" FOREIGN KEY ("accountClearedId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
