"use client";

import React, { useState } from "react";
import { generateQuiz } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function QuizGeneratorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    topic: "",
    total_questions: 5,
    num_mcq: 3,
    num_blanks: 1,
    num_descriptive: 1,
    difficulty: "medium",
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("num_") || name === "total_questions" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const sum = formData.num_mcq + formData.num_blanks + formData.num_descriptive;
    if (sum !== formData.total_questions) {
      setError(`Sum of question types (${sum}) must equal total questions (${formData.total_questions})`);
      return;
    }

    if (!formData.topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const quiz = await generateQuiz({
        ...formData,
      });

      // Redirect to quiz attempt page
      router.push(`/quiz/${quiz.quiz_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Generate AI Quiz</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* Topic */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., SQL Injection, Network Security, Cross-Site Scripting"
              required
              className="block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">Enter the topic for quiz generation</p>
          </div>

          {/* Total Questions */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Total Questions <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="total_questions"
              value={formData.total_questions}
              onChange={handleChange}
              min="1"
              max="20"
              required
              className="block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">Total must equal sum of question types below</p>
          </div>

          {/* Question Types */}
          <div>
            <label className="block text-sm font-medium mb-2">Question Types Distribution</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Multiple Choice
                </label>
                <input
                  type="number"
                  name="num_mcq"
                  value={formData.num_mcq}
                  onChange={handleChange}
                  min="0"
                  className="block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Fill in Blanks
                </label>
                <input
                  type="number"
                  name="num_blanks"
                  value={formData.num_blanks}
                  onChange={handleChange}
                  min="0"
                  className="block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Descriptive
                </label>
                <input
                  type="number"
                  name="num_descriptive"
                  value={formData.num_descriptive}
                  onChange={handleChange}
                  min="0"
                  className="block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Current sum: {formData.num_mcq + formData.num_blanks + formData.num_descriptive}
            </p>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty Level</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Info Box */}
          {generating && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm">
              <p className="font-semibold mb-1">⏳ Generating Quiz...</p>
              <p>This may take 10-30 seconds. Please wait while AI generates your questions.</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={generating}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {generating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Quiz... (10-30s)
              </span>
            ) : (
              "Generate Quiz"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
