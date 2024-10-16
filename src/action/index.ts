"use server";
import { quizzes, questions } from "~/server/db/schema";
import { db } from "~/server/db";

export async function PublishQuiz(data: any) {
  const quiz = await db
    .insert(quizzes)
    .values({
      title: "Test Quiz",
      questions: data,
    })
    .returning();
  return quiz;
}
