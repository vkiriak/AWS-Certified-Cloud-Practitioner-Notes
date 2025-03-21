'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, QuizResult } from '../../../types/quiz';

export default function QuizPage() {
  const { examId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string[]>>({}); // Track all answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes
  const [isReviewing, setIsReviewing] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(`/api/questions/json/${examId}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setQuestions(data);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Failed to fetch questions:', error);
        setError(error.message);
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, [examId]);

  useEffect(() => {
    if (timeLeft > 0 && !isQuizComplete && !isLoading && !error && !isReviewing) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsReviewing(true);
    }
  }, [timeLeft, isQuizComplete, isLoading, error, isReviewing]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswers(prev =>
      prev.includes(answer) ? prev.filter(a => a !== answer) : [...prev, answer]
    );
  };

  const saveAnswerAndNext = () => {
    if (selectedAnswers.length > 0) {
      setAnswers(prev => ({
        ...prev,
        [questions[currentQuestionIndex].number]: selectedAnswers
      }));
      setSelectedAnswers([]);
      if (currentQuestionIndex + 1 === questions.length) {
        setIsReviewing(true);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      setAnswers(prev => ({
        ...prev,
        [questions[currentQuestionIndex].number]: selectedAnswers
      }));
      setSelectedAnswers(answers[questions[currentQuestionIndex - 1].number] || []);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = () => {
    const results: QuizResult[] = questions.map(q => ({
      questionNumber: q.number,
      userAnswer: (answers[q.number] || []).join(', ') || 'Not answered',
      correctAnswer: q.correctAnswer,
      isCorrect: answers[q.number]?.length === 1 && answers[q.number][0] === q.correctAnswer
    }));
    setResults(results);
    setIsQuizComplete(true);
  };

  const [results, setResults] = useState<QuizResult[]>([]);

  const calculateScore = () => {
    const correctCount = results.filter(r => r.isCorrect).length;
    return (correctCount / questions.length) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (isLoading) return <div className="max-w-2xl mx-auto p-4"><p>Loading questions...</p></div>;
  if (error) return <div className="max-w-2xl mx-auto p-4"><p className="text-red-500">Error: {error}</p></div>;

  if (isQuizComplete) {
    const score = calculateScore();
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Quiz Results - {examId ? examId.replace('practice-exam-', 'Exam ') : 'Unknown Exam'}</h1>
        <p>Score: {score.toFixed(2)}%</p>
        <p>Time Remaining: {formatTime(timeLeft)}</p>
        <h2 className="text-xl mt-4 mb-2">Incorrect Answers:</h2>
        {results.filter(r => !r.isCorrect).map((result, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="mb-4 p-2 border rounded"
          >
            <p>Question {result.questionNumber}: {questions.find(q => q.number === result.questionNumber)?.text}</p>
            <p>Your Answer: {result.userAnswer}</p>
            <p>Correct Answer: {result.correctAnswer}</p>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (isReviewing) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Review Your Answers</h1>
        <p>Time Remaining: {formatTime(timeLeft)}</p>
        <div className="space-y-4 mt-4">
          {questions.map(q => (
            <div key={q.number} className="p-2 border rounded">
              <p>Question {q.number}: {q.text}</p>
              <p>Your Answer: {(answers[q.number] || []).join(', ') || 'Not answered'}</p>
            </div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={submitQuiz}
        >
          Submit Quiz
        </motion.button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <motion.div
          className="bg-blue-600 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="text-right mb-4">
        Time Left: <span className="font-bold">{formatTime(timeLeft)}</span>
      </div>
      <div className="mb-4">
        Question {currentQuestion.number} of {questions.length}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.number}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-4">Question {currentQuestion.number}</h1>
          <p className="mb-4">{currentQuestion.text}</p>
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-2 border rounded ${
                  selectedAnswers.includes(option[0]) ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
                onClick={() => handleAnswer(option[0])}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-4 flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-400"
          onClick={goBack}
          disabled={currentQuestionIndex === 0}
        >
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          onClick={saveAnswerAndNext}
          disabled={selectedAnswers.length === 0}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Review' : 'Next'}
        </motion.button>
      </div>
    </div>
  );
}