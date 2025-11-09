// lib/api.ts - FastAPI Integration Service

const API_BASE_URL = 'http://localhost:8000';

// ============= TypeScript Types =============

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface JobProgress {
  current_step: string;
  percentage: number;
  chunks_processed: number;
  total_chunks: number;
}

export interface JobMetadata {
  chunks_count: number;
  text_length: number;
  processing_time_seconds: number;
}

export interface Job {
  job_id: string;
  status: JobStatus;
  file_name: string;
  file_type: 'pdf' | 'pptx';
  collection_name: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  progress: JobProgress | null;
  metadata: JobMetadata | null;
  error: string | null;
}

export interface UploadResponse {
  job_id: string;
  status: 'queued';
  message: string;
}

export interface BatchUploadResponse {
  job_id: string;
  status: 'queued';
  total_files: number;
  message: string;
}

export interface FileProgress {
  current_step: string;
  percentage: number;
  chunks_processed: number;
  total_chunks: number;
}

export interface BatchFile {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  chunks: number;
  error: string | null;
}

export interface BatchJobMetadata {
  total_chunks: number;
  total_text_length: number;
  processing_time_seconds: number;
  successful_files: number;
  failed_files: number;
}

export interface BatchJob {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'partially_completed' | 'failed';
  is_batch: true;
  total_files: number;
  processed_files: number;
  current_file: string | null;
  current_file_progress?: FileProgress;
  overall_progress: number;
  files: BatchFile[];
  collection_name: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  metadata?: BatchJobMetadata;
  error: string | null;
}

// ============= API Functions =============

/**
 * Upload a document to FastAPI for processing
 * @param file - PDF or PPTX file
 * @param collectionName - Optional collection name (defaults to filename)
 * @returns Promise with job_id
 */
