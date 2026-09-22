-- CreateEnum
CREATE TYPE "ContentCategory" AS ENUM ('BLOG', 'EDUCATION');

-- CreateTable
CREATE TABLE "ShubhMuhurat" (
    "id" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShubhMuhurat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "category" "ContentCategory" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],
    "coverImageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShubhMuhurat_activityType_date_idx" ON "ShubhMuhurat"("activityType", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ShubhMuhurat_activityType_date_key" ON "ShubhMuhurat"("activityType", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Content_slug_key" ON "Content"("slug");

-- CreateIndex
CREATE INDEX "Content_category_isPublished_publishedAt_idx" ON "Content"("category", "isPublished", "publishedAt");
