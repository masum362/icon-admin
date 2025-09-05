export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
}

export interface CQQuestion {
  id: string;
  question: string;
  marks: number;
}

export interface FillInTheGapsQuestion {
  id: string;
  question: string;
  answer: string;
  marks: number;
}

export interface ExamDetails {
  id: string;
  name: string;
  description: string;
  duration: number;
  totalMarks: number;
  startTime: string;
  endTime: string;
} 