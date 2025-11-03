-- CreateTable
CREATE TABLE "public"."typeMovement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "creditAccountId" TEXT NOT NULL,
    "debitAccountId" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "typeMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "typeMovement_name_key" ON "public"."typeMovement"("name");

-- AddForeignKey
ALTER TABLE "public"."typeMovement" ADD CONSTRAINT "typeMovement_creditAccountId_fkey" FOREIGN KEY ("creditAccountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."typeMovement" ADD CONSTRAINT "typeMovement_debitAccountId_fkey" FOREIGN KEY ("debitAccountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
