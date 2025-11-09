"use client";

import React, { useState, useEffect } from "react";
import { getQuiz, getQuizAttempts, getQuizAnalytics } from "@/lib/api";
import { useRouter } from "next/navigation";
import { BarChart3, Clock, Trophy, Target, TrendingUp, Calendar, User } from "lucide-react";
import styles from "./QuizHistory.module.css";

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

  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return styles.scoreExcellent;
    if (percentage >= 60) return styles.scoreGood;
    if (percentage >= 40) return styles.scoreFair;
    return styles.scorePoor;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => router.push("/quiz")} className={styles.backButton}>
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <button onClick={() => router.push("/quiz")} className={styles.backBtn}>
            ← Back
          </button>
          <div>
            <h1 className={styles.title}>{quiz?.topic || "Quiz"} - History</h1>
            <p className={styles.subtitle}>
              {analytics?.total_attempts || 0} total attempts
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className={styles.analyticsGrid}>
            <div className={styles.analyticsCard}>
              <div className={styles.cardIcon}>
                <BarChart3 size={24} />
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardLabel}>Total Attempts</p>
                <p className={styles.cardValue}>{analytics.total_attempts}</p>
              </div>
            </div>

            <div className={styles.analyticsCard}>
              <div className={styles.cardIcon}>
                <TrendingUp size={24} />
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardLabel}>Average Score</p>
                <p className={styles.cardValue}>{analytics.average_score.toFixed(1)}%</p>
              </div>
            </div>

            <div className={styles.analyticsCard}>
              <div className={styles.cardIcon}>
                <Trophy size={24} />
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardLabel}>Highest Score</p>
                <p className={styles.cardValue}>{analytics.highest_score.toFixed(1)}%</p>
              </div>
            </div>

            <div className={styles.analyticsCard}>
              <div className={styles.cardIcon}>
                <Clock size={24} />
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardLabel}>Avg Time</p>
                <p className={styles.cardValue}>
                  {formatTime(Math.round(analytics.average_time_seconds))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Attempts Table */}
        <div className={styles.tableSection}>
          <h2 className={styles.sectionTitle}>
            <Target size={20} />
            All Attempts
          </h2>

          {attempts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No attempts yet. Be the first to take this quiz!</p>
              <button
                onClick={() => router.push(`/quiz/${quizId}`)}
                className={styles.takeQuizButton}
              >
                Take Quiz Now
              </button>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Attempt</th>
                    <th>User</th>
                    <th>Score</th>
                    <th>Time</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt, index) => (
                    <tr
                      key={attempt.attempt_id}
                      onClick={() => router.push(`/quiz/attempt/${attempt.attempt_id}`)}
                      className={styles.tableRow}
                    >
                      <td>
                        <div className={styles.attemptBadge}>#{attempts.length - index}</div>
                      </td>
                      <td>
                        <div className={styles.userInfo}>
                          <User size={16} />
                          {attempt.user_name || attempt.user_id || "Anonymous"}
                        </div>
                      </td>
                      <td>
                        <div className={`${styles.scoreCell} ${getScoreColor(attempt.percentage)}`}>
                          {attempt.percentage.toFixed(1)}%
                        </div>
                      </td>
                      <td>
                        <div className={styles.timeCell}>
                          <Clock size={14} />
                          {formatTime(attempt.time_taken_seconds)}
                        </div>
                      </td>
                      <td>
                        <div className={styles.dateCell}>
                          <Calendar size={14} />
                          {formatDate(attempt.submitted_at)}
                        </div>
                      </td>
                      <td>
                        <button className={styles.viewButton}>View →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Retake Button */}
        <div className={styles.actions}>
          <button
            onClick={() => router.push(`/quiz/${quizId}`)}
            className={styles.retakeButton}
          >
            <Trophy size={20} />
            Take Quiz Again
          </button>
        </div>
      </div>
    </div>
  );
}
