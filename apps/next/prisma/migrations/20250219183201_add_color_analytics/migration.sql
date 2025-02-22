/*
  Warnings:

  - A unique constraint covering the columns `[colorId]` on the table `Analytics` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_colorTrend_fkey";

-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_trend_fkey";

-- AlterTable
ALTER TABLE "Analytics" ADD COLUMN     "colorId" TEXT,
ALTER COLUMN "trendId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ColorTrend" ADD COLUMN     "spreadsheetUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_colorId_key" ON "Analytics"("colorId");

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "ColorTrend"("id") ON DELETE CASCADE ON UPDATE CASCADE;
