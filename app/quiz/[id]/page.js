"use client";

import React, { useState, useEffect } from "react";
import { getQuiz, submitQuiz } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function QuizAttemptPage({ params }) {
  const router = useRouter();
  const quizId = parseInt(params.id);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Timer state
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // User state (optional)
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);

  // Answers state
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [blankAnswers, setBlankAnswers] = useState({});
  const [descriptiveAnswers, setDescriptiveAnswers] = useState({});

  // Fetch quiz on mount
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const data = await getQuiz(quizId);
        setQuiz(data);
        setStartTime(Date.now()); // Start timer when quiz loads
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId]);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('quiz-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id);
        setUserName(user.name);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  // Update elapsed time every second
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Handle MCQ answer
  const handleMCQAnswer = (questionId, optionId) => {
    setMcqAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // Handle blank answer
  const handleBlankAnswer = (questionId, answer) => {
    setBlankAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Handle descriptive answer
  const handleDescriptiveAnswer = (questionId, answer) => {
    setDescriptiveAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Format elapsed time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Submit quiz
  const handleSubmit = async () => {
    // Validation
    const mcqAnswered = Object.keys(mcqAnswers).length;
    const blanksAnswered = Object.keys(blankAnswers).length;
    const descriptiveAnswered = Object.keys(descriptiveAnswers).length;

    if (mcqAnswered < quiz.num_mcq || blanksAnswered < quiz.num_blanks || descriptiveAnswered < quiz.num_descriptive) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const submission = {
        quiz_id: quizId,
        user_id: userId,              // Optional
        user_name: userName,          // Optional
        time_taken_seconds: elapsedTime, // Time tracking
        mcq_answers: Object.entries(mcqAnswers).map(([qId, optId]) => ({
          question_id: parseInt(qId),
          selected_option_id: optId,
        })),
        blank_answers: Object.entries(blankAnswers).map(([qId, ans]) => ({
          question_id: parseInt(qId),
          answer: ans,
        })),
        descriptive_answers: Object.entries(descriptiveAnswers).map(([qId, ans]) => ({
          question_id: parseInt(qId),
          answer: ans,
        })),
      };

      const results = await submitQuiz(submission);

      // Store results in session storage for results page
      sessionStorage.setItem(`quiz_results_${quizId}`, JSON.stringify(results));

      // Redirect to results page
      router.push(`/quiz/results/${quizId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen p-10">
        <div className="max-w-md w-full p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold mb-2">Error Loading Quiz</p>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push("/quiz/generate")}
            className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Back to Quiz Generator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold">{quiz.topic}</h1>
            {/* Timer Display */}
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Elapsed</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <span className="font-semibold mr-2">Total Questions:</span>
              <span>{quiz.total_questions}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">Difficulty:</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded capitalize">
                {quiz.difficulty}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">Types:</span>
              <span>MCQ: {quiz.num_mcq} | Blanks: {quiz.num_blanks} | Descriptive: {quiz.num_descriptive}</span>
            </div>
          </div>
        </div>

        {/* MCQ Questions */}
        {quiz.mcq_questions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
              Multiple Choice Questions
            </h2>
            {quiz.mcq_questions.map((q, idx) => (
              <div key={q.question_id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-4">
                <p className="font-medium mb-4 text-lg">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">{idx + 1}.</span>
                  {q.question}
                </p>
                <div className="space-y-2 ml-6">
                  {q.options.map((opt) => (
                    <label
                      key={opt.option_id}
                      className={`flex items-start space-x-3 p-3 rounded cursor-pointer transition-colors ${
                        mcqAnswers[q.question_id] === opt.option_id
                          ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`mcq-${q.question_id}`}
                        value={opt.option_id}
                        checked={mcqAnswers[q.question_id] === opt.option_id}
                        onChange={() => handleMCQAnswer(q.question_id, opt.option_id)}
                        className="w-4 h-4 mt-1 text-blue-600"
                      />
                      <span className="flex-1">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blank Questions */}
        {quiz.blank_questions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              Fill in the Blanks
            </h2>
            {quiz.blank_questions.map((q, idx) => (
              <div key={q.question_id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-4">
                <p className="font-medium mb-3 text-lg">
                  <span className="text-green-600 dark:text-green-400 mr-2">
                    {quiz.num_mcq + idx + 1}.
                  </span>
                  {q.question}
                </p>
                <input
                  type="text"
                  value={blankAnswers[q.question_id] || ""}
                  onChange={(e) => handleBlankAnswer(q.question_id, e.target.value)}
                  placeholder="Type your answer here"
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded p-3 dark:bg-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* Descriptive Questions */}
        {quiz.descriptive_questions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Descriptive Questions
            </h2>
            {quiz.descriptive_questions.map((q, idx) => (
              <div key={q.question_id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-4">
                <p className="font-medium mb-3 text-lg">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">
                    {quiz.num_mcq + quiz.num_blanks + idx + 1}.
                  </span>
                  {q.question}
                </p>
                <textarea
                  value={descriptiveAnswers[q.question_id] || ""}
                  onChange={(e) => handleDescriptiveAnswer(q.question_id, e.target.value)}
                  placeholder="Write your detailed answer here..."
                  rows="6"
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded p-3 dark:bg-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none resize-y"
                />
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg mb-4">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="sticky bottom-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all transform hover:scale-105"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Quiz...
              </span>
            ) : (
              "Submit Quiz"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
