"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuizResultsPage({ params }) {
  const router = useRouter();
  const quizId = parseInt(params.id);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve results from session storage
    const storedResults = sessionStorage.getItem(`quiz_results_${quizId}`);
    
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    
    setLoading(false);
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen p-10">
        <div className="max-w-md w-full p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-semibold mb-2">Results Not Found</p>
          <p className="text-yellow-700 mb-4">
            Quiz results are not available. Please take the quiz first.
          </p>
          <button
            onClick={() => router.push(`/quiz/${quizId}`)}
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
          >
            Go to Quiz
          </button>
        </div>
      </div>
    );
  }

  const scorePercentage = results.percentage;
  const isPassing = scorePercentage >= 60;

  // Format time helper
  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header with Score */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Quiz Results</h1>
            {results.attempt_id && (
              <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                Attempt #{results.attempt_id}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xl mb-2">{results.topic}</p>
              <p className="text-blue-100">Total Questions: {results.total_questions}</p>
              {results.submitted_at && (
                <p className="text-blue-100 text-sm mt-1">
                  Submitted: {formatDate(results.submitted_at)}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold mb-2">{scorePercentage.toFixed(1)}%</div>
              <div className="text-xl">
                {results.total_auto_score} / {results.max_auto_score} points
              </div>
              {results.time_taken_seconds && (
                <div className="text-blue-100 text-sm mt-2">
                  Time: {formatTime(results.time_taken_seconds)}
                </div>
              )}
              <div className={`mt-2 px-4 py-2 rounded-full text-sm font-semibold ${
                isPassing ? "bg-green-500" : "bg-red-500"
              }`}>
                {isPassing ? "✓ PASSED" : "✗ FAILED"}
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Multiple Choice</div>
            <div className="text-2xl font-bold text-blue-600">
              {results.mcq_score} / {results.mcq_results.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fill in Blanks</div>
            <div className="text-2xl font-bold text-green-600">
              {results.blank_score} / {results.blank_results.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Descriptive</div>
            <div className="text-2xl font-bold text-purple-600">
              Manual Review Required
            </div>
          </div>
        </div>

        {/* MCQ Results */}
        {results.mcq_results.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Multiple Choice Results</h2>
            {results.mcq_results.map((result, idx) => (
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

        {/* Blank Results */}
        {results.blank_results.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Fill in the Blanks Results</h2>
            {results.blank_results.map((result, idx) => (
              <div
                key={result.question_id}
                className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-4 border-l-4 ${
                  result.is_correct ? "border-green-500" : "border-red-500"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-medium text-lg flex-1">
                    <span className="text-gray-500 mr-2">{results.mcq_results.length + idx + 1}.</span>
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
                    <p className={`mt-1 font-mono ${result.is_correct ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                      "{result.your_answer}"
                    </p>
                  </div>

                  {!result.is_correct && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Correct Answer:</span>
                      <p className="mt-1 text-green-700 dark:text-green-400 font-mono">
                        "{result.correct_answer}"
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

        {/* Descriptive Results */}
        {results.descriptive_results.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Descriptive Questions (Manual Review)</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Note:</strong> Descriptive answers are not auto-graded. Below are sample answers and key points for reference.
              </p>
            </div>

            {results.descriptive_results.map((result, idx) => (
              <div
                key={result.question_id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-4 border-l-4 border-purple-500"
              >
                <p className="font-medium text-lg mb-3">
                  <span className="text-gray-500 mr-2">
                    {results.mcq_results.length + results.blank_results.length + idx + 1}.
                  </span>
                  {result.question}
                </p>

                <div className="ml-6 space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Your Answer:</span>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-sm whitespace-pre-wrap">{result.your_answer}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Sample Answer:</span>
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <p className="text-sm whitespace-pre-wrap text-green-900 dark:text-green-200">
                        {result.sample_answer}
                      </p>
                    </div>
                  </div>

                  {result.key_points.length > 0 && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Key Points to Cover:</span>
                      <ul className="mt-2 ml-4 space-y-1">
                        {result.key_points.map((point, i) => (
                          <li key={i} className="text-sm text-gray-700 dark:text-gray-300 list-disc">
                            {point}
                          </li>
                        ))}
                      </ul>
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

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/quiz/generate")}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Generate New Quiz
          </button>
          <button
            onClick={() => router.push(`/quiz/${quizId}`)}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-semibold transition-colors"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => router.push(`/quiz/${quizId}/history`)}
            className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
}
