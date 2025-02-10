/*
  Warnings:

  - A unique constraint covering the columns `[trendId]` on the table `Analytics` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Trend" ADD COLUMN     "mainImageIndex" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_trendId_key" ON "Analytics"("trendId");
