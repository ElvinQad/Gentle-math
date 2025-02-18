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

-- Add relation field to Analytics
ALTER TABLE "Analytics" ADD COLUMN "colorTrendId" TEXT REFERENCES "ColorTrend"("id");

-- Create index
CREATE INDEX "ColorTrend_createdAt_idx" ON "ColorTrend"("createdAt"); 