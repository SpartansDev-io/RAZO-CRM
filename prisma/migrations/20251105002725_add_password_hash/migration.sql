/*
  Warnings:

  - Added the required column `password_hash` to the `user_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "password_hash" TEXT NOT NULL;
