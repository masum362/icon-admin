import { useQuery } from '@tanstack/react-query';
import { ExamDetails } from '@/types/question';
import axios from 'axios';

const fetchExamDetails = async (examId: string): Promise<ExamDetails> => {
  const { data } = await axios.get(`/api/exams/${examId}`);
  return data;
};

export const useGetExamDetails = (examId: string) => {
  return useQuery({
    queryKey: ['exam', examId],
    queryFn: () => fetchExamDetails(examId),
  });
}; 