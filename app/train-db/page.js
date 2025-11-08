"use client";

import React, { useState, useEffect } from "react";
import { uploadDocument, getJobStatus } from "@/lib/api";

export default function TrainDBPage() {
  const [file, setFile] = useState(null);
  const [collectionName, setCollectionName] = useState("");
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a PDF or PPTX file first!");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadDocument(file, collectionName || undefined);
      setJobId(result.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Poll job status
  useEffect(() => {
    if (!jobId) return;

    let isActive = true;

    const pollStatus = async () => {
      try {
        const jobData = await getJobStatus(jobId);

        if (isActive) {
          setJob(jobData);

          // Stop polling if completed or failed
          if (jobData.status === "completed" || jobData.status === "failed") {
            isActive = false;
            return;
          }

          // Continue polling every 2 seconds
          setTimeout(pollStatus, 2000);
        }
      } catch (err) {
        console.error("Error polling status:", err);
        if (isActive) {
          // Retry polling even on error
          setTimeout(pollStatus, 2000);
        }
      }
    };

    pollStatus();

    return () => {
      isActive = false;
    };
  }, [jobId]);

  // Reset form
  const handleReset = () => {
    setJobId(null);
    setJob(null);
    setFile(null);
    setCollectionName("");
    setError(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Train Database from PPTX/PDF</h1>

        {!jobId ? (
          // Upload Form
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select File (PDF or PPTX)
              </label>
              <input
                type="file"
                accept=".pdf,.pptx"
                onChange={handleFileChange}
                className="block w-full text-sm border rounded p-2 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Collection Name (Optional)
              </label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="my_documents"
                className="block w-full border rounded p-2 dark:bg-gray-700"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload & Process"}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          // Job Status Display
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Job ID:</p>
              <p className="font-mono text-xs break-all">{jobId}</p>
            </div>

            {job && (
              <>
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : job.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : job.status === "processing"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {job.status.toUpperCase()}
                  </span>
                </div>

                {/* Progress Bar */}
                {job.progress && job.status !== "completed" && job.status !== "failed" && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        {job.progress.current_step.replace(/_/g, " ")}
                      </span>
                      <span className="font-medium">
                        {job.progress.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${job.progress.percentage}%` }}
                      />
                    </div>
                    {job.progress.total_chunks > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Processing: {job.progress.chunks_processed} / {job.progress.total_chunks} chunks
                      </p>
                    )}
                  </div>
                )}

                {/* Success Message */}
                {job.status === "completed" && job.metadata && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800 font-semibold mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Processing Complete!
                    </p>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>• File: {job.file_name}</p>
                      <p>• Chunks created: {job.metadata.chunks_count}</p>
                      <p>• Text length: {job.metadata.text_length.toLocaleString()} characters</p>
                      <p>• Processing time: {job.metadata.processing_time_seconds}s</p>
                      <p>• Collection: {job.collection_name}</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {job.status === "failed" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-800 font-semibold mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Processing Failed
                    </p>
                    <p className="text-sm text-red-700">{job.error}</p>
                  </div>
                )}

                {/* Reset Button */}
                {(job.status === "completed" || job.status === "failed") && (
                  <button
                    onClick={handleReset}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                  >
                    Upload Another Document
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
