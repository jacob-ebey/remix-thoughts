/*
  Warnings:

  - Added the required column `title` to the `Thought` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Thought" ADD COLUMN     "title" TEXT NOT NULL;
