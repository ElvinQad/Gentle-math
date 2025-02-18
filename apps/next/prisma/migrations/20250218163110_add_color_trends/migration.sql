-- CreateTable
CREATE TABLE "ColorTrend" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "popularity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColorTrend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ColorTrend_createdAt_idx" ON "ColorTrend"("createdAt");

-- RenameForeignKey
ALTER TABLE "Analytics" RENAME CONSTRAINT "Analytics_trendId_fkey" TO "Analytics_trend_fkey";

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_colorTrend_fkey" FOREIGN KEY ("trendId") REFERENCES "ColorTrend"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
