'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import styles from './QuizPlay.module.css';

export default function QuizPlay({ questions, onSubmit, config }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(questions.length).fill(null));

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const allAnswered = answers.every((answer) => answer !== null && answer !== '');
  const isLastQuestion = currentQuestion === questions.length - 1;

  // --- Conditional render function for question types ---
  const renderQuestionType = (q) => {
    switch (q.type) {
      case 'mcq':
        return (
          <div className={styles.optionsContainer}>
            {q.options.map((option, index) => {
              const isSelected = answers[currentQuestion] === index;
              return (
                <motion.button
                  key={index}
                  className={`${styles.optionButton} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleAnswer(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={styles.optionLabel}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className={styles.optionText}>{option}</span>
                  {isSelected && (
                    <CheckCircle className={styles.checkIcon} size={20} />
                  )}
                </motion.button>
              );
            })}
          </div>
        );

      case 'true_false':
        return (
          <div className={styles.optionsContainer}>
            {['True', 'False'].map((option, index) => {
              const value = option.toLowerCase() === 'true';
              const isSelected = answers[currentQuestion] === value;
              return (
                <motion.button
                  key={option}
                  className={`${styles.optionButton} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleAnswer(value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={styles.optionText}>{option}</span>
                  {isSelected && <CheckCircle className={styles.checkIcon} size={20} />}
                </motion.button>
              );
            })}
          </div>
        );

      case 'open':
        return (
          <div className={styles.openContainer}>
            <textarea
              className={styles.openTextarea}
              placeholder="Type your answer here..."
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
            />
          </div>
        );

      default:
        return <p>Unsupported question type.</p>;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header and progress */}
      <div className={styles.header}>
        <div className={styles.progressWrapper}>
          <div className={styles.progressInfo}>
            <span className={styles.questionCounter}>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className={styles.percentage}>{Math.round(progress)}%</span>
          </div>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion}
        className={styles.questionCard}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className={styles.questionText}>{question.question}</h2>
        {renderQuestionType(question)}
      </motion.div>

      {/* Navigation Buttons */}
      <div className={styles.navigation}>
        <button
          className={styles.navButton}
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <div className={styles.dots}>
          {questions.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentQuestion ? styles.activeDot : ''} ${answers[index] !== null && answers[index] !== '' ? styles.answeredDot : ''}`}
              onClick={() => setCurrentQuestion(index)}
              aria-label={`Go to question ${index + 1}`}
            />
          ))}
        </div>

        {!isLastQuestion ? (
          <button
            className={styles.navButton}
            onClick={handleNext}
            disabled={answers[currentQuestion] === null || answers[currentQuestion] === ''}
          >
            Next
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            className={`${styles.submitButton} ${!allAnswered ? styles.disabled : ''}`}
            onClick={handleSubmit}
            disabled={!allAnswered}
          >
            <CheckCircle size={20} />
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
