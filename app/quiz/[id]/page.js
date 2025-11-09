"use client";

import React, { useState, useEffect } from "react";
import { getQuiz, submitQuiz } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, Edit3, MessageSquare, Trophy, Loader2 } from "lucide-react";
import styles from "./QuizAttempt.module.css";

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
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorBox}>
            <p className={styles.errorTitle}>Error Loading Quiz</p>
            <p className={styles.errorText}>{error}</p>
            <button
              onClick={() => router.push("/quiz/generate")}
              className={styles.errorButton}
            >
              Back to Quiz Generator
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Sticky Timer - Always Visible */}
      <div className={styles.stickyTimer}>
        <Clock size={20} />
        <span>{formatTime(elapsedTime)}</span>
      </div>

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>{quiz.topic}</h1>
          </div>
          <div className={styles.metaInfo}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Total Questions:</span>
              <span>{quiz.total_questions}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Difficulty:</span>
              <span className={styles.difficultyBadge}>{quiz.difficulty}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Types:</span>
              <span>MCQ: {quiz.num_mcq} | Blanks: {quiz.num_blanks} | Descriptive: {quiz.num_descriptive}</span>
            </div>
          </div>
        </div>

        {/* MCQ Questions */}
        {quiz.mcq_questions.length > 0 && (
          <div className={styles.section}>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleMCQ}`}>
              <CheckCircle size={24} />
              Multiple Choice Questions
            </h2>
            {quiz.mcq_questions.map((q, idx) => (
              <div key={q.question_id} className={styles.questionCard}>
                <p className={styles.questionText}>
                  <span className={`${styles.questionNumber} ${styles.questionNumberMCQ}`}>
                    {idx + 1}.
                  </span>
                  {q.question}
                </p>
                <div className={styles.optionsContainer}>
                  {q.options.map((opt) => (
                    <label
                      key={opt.option_id}
                      className={`${styles.option} ${
                        mcqAnswers[q.question_id] === opt.option_id ? styles.optionSelected : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={`mcq-${q.question_id}`}
                        value={opt.option_id}
                        checked={mcqAnswers[q.question_id] === opt.option_id}
                        onChange={() => handleMCQAnswer(q.question_id, opt.option_id)}
                        className={styles.optionRadio}
                      />
                      <span className={styles.optionText}>{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blank Questions */}
        {quiz.blank_questions.length > 0 && (
          <div className={styles.section}>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleBlanks}`}>
              <Edit3 size={24} />
              Fill in the Blanks
            </h2>
            {quiz.blank_questions.map((q, idx) => (
              <div key={q.question_id} className={styles.questionCard}>
                <p className={styles.questionText}>
                  <span className={`${styles.questionNumber} ${styles.questionNumberBlanks}`}>
                    {quiz.num_mcq + idx + 1}.
                  </span>
                  {q.question}
                </p>
                <input
                  type="text"
                  value={blankAnswers[q.question_id] || ""}
                  onChange={(e) => handleBlankAnswer(q.question_id, e.target.value)}
                  placeholder="Type your answer here"
                  className={styles.inputText}
                />
              </div>
            ))}
          </div>
        )}

        {/* Descriptive Questions */}
        {quiz.descriptive_questions.length > 0 && (
          <div className={styles.section}>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleDescriptive}`}>
              <MessageSquare size={24} />
              Descriptive Questions
            </h2>
            {quiz.descriptive_questions.map((q, idx) => (
              <div key={q.question_id} className={styles.questionCard}>
                <p className={styles.questionText}>
                  <span className={`${styles.questionNumber} ${styles.questionNumberDescriptive}`}>
                    {quiz.num_mcq + quiz.num_blanks + idx + 1}.
                  </span>
                  {q.question}
                </p>
                <textarea
                  value={descriptiveAnswers[q.question_id] || ""}
                  onChange={(e) => handleDescriptiveAnswer(q.question_id, e.target.value)}
                  placeholder="Write your detailed answer here..."
                  className={styles.textareaInput}
                />
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorMessageTitle}>Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className={styles.submitSection}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={styles.submitButton}
          >
            {submitting ? (
              <>
                <Loader2 size={24} className={styles.submittingSpinner} />
                Submitting Quiz...
              </>
            ) : (
              <>
                <Trophy size={24} className={styles.submitButtonIcon} />
                Submit Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
