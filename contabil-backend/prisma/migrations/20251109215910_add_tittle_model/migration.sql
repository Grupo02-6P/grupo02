-- CreateTable
CREATE TABLE "Tittle" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" DECIMAL(12,2) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "partnerId" TEXT,
    "movementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tittle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" DECIMAL(12,2) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "tittleId" TEXT NOT NULL,
    "entryTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tittle_code_key" ON "Tittle"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_code_key" ON "Entry"("code");

-- AddForeignKey
ALTER TABLE "Tittle" ADD CONSTRAINT "Tittle_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tittle" ADD CONSTRAINT "Tittle_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "typeMovement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_tittleId_fkey" FOREIGN KEY ("tittleId") REFERENCES "Tittle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_entryTypeId_fkey" FOREIGN KEY ("entryTypeId") REFERENCES "typeEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
