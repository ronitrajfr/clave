import { notFound } from "next/navigation";
import { quizzes } from "~/server/db/schema";
import React from "react";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import QuizInteraction from "~/components/quiz-interaction";

interface Params {
  id: number;
}

interface QuizQuestion {
  options: string[];
  question: string;
  explanation: string;
  correct_answer: string;
}

async function getQuiz(id: number) {
  const quiz = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, id))
    .limit(1);
  return quiz.length > 0 ? quiz[0] : null;
}

export default async function Page({ params }: { params: Params }) {
  const res = await getQuiz(params.id);
  if (!res) {
    notFound();
  }
  //@ts-expect-error glksadkglsadlkgj
  const quiz: QuizQuestion[] = res?.questions?.quiz;

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Quiz</CardTitle>
          <CardDescription>Test your knowledge</CardDescription>
        </CardHeader>
        <CardContent>
          <QuizInteraction quiz={quiz} />
        </CardContent>
      </Card>
    </div>
  );
}
