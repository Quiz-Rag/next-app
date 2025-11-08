'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, CheckCircle } from 'lucide-react';
import styles from './QuizGrading.module.css';

export default function QuizGrading({ questions }) {
  // Optional enhancement: show dynamic messages based on question types
  const hasTrueFalse = questions?.some(q => q.type === 'true_false');
  const hasOpen = questions?.some(q => q.type === 'open');

  const dynamicMessages = [
    "Checking responses",
    "Calculating score",
    hasTrueFalse && "Evaluating True/False answers",
    hasOpen && "Assessing open-ended questions",
    "Preparing feedback"
  ].filter(Boolean); // remove null entries

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Animated Brain Icon */}
        <motion.div
          className={styles.iconWrapper}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Brain size={64} className={styles.icon} />
        </motion.div>

        <h2 className={styles.title}>Analyzing Your Answers...</h2>

        {/* Animated Steps */}
        <div className={styles.steps}>
          {dynamicMessages.map((msg, i) => (
            <motion.div
              key={i}
              className={styles.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.3 }}
            >
              <Zap size={20} className={styles.stepIcon} />
              <span>{msg}</span>
            </motion.div>
          ))}

          <motion.div
            className={styles.step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            <CheckCircle size={20} className={styles.stepIcon} />
            <span>Finalizing results...</span>
          </motion.div>
        </div>

        {/* Loader animation */}
        <motion.div
          className={styles.loader}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2.3, ease: 'easeInOut' }}
        >
          <motion.div
            className={styles.loaderFill}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
