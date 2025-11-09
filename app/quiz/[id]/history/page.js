"use client";

import React, { useState, useEffect } from "react";
import { getQuiz, getQuizAttempts, getQuizAnalytics } from "@/lib/api";
import { useRouter } from "next/navigation";
import { TrendingUp, Clock, Users, Award, BarChart3 } from "lucide-react";

export default function QuizHistoryPage({ params }) {
  const router = useRouter();
  const quizId = parseInt(params.id);

  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [quizData, attemptsData, analyticsData] = await Promise.all([
          getQuiz(quizId),
          getQuizAttempts(quizId, 0, 50),
          getQuizAnalytics(quizId),
        ]);

        setQuiz(quizData);
        setAttempts(attemptsData);
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [quizId]);

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
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
          <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
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
            onClick={() => router.push(`/quiz/${quizId}`)}
            className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Back to Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/quiz/${quizId}`)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Quiz
          </button>
          <h1 className="text-3xl font-bold mb-2">{quiz.topic} - History & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all attempts and performance statistics for this quiz
          </p>
        </div>

        {/* Analytics Summary Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Attempts</h3>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold">{analytics.total_attempts}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Average Score</h3>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold">{analytics.average_score.toFixed(1)}%</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Highest Score</h3>
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold">{analytics.highest_score.toFixed(1)}%</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Avg Time</h3>
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold">{formatTime(analytics.average_time_seconds)}</p>
            </div>
          </div>
        )}

        {/* Attempts List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              All Attempts ({attempts.length})
            </h2>
          </div>

          {attempts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No attempts yet. Be the first to take this quiz!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Attempt #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {attempts.map((attempt) => (
                    <tr
                      key={attempt.attempt_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => router.push(`/quiz/attempt/${attempt.attempt_id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        #{attempt.attempt_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {attempt.user_name || attempt.user_id || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <span className="font-semibold mr-2">{attempt.percentage.toFixed(1)}%</span>
                          <span className="text-gray-500">
                            ({attempt.total_score}/{attempt.max_score})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatTime(attempt.time_taken_seconds)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(attempt.submitted_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            attempt.percentage >= 60
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {attempt.percentage >= 60 ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push(`/quiz/${quizId}`)}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Take Quiz
          </button>
          <button
            onClick={() => router.push("/quiz/generate")}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 font-semibold transition-colors"
          >
            Generate New Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
