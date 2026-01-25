-- Add project relationships for MediumIDE tables
ALTER TABLE "MediumIDEFile" ADD COLUMN "projectId" TEXT NOT NULL;
ALTER TABLE "MediumIDEEnvironment" ADD COLUMN "projectId" TEXT NOT NULL;

-- Indexes for project lookups
CREATE INDEX "MediumIDEFile_projectId_idx" ON "MediumIDEFile"("projectId");
CREATE UNIQUE INDEX "MediumIDEFile_projectId_path_key" ON "MediumIDEFile"("projectId", "path");
CREATE UNIQUE INDEX "MediumIDEEnvironment_projectId_key" ON "MediumIDEEnvironment"("projectId");
CREATE INDEX "MediumIDEEnvironment_projectId_idx" ON "MediumIDEEnvironment"("projectId");

-- Foreign keys
ALTER TABLE "MediumIDEFile" ADD CONSTRAINT "MediumIDEFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MediumIDEProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediumIDEEnvironment" ADD CONSTRAINT "MediumIDEEnvironment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MediumIDEProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
