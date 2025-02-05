/*
  Warnings:

  - You are about to drop the column `type` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Trend` table. All the data in the column will be lost.
  - You are about to drop the column `confidence` on the `Trend` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Trend` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Trend` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Trend` table. All the data in the column will be lost.
  - Added the required column `type` to the `Trend` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_userId_fkey";

-- DropForeignKey
ALTER TABLE "Trend" DROP CONSTRAINT "Trend_userId_fkey";

-- DropIndex
DROP INDEX "Analytics_trendId_idx";

-- DropIndex
DROP INDEX "Analytics_type_idx";

-- DropIndex
DROP INDEX "Trend_category_idx";

-- AlterTable
ALTER TABLE "Analytics" DROP COLUMN "type",
DROP COLUMN "userId",
DROP COLUMN "value",
ADD COLUMN     "dates" TIMESTAMP(3)[],
ADD COLUMN     "values" INTEGER[];

-- AlterTable
ALTER TABLE "Trend" DROP COLUMN "category",
DROP COLUMN "confidence",
DROP COLUMN "imageUrl",
DROP COLUMN "source",
DROP COLUMN "userId",
ADD COLUMN     "imageUrls" TEXT[],
ADD COLUMN     "type" TEXT NOT NULL;
