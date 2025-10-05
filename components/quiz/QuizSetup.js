'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { getTopics, getDifficulties } from '@/lib/quizData';
import styles from './QuizSetup.module.css';

const STEPS = {
  TOPIC: 'topic',
  DIFFICULTY: 'difficulty',
  COUNT: 'count',
  CONFIRM: 'confirm',
};

export default function QuizSetup({ onStart }) {
  const [step, setStep] = useState(STEPS.TOPIC);
  const [config, setConfig] = useState({
    topic: null,
    difficulty: null,
    questionCount: 5,
  });

  const topics = getTopics();
  const difficulties = getDifficulties();

  const handleTopicSelect = (topicId) => {
    setConfig({ ...config, topic: topicId });
    setTimeout(() => setStep(STEPS.DIFFICULTY), 300);
  };

  const handleDifficultySelect = (difficulty) => {
    setConfig({ ...config, difficulty });
    setTimeout(() => setStep(STEPS.COUNT), 300);
  };

  const handleCountSelect = (count) => {
    setConfig({ ...config, questionCount: count });
    setTimeout(() => setStep(STEPS.CONFIRM), 300);
  };

  const handleStart = () => {
    onStart(config);
  };

  const selectedTopic = topics.find((t) => t.id === config.topic);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Sparkles className={styles.titleIcon} />
          Quiz Setup
        </h1>
        <p className={styles.subtitle}>Let's configure your quiz experience</p>
      </div>

      <div className={styles.chatContainer}>
        {/* Topic Selection */}
        <div className={styles.messageGroup}>
          <div className={styles.botMessage}>
            <span className={styles.botAvatar}>🤖</span>
            <div className={styles.bubble}>
              What topic would you like to be quizzed on?
            </div>
          </div>

          {step !== STEPS.TOPIC && config.topic && (
            <motion.div
              className={styles.userMessage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className={styles.bubble}>
                {selectedTopic?.name || config.topic}
              </div>
              <span className={styles.userAvatar}>👤</span>
            </motion.div>
          )}

          {step === STEPS.TOPIC && (
            <motion.div
              className={styles.optionsGrid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  className={styles.optionCard}
                  onClick={() => handleTopicSelect(topic.id)}
                >
                  <div className={styles.optionTitle}>{topic.name}</div>
                  <div className={styles.optionDesc}>{topic.description}</div>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Difficulty Selection */}
        {step !== STEPS.TOPIC && (
          <div className={styles.messageGroup}>
            <div className={styles.botMessage}>
              <span className={styles.botAvatar}>🤖</span>
              <div className={styles.bubble}>
                Great choice! What difficulty level?
              </div>
            </div>

            {step !== STEPS.DIFFICULTY && config.difficulty && (
              <motion.div
                className={styles.userMessage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className={styles.bubble}>
                  {config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1)}
                </div>
                <span className={styles.userAvatar}>👤</span>
              </motion.div>
            )}

            {step === STEPS.DIFFICULTY && (
              <motion.div
                className={styles.optionsRow}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    className={`${styles.optionPill} ${styles[diff]}`}
                    onClick={() => handleDifficultySelect(diff)}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Question Count */}
        {step !== STEPS.TOPIC && step !== STEPS.DIFFICULTY && (
          <div className={styles.messageGroup}>
            <div className={styles.botMessage}>
              <span className={styles.botAvatar}>🤖</span>
              <div className={styles.bubble}>
                How many questions would you like?
              </div>
            </div>

            {step !== STEPS.COUNT && (
              <motion.div
                className={styles.userMessage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className={styles.bubble}>
                  {config.questionCount} questions
                </div>
                <span className={styles.userAvatar}>👤</span>
              </motion.div>
            )}

            {step === STEPS.COUNT && (
              <motion.div
                className={styles.optionsRow}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {[3, 5, 10].map((count) => (
                  <button
                    key={count}
                    className={styles.optionPill}
                    onClick={() => handleCountSelect(count)}
                  >
                    {count} Questions
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Confirmation */}
        {step === STEPS.CONFIRM && (
          <motion.div
            className={styles.messageGroup}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.botMessage}>
              <span className={styles.botAvatar}>🤖</span>
              <div className={styles.bubble}>
                Perfect! Ready to start your quiz?
              </div>
            </div>

            <motion.button
              className={styles.startButton}
              onClick={handleStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={20} />
              Start Quiz
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
