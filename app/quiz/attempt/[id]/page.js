"use client";

import React, { useState, useEffect } from "react";
import { getAttemptDetail } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AttemptDetailPage({ params }) {
  const router = useRouter();
  const attemptId = parseInt(params.id);

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAttempt() {
      try {
        const data = await getAttemptDetail(attemptId);
        setAttempt(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load attempt");
      } finally {
        setLoading(false);
      }
    }

    fetchAttempt();
  }, [attemptId]);

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading attempt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-10">
        <div className="max-w-md w-full p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold mb-2">Error</p>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isPassing = attempt.percentage >= 60;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.push(`/quiz/${attempt.quiz_id}/history`)}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Back to History
        </button>

        {/* Attempt Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Attempt #{attempt.attempt_id}</h1>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isPassing ? "bg-green-500" : "bg-red-500"
            }`}>
              {isPassing ? "✓ PASSED" : "✗ FAILED"}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xl mb-2">{attempt.topic}</p>
              <p className="text-blue-100 text-sm">By: {attempt.user_name || attempt.user_id || 'Anonymous'}</p>
              <p className="text-blue-100 text-sm">Submitted: {formatDate(attempt.submitted_at)}</p>
              {attempt.time_taken_seconds && (
                <p className="text-blue-100 text-sm">Time: {formatTime(attempt.time_taken_seconds)}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold mb-2">{attempt.percentage.toFixed(1)}%</div>
              <div className="text-xl">{attempt.total_score} / {attempt.max_score} points</div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Multiple Choice</div>
            <div className="text-2xl font-bold text-blue-600">
              {attempt.mcq_score} / {attempt.mcq_results.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fill in Blanks</div>
            <div className="text-2xl font-bold text-green-600">
              {attempt.blank_score} / {attempt.blank_results.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Descriptive</div>
            <div className="text-2xl font-bold text-purple-600">Manual Review</div>
          </div>
        </div>

        {/* Detailed Results - reuse same structure as results page */}
        {/* MCQ Results */}
        {attempt.mcq_results.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Multiple Choice Results</h2>
            {attempt.mcq_results.map((result, idx) => (
              <div
                key={result.question_id}
                className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-4 border-l-4 ${
                  result.is_correct ? "border-green-500" : "border-red-500"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-medium text-lg flex-1">
                    <span className="text-gray-500 mr-2">{idx + 1}.</span>
                    {result.question}
                  </p>
                  {result.is_correct ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      ✓ Correct
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                      ✗ Wrong
                    </span>
                  )}
                </div>

                <div className="ml-6 space-y-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Your Answer:</span>
                    <p className={`mt-1 ${result.is_correct ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                      {result.your_answer_text}
                    </p>
                  </div>

                  {!result.is_correct && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Correct Answer:</span>
                      <p className="mt-1 text-green-700 dark:text-green-400">
                        {result.correct_answer_text}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Explanation:</span>
                    <p className="mt-1 text-sm text-blue-900 dark:text-blue-200">{result.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Similar structure for blank and descriptive results... */}
        
        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push(`/quiz/${attempt.quiz_id}`)}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => router.push(`/quiz/${attempt.quiz_id}/history`)}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-semibold transition-colors"
          >
            View All Attempts
          </button>
        </div>
      </div>
    </div>
  );
}
