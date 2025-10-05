'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, ChevronDown, ChevronUp, Award, Target, Zap } from 'lucide-react';
import { getLeaderboard } from '@/lib/quizData';
import styles from './QuizResults.module.css';

export default function QuizResults({ results, onRestart }) {
  const [showDetails, setShowDetails] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const leaderboard = getLeaderboard();

  const getScoreColor = () => {
    if (results.percentage >= 80) return styles.excellent;
    if (results.percentage >= 60) return styles.good;
    return styles.needsWork;
  };

  const getScoreMessage = () => {
    if (results.percentage >= 80) return 'Excellent Work!';
    if (results.percentage >= 60) return 'Good Job!';
    return 'Keep Learning!';
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.scoreCard}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={styles.trophyIcon}
          animate={{
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.6,
            delay: 0.3,
          }}
        >
          <Trophy size={64} />
        </motion.div>

        <h1 className={`${styles.message} ${getScoreColor()}`}>
          {getScoreMessage()}
        </h1>

        <div className={styles.scoreDisplay}>
          <motion.div
            className={`${styles.percentage} ${getScoreColor()}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 10,
              delay: 0.2,
            }}
          >
            {results.percentage}%
          </motion.div>
          <div className={styles.scoreText}>
            {results.score} out of {results.total} correct
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <Award className={styles.statIcon} />
            <div>
              <div className={styles.statValue}>{results.score}</div>
              <div className={styles.statLabel}>Correct</div>
            </div>
          </div>

          <div className={styles.stat}>
            <Target className={styles.statIcon} />
            <div>
              <div className={styles.statValue}>{results.total - results.score}</div>
              <div className={styles.statLabel}>Incorrect</div>
            </div>
          </div>

          <div className={styles.stat}>
            <Zap className={styles.statIcon} />
            <div>
              <div className={styles.statValue}>{results.percentage}%</div>
              <div className={styles.statLabel}>Score</div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <motion.button
            className={styles.detailsButton}
            onClick={() => setShowDetails(!showDetails)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            {showDetails ? 'Hide' : 'View'} Detailed Results
          </motion.button>

          <motion.button
            className={styles.restartButton}
            onClick={onRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={20} />
            Take Another Quiz
          </motion.button>
        </div>
      </motion.div>

      {showDetails && (
        <motion.div
          className={styles.detailsSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className={styles.detailsTitle}>Question Review</h2>

          <div className={styles.questionsList}>
            {results.results.map((result, index) => {
              const isExpanded = expandedQuestion === index;

              return (
                <motion.div
                  key={index}
                  className={`${styles.questionItem} ${result.isCorrect ? styles.correct : styles.incorrect}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    className={styles.questionHeader}
                    onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                  >
                    <span className={styles.questionNumber}>Q{index + 1}</span>
                    <span className={styles.questionText}>{result.question}</span>
                    <span className={styles.resultBadge}>
                      {result.isCorrect ? '✓' : '✗'}
                    </span>
                  </button>

                  {isExpanded && (
                    <motion.div
                      className={styles.questionDetails}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className={styles.answer}>
                        <strong>Your answer:</strong>{' '}
                        <span className={result.isCorrect ? styles.correctText : styles.incorrectText}>
                          {result.options[result.userAnswer]}
                        </span>
                      </div>

                      {!result.isCorrect && (
                        <div className={styles.answer}>
                          <strong>Correct answer:</strong>{' '}
                          <span className={styles.correctText}>
                            {result.options[result.correctAnswer]}
                          </span>
                        </div>
                      )}

                      <div className={styles.explanation}>
                        <strong>Explanation:</strong> {result.explanation}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {leaderboard.length > 0 && (
        <motion.div
          className={styles.leaderboard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className={styles.leaderboardTitle}>
            <Trophy size={24} />
            Recent Top Scores
          </h2>

          <div className={styles.leaderboardList}>
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`${styles.leaderboardItem} ${index === 0 ? styles.topScore : ''}`}
              >
                <span className={styles.rank}>#{index + 1}</span>
                <div className={styles.leaderboardInfo}>
                  <span className={styles.leaderboardTopic}>
                    {entry.config.topic.replace('-', ' ')}
                  </span>
                  <span className={styles.leaderboardDifficulty}>
                    {entry.config.difficulty}
                  </span>
                </div>
                <span className={styles.leaderboardScore}>{entry.percentage}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
