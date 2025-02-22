/*
  Warnings:

  - You are about to drop the column `spreadsheetUrl` on the `ColorTrend` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "imageUrl" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "ColorTrend" DROP COLUMN "spreadsheetUrl";
