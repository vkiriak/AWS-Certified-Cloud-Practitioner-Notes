import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Question } from '../../../../../types/quiz';

interface JsonQuestion {
  number: number;
  question: string;
  options: { [key: string]: string };
  correct_answer: string;
  explanation: string;
  reference: string;
}

type Params = Promise<{ examId: string }>;

export async function GET(
  request: Request, 
  { params }: { params: Params }) {
  try {
    const { examId } = await params;
    const jsonExamsDir = path.join(process.cwd(), process.env.JSON_EXAMS_FOLDER || 'src/data/');
    const filePath = path.join(jsonExamsDir, `${examId}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'JSON exam file not found' }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const jsonQuestions: JsonQuestion[] = JSON.parse(fileContents);

    if (!Array.isArray(jsonQuestions) || jsonQuestions.length === 0) {
      return NextResponse.json({ error: 'No valid questions found in JSON file' }, { status: 400 });
    }

    const questions: Question[] = jsonQuestions.map(q => ({
      number: q.number,
      text: q.question,
      options: Object.entries(q.options).map(([key, value]) => `${key}. ${value}`),
      correctAnswer: q.correct_answer
    }));

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error in /api/questions/json/[examId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}