'use client';
import questionBank from '@/data/quiz-questions.json';
import { useState, useEffect } from 'react';
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

async function startTrace(seconds = 10, filter = 'tcp port 3000') {
  const r = await fetch('/api/trace/start', {
    method: "POST",
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({seconds, filter})
  });
  const j = await r.json();
  return j?.capture?.pcap || null;
}

async function telemetry(tag, payload = {}) {
  try {
    await fetch('/api/telemetry/quiz', {
      method: "POST",
      headers: {'content-type':'application/json'},
      body: JSON.stringify({tag, at: Date.now(), ...payload })
    });
  } catch{}
}

export default function QuizPage() {
  const [stage, setStage] = useState(STAGES.SETUP);
  const [config, setConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [tracePcap, setTracePcap] = useState(null);
  const [traceReport, setTracereport] = useState(null);
  useEffect(() => {
    if(!tracePcap) return;
    const t = setTimeout(async () => {
      try {
        const r = await fetch('/api/trace/report?pcap=' + encodeURIComponent(tracePcap));
        const j = await r.json();
        if (j.ok) setTracereport(j.report);
      }catch {}
    }, 9000);
    return () => clearTimeout(t);
  }, [tracePcap]);

  function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

  const handleStartQuiz = (quizConfig) => {
    const pcapPath = startTrace(10);
    setTracePcap(pcapPath);
    try { localStorage.setItem('lastPcap', pcapPath); } catch {}
    telemetry('quiz_start', {topic: quizConfig.topic, difficulty: quizConfig.difficulty});
    setConfig(quizConfig);
    setStage(STAGES.LOADING);

    setTimeout(() => {
      let generatedQuestions = [];

      if (quizConfig.mode === 'random') {
        // Build a flat pool of all questions from all topics/difficulties
        // questionBank structure: { "topic": { "easy":[...], "medium":[...], ... }, ... }
        const flatPool = Object.values(questionBank)
          .map(topicObj => Object.values(topicObj).flat())
          .flat();

        // shuffle and take requested number
        generatedQuestions = shuffle(flatPool).slice(0, quizConfig.questionCount);
      } else {
        // topic mode: use existing helper to filter by topic/difficulty
        generatedQuestions = generateQuiz(
          quizConfig.topic,
          quizConfig.difficulty,
          quizConfig.questionCount
        );
      }

      // if nothing found, return user to setup (or handle as you prefer)
      if (!generatedQuestions || generatedQuestions.length === 0) {
        console.warn('No questions available for selection:', quizConfig);
        // go back to setup so user can pick different options
        setStage(STAGES.SETUP);
        return;
      }

      setQuestions(generatedQuestions);
      setAnswers(new Array(generatedQuestions.length).fill(null));
      setStage(STAGES.PLAYING);
    }, 2000); // shorten/lengthen delay as desired
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
      telemetry('quiz_submit', {answered: answers.filter(Boolean).length});
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
