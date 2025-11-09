"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  TrendingUp,
  BarChart,
  XCircle,
  Clock,
  Calendar,
  Hash,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  Plus,
  History,
  Award,
  Target,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import styles from "./QuizResults.module.css";

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

  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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

  const getDescriptiveScoreStatus = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return { class: styles.statusCorrect, label: "Excellent" };
    if (percentage >= 60) return { class: styles.statusPartial, label: "Good" };
    if (percentage >= 40) return { class: styles.statusPartial, label: "Fair" };
    return { class: styles.statusIncorrect, label: "Needs Work" };
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorBox}>
            <p className={styles.errorTitle}>Results Not Found</p>
            <p className={styles.errorText}>
              Quiz results are not available. Please take the quiz first.
            </p>
            <button
              onClick={() => router.push(`/quiz/${quizId}`)}
              className={styles.errorButton}
            >
              Go to Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const scorePercentage = results.percentage;
  const scoreData = getScoreData(scorePercentage);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>{scoreData.icon}</div>
          <h1 className={styles.title}>Quiz Results</h1>
          <p className={styles.subtitle}>{results.topic}</p>
        </div>

        {/* Score Card */}
        <div className={styles.scoreCard}>
          <div className={styles.scoreTop}>
            <p className={styles.scoreLabel}>Your Score</p>
            {results.attempt_id && (
              <div className={styles.attemptBadge}>
                Attempt #{results.attempt_id}
              </div>
            )}
          </div>
          <div className={`${styles.scoreValue} ${scoreData.class}`}>
            {scorePercentage.toFixed(1)}%
          </div>
          <p className={`${styles.scoreFeedback} ${scoreData.feedbackClass}`}>
            {scoreData.feedback}
          </p>
          <div className={styles.scoreBreakdown}>
            {results.total_auto_score} / {results.max_auto_score} points
          </div>
        </div>

        {/* Metadata */}
        <div className={styles.metadata}>
          {results.time_taken_seconds && (
            <div className={styles.metadataCard}>
              <div className={styles.metadataIcon}>
                <Clock size={20} />
              </div>
              <div className={styles.metadataContent}>
                <p className={styles.metadataLabel}>Time Taken</p>
                <p className={styles.metadataValue}>
                  {formatTime(results.time_taken_seconds)}
                </p>
              </div>
            </div>
          )}

          {results.submitted_at && (
            <div className={styles.metadataCard}>
              <div className={styles.metadataIcon}>
                <Calendar size={20} />
              </div>
              <div className={styles.metadataContent}>
                <p className={styles.metadataLabel}>Submitted</p>
                <p className={styles.metadataValue}>
                  {formatDate(results.submitted_at)}
                </p>
              </div>
            </div>
          )}

          <div className={styles.metadataCard}>
            <div className={styles.metadataIcon}>
              <Hash size={20} />
            </div>
            <div className={styles.metadataContent}>
              <p className={styles.metadataLabel}>Questions</p>
              <p className={styles.metadataValue}>{results.total_questions}</p>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className={styles.breakdownGrid}>
          <div className={styles.breakdownCard}>
            <p className={styles.breakdownLabel}>Multiple Choice</p>
            <p className={`${styles.breakdownValue} ${styles.breakdownMCQ}`}>
              {results.mcq_score} / {results.mcq_results.length}
            </p>
          </div>
          <div className={styles.breakdownCard}>
            <p className={styles.breakdownLabel}>Fill in Blanks</p>
            <p className={`${styles.breakdownValue} ${styles.breakdownBlanks}`}>
              {results.blank_score} / {results.blank_results.length}
            </p>
          </div>
          <div className={styles.breakdownCard}>
            <p className={styles.breakdownLabel}>Descriptive (AI Graded)</p>
            <p className={`${styles.breakdownValue} ${styles.breakdownDescriptive}`}>
              {results.descriptive_score || 0} / {results.max_descriptive_score || 0}
            </p>
          </div>
        </div>

        {/* MCQ Results */}
        {results.mcq_results.length > 0 && (
          <div className={styles.questionsSection}>
            <h2 className={styles.sectionTitle}>
              <CheckCircle size={24} />
              Multiple Choice Results
            </h2>
            {results.mcq_results.map((result, idx) => (
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

                  <div className={styles.explanation}>
                    <p className={styles.explanationLabel}>
                      <Lightbulb size={16} />
                      Explanation
                    </p>
                    <p className={styles.explanationText}>{result.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blank Results */}
        {results.blank_results.length > 0 && (
          <div className={styles.questionsSection}>
            <h2 className={styles.sectionTitle}>
              <AlertCircle size={24} />
              Fill in the Blanks Results
            </h2>
            {results.blank_results.map((result, idx) => (
              <div
                key={result.question_id}
                className={`${styles.questionCard} ${
                  result.is_correct ? styles.questionCardCorrect : styles.questionCardIncorrect
                }`}
              >
                <div className={styles.questionHeader}>
                  <p className={styles.questionNumber}>
                    <span className={styles.questionNumberSpan}>
                      {results.mcq_results.length + idx + 1}.
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
                    &quot;{result.your_answer}&quot;
                  </div>

                  {!result.is_correct && (
                    <>
                      <p className={styles.answerLabel}>Correct Answer:</p>
                      <div className={`${styles.answerText} ${styles.answerCorrect}`}>
                        &quot;{result.correct_answer}&quot;
                      </div>
                    </>
                  )}

                  <div className={styles.explanation}>
                    <p className={styles.explanationLabel}>
                      <Lightbulb size={16} />
                      Explanation
                    </p>
                    <p className={styles.explanationText}>{result.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Descriptive Results - AI Graded */}
        {results.descriptive_results && results.descriptive_results.length > 0 && (
          <div className={styles.questionsSection}>
            <h2 className={styles.sectionTitle}>
              <Award size={24} />
              Descriptive Questions (AI Graded)
            </h2>

            {results.descriptive_results.map((result, idx) => {
              const scoreStatus = getDescriptiveScoreStatus(result.score, result.max_score);
              const scorePercentage = ((result.score / result.max_score) * 100).toFixed(1);

              return (
                <div
                  key={result.question_id}
                  className={`${styles.questionCard} ${
                    scorePercentage >= 80
                      ? styles.questionCardCorrect
                      : scorePercentage >= 60
                      ? styles.questionCardPartial
                      : styles.questionCardIncorrect
                  }`}
                >
                  <div className={styles.questionHeader}>
                    <p className={styles.questionNumber}>
                      <span className={styles.questionNumberSpan}>
                        {results.mcq_results.length + results.blank_results.length + idx + 1}.
                      </span>
                      {result.question}
                    </p>
                    <div className={`${styles.questionStatus} ${scoreStatus.class}`}>
                      <Award size={16} />
                      {result.score}/{result.max_score} ({scorePercentage}%)
                    </div>
                  </div>

                  <div className={styles.answerSection}>
                    {/* Your Answer */}
                    <p className={styles.answerLabel}>Your Answer:</p>
                    <div className={styles.answerTextArea}>{result.your_answer || result.answer}</div>

                    {/* Expected Answer */}
                    <p className={styles.answerLabel}>Expected Answer:</p>
                    <div className={`${styles.answerTextArea} ${styles.answerExpected}`}>
                      {result.expected_answer}
                    </div>

                    {/* Score Breakdown */}
                    {result.breakdown && (
                      <div className={styles.scoreBreakdownSection}>
                        <p className={styles.answerLabel}>
                          <Target size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                          Score Breakdown:
                        </p>
                        <div className={styles.breakdownDetails}>
                          <div className={styles.breakdownItem}>
                            <span className={styles.breakdownItemLabel}>Content Coverage:</span>
                            <span className={styles.breakdownItemValue}>
                              {result.breakdown.content_coverage_score}/70
                            </span>
                          </div>
                          <div className={styles.breakdownItem}>
                            <span className={styles.breakdownItemLabel}>Accuracy:</span>
                            <span className={styles.breakdownItemValue}>
                              {result.breakdown.accuracy_score}/20
                            </span>
                          </div>
                          <div className={styles.breakdownItem}>
                            <span className={styles.breakdownItemLabel}>Clarity:</span>
                            <span className={styles.breakdownItemValue}>
                              {result.breakdown.clarity_score}/10
                            </span>
                          </div>
                          {result.breakdown.extra_content_penalty !== 0 && (
                            <div className={styles.breakdownItem}>
                              <span className={styles.breakdownItemLabel}>Extra Content Penalty:</span>
                              <span className={`${styles.breakdownItemValue} ${styles.penalty}`}>
                                {result.breakdown.extra_content_penalty}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Points Covered & Missed */}
                    {(result.points_covered?.length > 0 || result.points_missed?.length > 0) && (
                      <div className={styles.pointsSection}>
                        {result.points_covered?.length > 0 && (
                          <div className={styles.pointsCovered}>
                            <p className={styles.pointsLabel}>
                              <ThumbsUp size={16} />
                              Points Covered:
                            </p>
                            <ul className={styles.pointsList}>
                              {result.points_covered.map((point, i) => (
                                <li key={i} className={styles.pointItemCovered}>
                                  ✓ {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.points_missed?.length > 0 && (
                          <div className={styles.pointsMissed}>
                            <p className={styles.pointsLabel}>
                              <ThumbsDown size={16} />
                              Points Missed:
                            </p>
                            <ul className={styles.pointsList}>
                              {result.points_missed.map((point, i) => (
                                <li key={i} className={styles.pointItemMissed}>
                                  ✗ {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Extra Content */}
                    {result.extra_content?.length > 0 && (
                      <div className={styles.extraContent}>
                        <p className={styles.pointsLabel}>
                          <AlertCircle size={16} />
                          Extra/Irrelevant Content:
                        </p>
                        <ul className={styles.pointsList}>
                          {result.extra_content.map((content, i) => (
                            <li key={i} className={styles.extraContentItem}>
                              {content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Feedback */}
                    {result.feedback && (
                      <div className={styles.explanation}>
                        <p className={styles.explanationLabel}>
                          <Lightbulb size={16} />
                          AI Feedback
                        </p>
                        <p className={styles.explanationText}>{result.feedback}</p>
                      </div>
                    )}

                    {/* Suggestions */}
                    {result.suggestions?.length > 0 && (
                      <div className={styles.suggestions}>
                        <p className={styles.suggestionsLabel}>
                          <Lightbulb size={16} />
                          Suggestions for Improvement:
                        </p>
                        <ul className={styles.suggestionsList}>
                          {result.suggestions.map((suggestion, i) => (
                            <li key={i} className={styles.suggestionItem}>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Points Reference */}
                    {result.key_points?.length > 0 && (
                      <div className={styles.keyPoints}>
                        <p className={styles.answerLabel}>Key Points to Cover:</p>
                        <ul className={styles.keyPointsList}>
                          {result.key_points.map((point, i) => (
                            <li key={i} className={styles.keyPointItem}>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            onClick={() => router.push("/quiz/generate")}
            className={`${styles.actionButton} ${styles.secondaryButton}`}
          >
            <Plus size={20} />
            Generate New Quiz
          </button>
          <button
            onClick={() => router.push(`/quiz/${quizId}`)}
            className={`${styles.actionButton} ${styles.primaryButton}`}
          >
            <RotateCcw size={20} />
            Retake Quiz
          </button>
          <button
            onClick={() => router.push(`/quiz/${quizId}/history`)}
            className={`${styles.actionButton} ${styles.secondaryButton}`}
          >
            <History size={20} />
            View History
          </button>
        </div>
      </div>
    </div>
  );
}
