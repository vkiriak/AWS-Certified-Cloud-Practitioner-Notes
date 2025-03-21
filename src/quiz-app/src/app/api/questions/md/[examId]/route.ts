import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { Question } from '../../../../../types/quiz';

export async function GET(request: Request, { params }: { params: { examId: string } }) {
  try {
    const { examId } = params;
    const filePath = path.join(process.cwd(), '..', '..', 'practice-exam', `${examId}.md`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { content } = matter(fileContents);

    const questions: Question[] = [];
    const tokens = marked.lexer(content);

    tokens.forEach((token: any) => {
      if (token.type === 'list') {
        const questionBlocks = token.raw.split(/\n\n(?=\d+\.\s)/);
        questionBlocks.forEach((block: string) => {
          const question: Partial<Question> = {};
          const lines = block.split('\n');

          const questionMatch = lines[0].match(/^(\d+)\.\s(.+)/);
          if (questionMatch) {
            question.number = parseInt(questionMatch[1]);
            question.text = questionMatch[2];
            question.options = [];
          } else {
            return;
          }

          let inDetails = false;
          lines.slice(1).forEach((line: string) => {
            if (line.includes('<details')) inDetails = true;
            if (!inDetails) {
              const optionMatch = line.match(/^\s*-\s([A-D])\.\s(.+)/);
              if (optionMatch) question.options!.push(`${optionMatch[1]}. ${optionMatch[2]}`);
            }
          });

          const detailsSection = block.match(/<details.*?>.*?<\/details>/s);
          if (detailsSection) {
            const answerMatch = detailsSection[0].match(/Correct answer:\s([A-D])\n/);
            if (answerMatch) question.correctAnswer = answerMatch[1];
          }

          if (question.number && question.text && question.options!.length > 0 && question.correctAnswer) {
            questions.push(question as Question);
          }
        });
      }
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No valid questions found' }, { status: 400 });
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error in /api/questions/md/[examId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}