export async function uploadDocument(
  file: File,
  collectionName?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  if (collectionName) {
    formData.append('collection_name', collectionName);
  }

  const response = await fetch(`${API_BASE_URL}/api/start-embedding`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
}

/**
 * Upload multiple documents for batch processing (2-10 files)
 * @param files - Array of PDF or PPTX files (2-10 files)
 * @param collectionName - Optional collection name for all files
 * @returns Promise with job_id and file count
 */
export async function uploadDocumentBatch(
  files: File[],
  collectionName?: string
): Promise<BatchUploadResponse> {
  if (files.length < 2) {
    throw new Error('Minimum 2 files required for batch upload');
  }

  if (files.length > 10) {
    throw new Error('Maximum 10 files allowed per batch');
  }

  const formData = new FormData();
  
  // Append all files with 'files' field name
  files.forEach(file => {
    formData.append('files', file);
  });

  if (collectionName) {
    formData.append('collection_name', collectionName);
  }

  const response = await fetch(`${API_BASE_URL}/api/start-embedding-batch`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Batch upload failed' }));
    throw new Error(error.detail || 'Batch upload failed');
  }

  return response.json();
}

/**
 * Get the current status of a processing job
 * @param jobId - UUID job identifier
 * @returns Promise with complete job status (single or batch)
 */
export async function getJobStatus(jobId: string): Promise<Job | BatchJob> {
  const response = await fetch(`${API_BASE_URL}/api/job-status/${jobId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Job not found');
    }
    throw new Error('Failed to fetch job status');
  }

  return response.json();
}

/**
 * Check API health status
 * @returns Promise with health check data
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}

// ============= Quiz API Types =============

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizGenerateRequest {
  topic: string;
  total_questions: number;
  num_mcq: number;
  num_blanks: number;
  num_descriptive: number;
  difficulty?: Difficulty;
  collection_name?: string;
}

export interface MCQOption {
  option_id: number;
  text: string;
}

export interface MCQQuestion {
  question_id: number;
  question: string;
  options: MCQOption[];
}

export interface BlankQuestion {
  question_id: number;
  question: string;
}

export interface DescriptiveQuestion {
  question_id: number;
  question: string;
}

export interface Quiz {
  quiz_id: number;
  topic: string;
  total_questions: number;
  num_mcq: number;
  num_blanks: number;
  num_descriptive: number;
  difficulty: string;
  mcq_questions: MCQQuestion[];
  blank_questions: BlankQuestion[];
  descriptive_questions: DescriptiveQuestion[];
  created_at: string;
}

export interface QuizSubmission {
  quiz_id: number;
  user_id?: string;              // NEW: Optional user identifier
  user_name?: string;            // NEW: Optional user display name
  time_taken_seconds?: number;   // NEW: Time taken to complete quiz
  mcq_answers: { question_id: number; selected_option_id: number }[];
  blank_answers: { question_id: number; answer: string }[];
  descriptive_answers: { question_id: number; answer: string }[];
}

export interface MCQResult {
  question_id: number;
  question: string;
  your_answer: number;
  your_answer_text: string;
  correct_answer: number;
  correct_answer_text: string;
  is_correct: boolean;
  explanation: string;
}

export interface BlankResult {
  question_id: number;
  question: string;
  your_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

export interface DescriptiveResult {
  question_id: number;
  question: string;
  your_answer: string;
  sample_answer: string;
  key_points: string[];
  explanation: string;
}

export interface QuizGradingResponse {
  attempt_id: number;            // NEW: Unique attempt identifier
  quiz_id: number;
  topic: string;
  total_questions: number;
  mcq_results: MCQResult[];
  blank_results: BlankResult[];
  descriptive_results: DescriptiveResult[];
  mcq_score: number;
  blank_score: number;
  total_auto_score: number;
  max_auto_score: number;
  percentage: number;
  time_taken_seconds?: number;   // NEW: Time taken if provided
  submitted_at: string;          // NEW: Submission timestamp
}

export interface QuizListItem {
  quiz_id: number;
  topic: string;
  total_questions: number;
  difficulty: string;
  created_at: string;
}

// ============= Attempt Tracking Types (NEW) =============

export interface QuizAttempt {
  attempt_id: number;
  quiz_id: number;
  user_id?: string;
  user_name?: string;
  mcq_score: number;
  blank_score: number;
  total_score: number;
  max_score: number;
  percentage: number;
  time_taken_seconds?: number;
  submitted_at: string;
}

export interface QuizAttemptDetail extends QuizAttempt {
  topic: string;
  total_questions: number;
  mcq_results: MCQResult[];
  blank_results: BlankResult[];
  descriptive_results: DescriptiveResult[];
}

export interface QuizAnalytics {
  quiz_id: number;
  topic: string;
  total_attempts: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  average_time_seconds: number;
  completion_rate: number;
}

// ============= Quiz API Functions =============

/**
 * Generate a new quiz with AI
 * @param request - Quiz generation parameters
 * @returns Promise with generated quiz (without answers)
 */
export async function generateQuiz(request: QuizGenerateRequest): Promise<Quiz> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Quiz generation failed' }));
    throw new Error(error.detail || 'Quiz generation failed');
  }

  return response.json();
}

/**
 * Submit quiz answers for grading
 * @param submission - Quiz answers
 * @returns Promise with grading results
 */
export async function submitQuiz(submission: QuizSubmission): Promise<QuizGradingResponse> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Quiz submission failed' }));
    throw new Error(error.detail || 'Quiz submission failed');
  }

  return response.json();
}

/**
 * Get a specific quiz by ID (without answers)
 * @param quizId - Quiz identifier
 * @returns Promise with quiz data
 */
export async function getQuiz(quizId: number): Promise<Quiz> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/${quizId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Quiz not found');
    }
    throw new Error('Failed to fetch quiz');
  }

  return response.json();
}

/**
 * List all quizzes with pagination
 * @param skip - Number of quizzes to skip
 * @param limit - Maximum number of quizzes to return
 * @returns Promise with array of quiz summaries
 */
export async function listQuizzes(skip = 0, limit = 10): Promise<QuizListItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/list/all?skip=${skip}&limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch quiz list');
  }

  return response.json();
}

// ============= Attempt Tracking API Functions (NEW) =============

/**
 * Get all attempts for a specific quiz
 * @param quizId - Quiz identifier
 * @param skip - Number of attempts to skip
 * @param limit - Maximum number of attempts to return
 * @returns Promise with array of quiz attempts
 */
export async function getQuizAttempts(
  quizId: number,
  skip = 0,
  limit = 10
): Promise<QuizAttempt[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/quiz/${quizId}/attempts?skip=${skip}&limit=${limit}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Quiz not found');
    }
    throw new Error('Failed to fetch quiz attempts');
  }

  return response.json();
}

/**
 * Get detailed information about a specific attempt
 * @param attemptId - Attempt identifier
 * @returns Promise with full attempt details
 */
export async function getAttemptDetail(attemptId: number): Promise<QuizAttemptDetail> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/attempt/${attemptId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Attempt not found');
    }
    throw new Error('Failed to fetch attempt details');
  }

  return response.json();
}

/**
 * Get all attempts by a specific user
 * @param userId - User identifier
 * @param skip - Number of attempts to skip
 * @param limit - Maximum number of attempts to return
 * @returns Promise with array of user's quiz attempts
 */
export async function getUserAttempts(
  userId: string,
  skip = 0,
  limit = 10
): Promise<QuizAttempt[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/quiz/user/${userId}/attempts?skip=${skip}&limit=${limit}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found');
    }
    throw new Error('Failed to fetch user attempts');
  }

  return response.json();
}

/**
 * Get analytics for a specific quiz
 * @param quizId - Quiz identifier
 * @returns Promise with quiz analytics data
 */
export async function getQuizAnalytics(quizId: number): Promise<QuizAnalytics> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/${quizId}/analytics`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Quiz not found');
    }
    throw new Error('Failed to fetch quiz analytics');
  }

  return response.json();
}
