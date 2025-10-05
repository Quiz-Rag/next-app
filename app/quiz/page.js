'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizSetup from '@/components/quiz/QuizSetup';
import QuizLoading from '@/components/quiz/QuizLoading';
import QuizPlay from '@/components/quiz/QuizPlay';
import QuizGrading from '@/components/quiz/QuizGrading';
import QuizResults from '@/components/quiz/QuizResults';
import { generateQuiz, gradeQuiz, saveQuizResult } from '@/lib/quizData';
import styles from './page.module.css';

const STAGES = {
  SETUP: 'setup',
  LOADING: 'loading',
  PLAYING: 'playing',
  GRADING: 'grading',
  RESULTS: 'results',
};

export default function QuizPage() {
  const [stage, setStage] = useState(STAGES.SETUP);
  const [config, setConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);

  const handleStartQuiz = (quizConfig) => {
    setConfig(quizConfig);
    setStage(STAGES.LOADING);

    // Simulate quiz generation
    setTimeout(() => {
      const generatedQuestions = generateQuiz(
        quizConfig.topic,
        quizConfig.difficulty,
        quizConfig.questionCount
      );
      setQuestions(generatedQuestions);
      setAnswers(new Array(generatedQuestions.length).fill(null));
      setStage(STAGES.PLAYING);
    }, 2000);
  };

  const handleSubmitQuiz = (userAnswers) => {
    setAnswers(userAnswers);
    setStage(STAGES.GRADING);

    // Simulate grading
    setTimeout(() => {
      const gradedResults = gradeQuiz(questions, userAnswers);
      const savedResults = saveQuizResult({
        ...gradedResults,
        config,
      });
      setResults(savedResults);
      setStage(STAGES.RESULTS);
    }, 2500);
  };

  const handleRestart = () => {
    setStage(STAGES.SETUP);
    setConfig(null);
    setQuestions([]);
    setAnswers([]);
    setResults(null);
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {stage === STAGES.SETUP && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <QuizSetup onStart={handleStartQuiz} />
          </motion.div>
        )}

        {stage === STAGES.LOADING && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <QuizLoading config={config} />
          </motion.div>
        )}

        {stage === STAGES.PLAYING && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuizPlay
              questions={questions}
              onSubmit={handleSubmitQuiz}
              config={config}
            />
          </motion.div>
        )}

        {stage === STAGES.GRADING && (
          <motion.div
            key="grading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <QuizGrading />
          </motion.div>
        )}

        {stage === STAGES.RESULTS && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <QuizResults results={results} onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
