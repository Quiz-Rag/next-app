'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { getTopics, getDifficulties } from '@/lib/quizData';
import styles from './QuizSetup.module.css';

const STEPS = {
  MODE: 'mode',
  TOPIC: 'topic',
  DIFFICULTY: 'difficulty',
  COUNT: 'count',
  CONFIRM: 'confirm',
};

export default function QuizSetup({ onStart }) {
  const [step, setStep] = useState(STEPS.MODE);
  const [config, setConfig] = useState({
    mode: null,
    topic: null,
    difficulty: null,
    questionCount: 5,
  });

  const topics = getTopics();
  const difficulties = getDifficulties();

  // Mode selection
  const handleModeSelect = (mode) => {
    setConfig({ ...config, mode });
    if (mode === 'random') {
      // Jump directly to count step
      setTimeout(() => setStep(STEPS.COUNT), 300);
    } else {
      // Continue to topic selection
      setTimeout(() => setStep(STEPS.TOPIC), 300);
    }
  };

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
        {/* Step 1: Mode Selection */}
        {step === STEPS.MODE && (
          <div className={styles.messageGroup}>
            <div className={styles.botMessage}>
              <span className={styles.botAvatar}>🤖</span>
              <div className={styles.bubble}>
                Do you want a random quiz or a topic-based quiz?
              </div>
            </div>

            <motion.div
              className={styles.optionsRow}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                className={styles.optionPill}
                onClick={() => handleModeSelect('random')}
              >
                🎲 Random Quiz
              </button>
              <button
                className={styles.optionPill}
                onClick={() => handleModeSelect('topic')}
              >
                📚 Topic Quiz
              </button>
            </motion.div>
          </div>
        )}

        {/* Topic Selection (only for topic mode) */}
        {config.mode === 'topic' && step === STEPS.TOPIC && (
          <div className={styles.messageGroup}>
            <div className={styles.botMessage}>
              <span className={styles.botAvatar}>🤖</span>
              <div className={styles.bubble}>
                What topic would you like to be quizzed on?
              </div>
            </div>
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
          </div>
        )}

        {/* Difficulty Selection (only for topic mode) */}
        {config.mode === 'topic' && step === STEPS.DIFFICULTY && (
          <div className={styles.messageGroup}>
            <div className={styles.botMessage}>
              <span className={styles.botAvatar}>🤖</span>
              <div className={styles.bubble}>
                Great choice! What difficulty level?
              </div>
            </div>
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
          </div>
        )}

        {/* Question Count (both modes) */}
        {step === STEPS.COUNT && (
          <div className={styles.messageGroup}>
            <div className={styles.botMessage}>
              <span className={styles.botAvatar}>🤖</span>
              <div className={styles.bubble}>
                How many questions would you like?
              </div>
            </div>
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
