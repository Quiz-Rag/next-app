"use client";

import React, { useState, useEffect } from "react";
import { getAttemptDetail } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Trophy,
  TrendingUp,
  BarChart,
  XCircle,
  Clock,
  Calendar,
  Hash,
  User,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  BarChart3,
} from "lucide-react";
import styles from "./AttemptDetail.module.css";

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
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreData = (percentage) => {
    if (percentage >= 80)
      return {
        icon: <Trophy size={64} className={styles.iconExcellent} />,
        class: styles.scoreExcellent,
        feedback: "Excellent Work!",
        feedbackClass: styles.feedbackExcellent,
      };
    if (percentage >= 60)
      return {
        icon: <TrendingUp size={64} className={styles.iconGood} />,
        class: styles.scoreGood,
        feedback: "Good Job!",
        feedbackClass: styles.feedbackGood,
      };
    if (percentage >= 40)
      return {
        icon: <BarChart size={64} className={styles.iconFair} />,
        class: styles.scoreFair,
        feedback: "Keep Practicing!",
        feedbackClass: styles.feedbackFair,
      };
    return {
      icon: <XCircle size={64} className={styles.iconPoor} />,
      class: styles.scorePoor,
      feedback: "Needs Improvement",
      feedbackClass: styles.feedbackPoor,
    };
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading attempt details...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <XCircle size={48} />
          <p>{error || "Attempt not found"}</p>
          <button onClick={() => router.push("/quiz")} className={styles.backButton}>
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const scoreData = getScoreData(attempt.percentage);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <button
            onClick={() => router.push(`/quiz/${attempt.quiz_id}/history`)}
            className={styles.backBtn}
          >
            ← Back to History
          </button>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Attempt #{attempt.attempt_id}</h1>
            <p className={styles.subtitle}>{attempt.topic}</p>
          </div>
        </div>

        {/* Score Card */}
        <div className={styles.scoreCard}>
          <div className={styles.scoreIcon}>{scoreData.icon}</div>
          <p className={styles.scoreLabel}>Final Score</p>
          <div className={`${styles.scoreValue} ${scoreData.class}`}>
            {attempt.percentage.toFixed(1)}%
          </div>
          <p className={`${styles.scoreFeedback} ${scoreData.feedbackClass}`}>
            {scoreData.feedback}
          </p>
          <div className={styles.scoreBreakdown}>
            {attempt.total_score} / {attempt.max_score} points
          </div>
        </div>

        {/* Metadata */}
        <div className={styles.metadata}>
          <div className={styles.metadataCard}>
            <div className={styles.metadataIcon}>
              <Hash size={20} />
            </div>
            <div className={styles.metadataContent}>
              <p className={styles.metadataLabel}>Attempt ID</p>
              <p className={styles.metadataValue}>#{attempt.attempt_id}</p>
            </div>
          </div>

          <div className={styles.metadataCard}>
            <div className={styles.metadataIcon}>
              <Clock size={20} />
            </div>
            <div className={styles.metadataContent}>
              <p className={styles.metadataLabel}>Time Taken</p>
              <p className={styles.metadataValue}>
                {formatTime(attempt.time_taken_seconds)}
              </p>
            </div>
          </div>

          <div className={styles.metadataCard}>
            <div className={styles.metadataIcon}>
              <Calendar size={20} />
            </div>
            <div className={styles.metadataContent}>
              <p className={styles.metadataLabel}>Submitted</p>
              <p className={styles.metadataValue}>{formatDate(attempt.submitted_at)}</p>
            </div>
          </div>

          {attempt.user_name && (
            <div className={styles.metadataCard}>
              <div className={styles.metadataIcon}>
                <User size={20} />
              </div>
              <div className={styles.metadataContent}>
                <p className={styles.metadataLabel}>User</p>
                <p className={styles.metadataValue}>{attempt.user_name}</p>
              </div>
            </div>
          )}
        </div>

        {/* MCQ Results */}
        {attempt.mcq_results && attempt.mcq_results.length > 0 && (
          <div className={styles.questionsSection}>
            <h2 className={styles.sectionTitle}>
              <CheckCircle size={24} />
              Multiple Choice Questions
            </h2>
            {attempt.mcq_results.map((result, idx) => (
              <div
                key={result.question_id}
                className={`${styles.questionCard} ${
                  result.is_correct ? styles.questionCardCorrect : styles.questionCardIncorrect
                }`}
              >
                <div className={styles.questionHeader}>
                  <p className={styles.questionNumber}>
                    <span className={styles.questionNumberSpan}>{idx + 1}.</span>
                    {result.question}
                  </p>
                  <div
                    className={`${styles.questionStatus} ${
                      result.is_correct ? styles.statusCorrect : styles.statusIncorrect
                    }`}
                  >
                    {result.is_correct ? (
                      <>
                        <CheckCircle size={16} />
                        Correct
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Wrong
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.answerSection}>
                  <p className={styles.answerLabel}>Your Answer:</p>
                  <div
                    className={`${styles.answerText} ${
                      result.is_correct ? styles.answerCorrect : styles.answerIncorrect
                    }`}
                  >
                    {result.your_answer_text}
                  </div>

                  {!result.is_correct && (
                    <>
                      <p className={styles.answerLabel}>Correct Answer:</p>
                      <div className={`${styles.answerText} ${styles.answerCorrect}`}>
                        {result.correct_answer_text}
                      </div>
                    </>
                  )}

                  {result.explanation && (
                    <div className={styles.explanation}>
                      <p className={styles.explanationLabel}>
                        <Lightbulb size={16} />
                        Explanation
                      </p>
                      <p className={styles.explanationText}>{result.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blank Results */}
        {attempt.blank_results && attempt.blank_results.length > 0 && (
          <div className={styles.questionsSection}>
            <h2 className={styles.sectionTitle}>
              <AlertCircle size={24} />
              Fill in the Blanks
            </h2>
            {attempt.blank_results.map((result, idx) => (
              <div
                key={result.question_id}
                className={`${styles.questionCard} ${
                  result.is_correct ? styles.questionCardCorrect : styles.questionCardIncorrect
                }`}
              >
                <div className={styles.questionHeader}>
                  <p className={styles.questionNumber}>
                    <span className={styles.questionNumberSpan}>
                      {(attempt.mcq_results?.length || 0) + idx + 1}.
                    </span>
                    {result.question}
                  </p>
                  <div
                    className={`${styles.questionStatus} ${
                      result.is_correct ? styles.statusCorrect : styles.statusIncorrect
                    }`}
                  >
                    {result.is_correct ? (
                      <>
                        <CheckCircle size={16} />
                        Correct
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Wrong
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.answerSection}>
                  <p className={styles.answerLabel}>Your Answer:</p>
                  <div
                    className={`${styles.answerText} ${
                      result.is_correct ? styles.answerCorrect : styles.answerIncorrect
                    }`}
                  >
                    "{result.your_answer || '(No answer provided)'}"
                  </div>

                  {!result.is_correct && (
                    <>
                      <p className={styles.answerLabel}>Correct Answer:</p>
                      <div className={`${styles.answerText} ${styles.answerCorrect}`}>
                        "{result.correct_answer}"
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Descriptive Results */}
        {attempt.descriptive_results && attempt.descriptive_results.length > 0 && (
          <div className={styles.questionsSection}>
            <h2 className={styles.sectionTitle}>
              <Lightbulb size={24} />
              Descriptive Questions
            </h2>
            <div className={styles.warningBox}>
              <p className={styles.warningText}>
                <strong>Note:</strong> Descriptive answers require manual grading.
              </p>
            </div>

            {attempt.descriptive_results.map((result, idx) => (
              <div
                key={result.question_id}
                className={`${styles.questionCard} ${styles.questionCardPartial}`}
              >
                <div className={styles.questionHeader}>
                  <p className={styles.questionNumber}>
                    <span className={styles.questionNumberSpan}>
                      {(attempt.mcq_results?.length || 0) +
                        (attempt.blank_results?.length || 0) +
                        idx +
                        1}
                      .
                    </span>
                    {result.question}
                  </p>
                  <div className={`${styles.questionStatus} ${styles.statusPartial}`}>
                    <AlertCircle size={16} />
                    {result.marks_obtained} / {result.max_marks} marks
                  </div>
                </div>

                <div className={styles.answerSection}>
                  <p className={styles.answerLabel}>Your Answer:</p>
                  <div className={styles.answerTextArea}>
                    {result.your_answer || "(No answer provided)"}
                  </div>

                  <p className={styles.answerLabel}>Expected Answer:</p>
                  <div className={`${styles.answerTextArea} ${styles.answerExpected}`}>
                    {result.expected_answer}
                  </div>

                  {result.feedback && (
                    <div className={styles.explanation}>
                      <p className={styles.explanationLabel}>
                        <Lightbulb size={16} />
                        Feedback
                      </p>
                      <p className={styles.explanationText}>{result.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={() => router.push(`/quiz/${attempt.quiz_id}/history`)}
            className={`${styles.actionButton} ${styles.secondaryButton}`}
          >
            <BarChart3 size={20} />
            View All Attempts
          </button>
          <button
            onClick={() => router.push(`/quiz/${attempt.quiz_id}`)}
            className={`${styles.actionButton} ${styles.primaryButton}`}
          >
            <RotateCcw size={20} />
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
