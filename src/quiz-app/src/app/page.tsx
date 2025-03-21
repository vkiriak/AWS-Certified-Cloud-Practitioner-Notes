'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [exams, setExams] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch('/api/exams');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setExams(data);
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          console.error('An unknown error occurred:', error);
          setError('An unknown error occurred');
        };
        setIsLoading(false);
      }
    }
    fetchExams();
  }, []);

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-4"><p>Loading exams...</p></div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-4"><p className="text-red-500">Error: {error}</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Select an Exam</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {exams.map(exam => (
          <li key={exam}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={`/quiz/${exam}`}
                //className="block p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                //className="block p-4 bg-gray-900 text-white rounded-lg border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_15px_rgba(59,130,246,0.7)] transition-shadow"
                className="block p-4 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
>
                {exam.replace('practice-exam-', 'Exam ')}
              </Link>
            </motion.div>
          </li>
        ))}
      </ul>
    </div>
  );
}