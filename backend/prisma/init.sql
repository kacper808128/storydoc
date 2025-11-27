-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presentation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "templateId" TEXT NOT NULL DEFAULT 'justjoinit-proposal',
    "content" JSONB NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "thumbnail" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentationVersion" (
    "id" TEXT NOT NULL,
    "presentationId" TEXT NOT NULL,
    "versionSlug" TEXT NOT NULL,
    "editToken" TEXT NOT NULL,
    "viewToken" TEXT NOT NULL,
    "recipientName" TEXT,
    "recipientEmail" TEXT,
    "variables" JSONB NOT NULL DEFAULT '{}',
    "password" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresentationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "presentationId" TEXT NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueViewers" INTEGER NOT NULL DEFAULT 0,
    "avgTimeSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewAnalytics" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "scrollDepth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sectionsViewed" JSONB NOT NULL DEFAULT '[]',
    "clicks" JSONB NOT NULL DEFAULT '[]',
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPing" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViewAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipedriveWebhook" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "dealData" JSONB NOT NULL,
    "generatedId" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PipedriveWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "structure" JSONB NOT NULL,
    "defaultData" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Presentation_slug_key" ON "Presentation"("slug");

-- CreateIndex
CREATE INDEX "Presentation_userId_idx" ON "Presentation"("userId");

-- CreateIndex
CREATE INDEX "Presentation_slug_idx" ON "Presentation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PresentationVersion_versionSlug_key" ON "PresentationVersion"("versionSlug");

-- CreateIndex
CREATE UNIQUE INDEX "PresentationVersion_editToken_key" ON "PresentationVersion"("editToken");

-- CreateIndex
CREATE UNIQUE INDEX "PresentationVersion_viewToken_key" ON "PresentationVersion"("viewToken");

-- CreateIndex
CREATE INDEX "PresentationVersion_presentationId_idx" ON "PresentationVersion"("presentationId");

-- CreateIndex
CREATE INDEX "PresentationVersion_versionSlug_idx" ON "PresentationVersion"("versionSlug");

-- CreateIndex
CREATE INDEX "PresentationVersion_editToken_idx" ON "PresentationVersion"("editToken");

-- CreateIndex
CREATE INDEX "PresentationVersion_viewToken_idx" ON "PresentationVersion"("viewToken");

-- CreateIndex
CREATE INDEX "Analytics_presentationId_idx" ON "Analytics"("presentationId");

-- CreateIndex
CREATE INDEX "ViewAnalytics_versionId_idx" ON "ViewAnalytics"("versionId");

-- CreateIndex
CREATE INDEX "ViewAnalytics_sessionId_idx" ON "ViewAnalytics"("sessionId");

-- CreateIndex
CREATE INDEX "PipedriveWebhook_dealId_idx" ON "PipedriveWebhook"("dealId");

-- CreateIndex
CREATE INDEX "PipedriveWebhook_status_idx" ON "PipedriveWebhook"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Template_slug_key" ON "Template"("slug");

-- CreateIndex
CREATE INDEX "Template_slug_idx" ON "Template"("slug");

-- AddForeignKey
ALTER TABLE "Presentation" ADD CONSTRAINT "Presentation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentationVersion" ADD CONSTRAINT "PresentationVersion_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "Presentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "Presentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewAnalytics" ADD CONSTRAINT "ViewAnalytics_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PresentationVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
