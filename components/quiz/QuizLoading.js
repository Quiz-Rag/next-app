'use client';

import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import styles from './QuizLoading.module.css';

export default function QuizLoading({ config }) {
  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className={styles.iconWrapper}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={64} className={styles.spinner} />
        </motion.div>

        <h2 className={styles.title}>Generating Your Quiz...</h2>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <Sparkles size={16} />
            <span>Crafting questions on your topic</span>
          </div>
          <div className={styles.detailItem}>
            <Sparkles size={16} />
            <span>Adjusting difficulty level</span>
          </div>
          <div className={styles.detailItem}>
            <Sparkles size={16} />
            <span>Preparing your challenge</span>
          </div>
        </div>

        <motion.div
          className={styles.progressBar}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        >
          <motion.div
            className={styles.progressFill}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
