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
 * Get the current status of a processing job
 * @param jobId - UUID job identifier
 * @returns Promise with complete job status
 */
export async function getJobStatus(jobId: string): Promise<Job> {
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
