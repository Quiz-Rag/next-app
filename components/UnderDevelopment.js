'use client';

import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import styles from './UnderDevelopment.module.css';

export default function UnderDevelopment({ title }) {
  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={styles.iconWrapper}
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Construction size={64} className={styles.icon} />
        </motion.div>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>Coming Soon!</p>
        <p className={styles.description}>
          This module is currently under development. Stay tuned for exciting updates!
        </p>

        <motion.div
          className={styles.progressBar}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 0.6, 0.6] }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <motion.div
            className={styles.progressFill}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
