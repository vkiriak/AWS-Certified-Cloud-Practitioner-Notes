export interface Question {
    number: number;
    text: string;
    options: string[];
    correctAnswer: string;
  }
  
  export interface QuizResult {
    questionNumber: number;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }
  