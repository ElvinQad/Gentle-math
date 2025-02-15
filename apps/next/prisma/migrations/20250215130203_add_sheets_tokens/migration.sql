-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sheetsAccessToken" TEXT,
ADD COLUMN     "sheetsRefreshToken" TEXT,
ADD COLUMN     "sheetsTokenExpiry" TIMESTAMP(3);
