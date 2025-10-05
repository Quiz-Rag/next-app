'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, CheckCircle } from 'lucide-react';
import styles from './QuizGrading.module.css';

export default function QuizGrading() {
  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
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

        <div className={styles.steps}>
          <motion.div
            className={styles.step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Zap size={20} className={styles.stepIcon} />
            <span>Checking responses</span>
          </motion.div>

          <motion.div
            className={styles.step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Zap size={20} className={styles.stepIcon} />
            <span>Calculating score</span>
          </motion.div>

          <motion.div
            className={styles.step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <CheckCircle size={20} className={styles.stepIcon} />
            <span>Preparing feedback</span>
          </motion.div>
        </div>

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
