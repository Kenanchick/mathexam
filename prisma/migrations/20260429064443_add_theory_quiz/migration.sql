-- CreateEnum
CREATE TYPE "TheoryQuestionType" AS ENUM ('FORMULA_RECALL', 'CALCULATION', 'THEORETICAL');

-- CreateTable
CREATE TABLE "TheoryQuiz" (
    "id" TEXT NOT NULL,
    "examNumber" INTEGER NOT NULL,
    "topicTitle" TEXT NOT NULL,
    "topicSlug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TheoryQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TheoryQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "type" "TheoryQuestionType" NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TheoryQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TheoryQuiz_topicSlug_key" ON "TheoryQuiz"("topicSlug");

-- CreateIndex
CREATE INDEX "TheoryQuiz_examNumber_idx" ON "TheoryQuiz"("examNumber");

-- CreateIndex
CREATE INDEX "TheoryQuestion_quizId_idx" ON "TheoryQuestion"("quizId");

-- AddForeignKey
ALTER TABLE "TheoryQuestion" ADD CONSTRAINT "TheoryQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "TheoryQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
