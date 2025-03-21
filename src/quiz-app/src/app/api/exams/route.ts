import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const examsDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(examsDir)) {
      return NextResponse.json({ error: 'Exams directory not found' }, { status: 404 });
    }

    const files = fs.readdirSync(examsDir);
    const examFiles = files
      .filter(file => file.startsWith('practice'))
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const id = file.replace('.json', '');
        // Extract the numeric part from the filename (e.g., "1" from "exam1")
        const numberMatch = id.match(/\d+/);
        const number = numberMatch ? parseInt(numberMatch[0], 10) : 0;
        return {
          id,
          displayName: `practice-exam-${number}`,
          number // For sorting
        };
      })
      // Sort by the numeric value
      .sort((a, b) => a.number - b.number)
      // Remove the temporary number field
      .map(({ id, displayName }) => displayName);

    if (examFiles.length === 0) {
      return NextResponse.json({ error: `No exam files found: ${examsDir}` }, { status: 400 });
    }

    return NextResponse.json(examFiles);
  } catch (error) {
    console.error('Error in /api/exams:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}