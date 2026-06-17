-- AlterTable: add address fields with empty string defaults for existing rows
ALTER TABLE "Applicant" ADD COLUMN "addressStreet" TEXT NOT NULL DEFAULT '',
ADD COLUMN "addressUnit" TEXT NOT NULL DEFAULT '',
ADD COLUMN "addressCity" TEXT NOT NULL DEFAULT '',
ADD COLUMN "addressState" TEXT NOT NULL DEFAULT '',
ADD COLUMN "addressZip" TEXT NOT NULL DEFAULT '';

-- Remove defaults so new rows must supply values (enforced by app layer)
ALTER TABLE "Applicant" ALTER COLUMN "addressStreet" DROP DEFAULT,
ALTER COLUMN "addressUnit" DROP DEFAULT,
ALTER COLUMN "addressCity" DROP DEFAULT,
ALTER COLUMN "addressState" DROP DEFAULT,
ALTER COLUMN "addressZip" DROP DEFAULT;
