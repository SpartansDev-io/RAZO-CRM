-- AlterTable
ALTER TABLE "clinical_notes" ALTER COLUMN "therapist_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "created_by" DROP NOT NULL;
