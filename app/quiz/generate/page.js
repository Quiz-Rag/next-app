"use client";

import React, { useState } from "react";
import { generateQuiz } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Sparkles, BookOpen, Target, Loader2 } from "lucide-react";
import styles from "./QuizGenerate.module.css";

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

  const sum = formData.num_mcq + formData.num_blanks + formData.num_descriptive;
  const isValidSum = sum === formData.total_questions;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Sparkles size={40} className={styles.headerIcon} />
          <h1 className={styles.title}>Generate AI Quiz</h1>
          <p className={styles.subtitle}>
            Create custom quizzes powered by AI from your trained documents
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Topic */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <BookOpen size={18} />
              Topic <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., SQL Injection, Network Security, XSS"
              required
              className={styles.input}
            />
            <p className={styles.hint}>Enter the topic for quiz generation</p>
          </div>

          {/* Total Questions */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Target size={18} />
              Total Questions <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              name="total_questions"
              value={formData.total_questions}
              onChange={handleChange}
              min="1"
              max="20"
              required
              className={styles.input}
            />
            <p className={styles.hint}>Total must equal sum of question types below</p>
          </div>

          {/* Question Types */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Question Types Distribution</label>
            <div className={styles.questionGrid}>
              <div className={styles.questionType}>
                <label className={styles.questionLabel}>Multiple Choice</label>
                <input
                  type="number"
                  name="num_mcq"
                  value={formData.num_mcq}
                  onChange={handleChange}
                  min="0"
                  className={styles.input}
                />
              </div>
              <div className={styles.questionType}>
                <label className={styles.questionLabel}>Fill in Blanks</label>
                <input
                  type="number"
                  name="num_blanks"
                  value={formData.num_blanks}
                  onChange={handleChange}
                  min="0"
                  className={styles.input}
                />
              </div>
              <div className={styles.questionType}>
                <label className={styles.questionLabel}>Descriptive</label>
                <input
                  type="number"
                  name="num_descriptive"
                  value={formData.num_descriptive}
                  onChange={handleChange}
                  min="0"
                  className={styles.input}
                />
              </div>
            </div>
            <div className={`${styles.sumIndicator} ${isValidSum ? styles.sumValid : styles.sumInvalid}`}>
              {isValidSum ? "✓" : "✗"} Current sum: {sum} / {formData.total_questions}
            </div>
          </div>

          {/* Difficulty */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Difficulty Level</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorBox}>
              <p className={styles.errorTitle}>Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Generating Message */}
          {generating && (
            <div className={styles.infoBox}>
              <Loader2 size={20} className={styles.spinner} />
              <div>
                <p className={styles.infoTitle}>Generating Quiz...</p>
                <p className={styles.infoText}>
                  This may take 10-30 seconds. Please wait while AI generates your questions.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={generating || !isValidSum}
            className={styles.submitButton}
          >
            {generating ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                Generating Quiz... (10-30s)
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Quiz
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
