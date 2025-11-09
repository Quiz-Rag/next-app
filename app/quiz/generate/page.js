"use client";

import React, { useState } from "react";
import { generateQuiz, QuizGenerationError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Sparkles, MessageSquare, Zap, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import QuizErrorDisplay from "@/components/quiz/QuizErrorDisplay";
import styles from "./QuizGenerate.module.css";

export default function QuizGeneratorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    quiz_description: "",
    difficulty: "medium",
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showExamples, setShowExamples] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.quiz_description.trim()) {
      setError({
        message: "Please provide a quiz description",
        type: 'invalid_input'
      });
      return;
    }

    if (formData.quiz_description.trim().length < 20) {
      setError({
        message: "Description is too short. Please provide more details (at least 20 characters)",
        type: 'invalid_input'
      });
      return;
    }

    if (formData.quiz_description.trim().length > 500) {
      setError({
        message: "Description is too long. Please keep it under 500 characters",
        type: 'invalid_input'
      });
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const quiz = await generateQuiz({
        quiz_description: formData.quiz_description,
        difficulty: formData.difficulty,
      });

      // Redirect to quiz attempt page
      router.push(`/quiz/${quiz.quiz_id}`);
    } catch (err) {
      if (err instanceof QuizGenerationError) {
        setError(err);
      } else {
        setError({
          message: err instanceof Error ? err.message : "Failed to generate quiz",
          type: 'server_error'
        });
      }
      setGenerating(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  const handleUploadDocs = () => {
    router.push('/train-db');
  };

  const charCount = formData.quiz_description.length;
  const isValidLength = charCount >= 20 && charCount <= 500;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Sparkles size={40} className={styles.headerIcon} />
          <h1 className={styles.title}>Generate AI Quiz</h1>
          <p className={styles.subtitle}>
            Describe your quiz in natural language and let AI create it for you
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Quiz Description */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <MessageSquare size={18} />
              Quiz Description <span className={styles.required}>*</span>
            </label>
            <textarea
              name="quiz_description"
              value={formData.quiz_description}
              onChange={handleChange}
              placeholder="Describe your quiz in natural language. For example:&#10;&#10;• I want a quiz with 5 questions about encryption, 3 about RSA algorithm, and 2 about SQL injection&#10;• Include 6 multiple choice questions, 3 fill in the blanks, and 1 descriptive question&#10;• Focus on practical applications of network security concepts"
              required
              rows={6}
              className={styles.textarea}
            />
            <div className={styles.textareaFooter}>
              <p className={styles.hint}>
                Describe what topics to cover, how many questions, and what types (MCQ, fill-in-the-blank, descriptive)
              </p>
              <span className={`${styles.charCount} ${!isValidLength && charCount > 0 ? styles.charCountInvalid : ''}`}>
                {charCount} / 500 characters {charCount < 20 && charCount > 0 ? '(min 20)' : ''}
              </span>
            </div>
          </div>

          {/* Examples Section */}
          <div className={styles.examplesSection}>
            <button
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className={styles.examplesToggle}
            >
              <Zap size={18} />
              <span>View Example Descriptions</span>
              {showExamples ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {showExamples && (
              <div className={styles.examplesList}>
                <div className={styles.exampleItem}>
                  <p className={styles.exampleText}>
                    &ldquo;Create a quiz about firewalls and network security with 8 questions total. Include 5 multiple choice, 2 fill in the blanks, and 1 descriptive question.&rdquo;
                  </p>
                </div>
                <div className={styles.exampleItem}>
                  <p className={styles.exampleText}>
                    &ldquo;I need 10 questions covering encryption algorithms (AES, RSA, DES) and hashing (MD5, SHA). Make it 7 MCQs and 3 descriptive questions.&rdquo;
                  </p>
                </div>
                <div className={styles.exampleItem}>
                  <p className={styles.exampleText}>
                    &ldquo;Quiz me on SQL injection, XSS, and CSRF attacks. 6 questions total - 4 multiple choice and 2 fill in the blanks focused on prevention techniques.&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Difficulty */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Zap size={18} />
              Difficulty Level <span className={styles.required}>*</span>
            </label>
            <div className={styles.difficultyGrid}>
              <label className={`${styles.difficultyOption} ${formData.difficulty === 'easy' ? styles.difficultySelected : ''}`}>
                <input
                  type="radio"
                  name="difficulty"
                  value="easy"
                  checked={formData.difficulty === 'easy'}
                  onChange={handleChange}
                  className={styles.radioInput}
                />
                <div className={styles.difficultyContent}>
                  <span className={styles.difficultyName}>Easy</span>
                  <span className={styles.difficultyDesc}>Basic concepts and definitions</span>
                </div>
              </label>
              
              <label className={`${styles.difficultyOption} ${formData.difficulty === 'medium' ? styles.difficultySelected : ''}`}>
                <input
                  type="radio"
                  name="difficulty"
                  value="medium"
                  checked={formData.difficulty === 'medium'}
                  onChange={handleChange}
                  className={styles.radioInput}
                />
                <div className={styles.difficultyContent}>
                  <span className={styles.difficultyName}>Medium</span>
                  <span className={styles.difficultyDesc}>Balanced theory and application</span>
                </div>
              </label>
              
              <label className={`${styles.difficultyOption} ${formData.difficulty === 'hard' ? styles.difficultySelected : ''}`}>
                <input
                  type="radio"
                  name="difficulty"
                  value="hard"
                  checked={formData.difficulty === 'hard'}
                  onChange={handleChange}
                  className={styles.radioInput}
                />
                <div className={styles.difficultyContent}>
                  <span className={styles.difficultyName}>Hard</span>
                  <span className={styles.difficultyDesc}>Advanced and complex scenarios</span>
                </div>
              </label>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <QuizErrorDisplay 
              error={error} 
              onRetry={handleRetry}
              onUploadDocs={handleUploadDocs}
            />
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
            disabled={generating || !isValidLength}
            className={styles.submitButton}
          >
            {generating ? (
              <>
                <Loader2 size={24} className={styles.spinner} />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Generate Quiz with AI
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
