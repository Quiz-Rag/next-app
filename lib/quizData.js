import quizQuestions from '@/data/quiz-questions.json';
import quizTopics from '@/data/quiz-topics.json';

export function getTopics() {
  return quizTopics.topics;
}

export function getDifficulties() {
  return quizTopics.difficulties;
}

export function getQuestionTypes() {
  return quizTopics.questionTypes;
}

export function generateQuiz(topic, difficulty, count = 5, mode = "topic") {
   let questions = [];

  if (mode === "random") {
    // Collect all questions from all topics/difficulties
    for (const t in quizQuestions) {
      for (const d in quizQuestions[t]) {
        questions = questions.concat(quizQuestions[t][d]);
      }
    }
  } else {
    // Specific topic & difficulty
    questions = quizQuestions[topic]?.[difficulty] || [];
  }
  // Shuffle and take the requested number of questions
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function gradeQuiz(questions, answers) {
  let correct = 0;
  const results = questions.map((question, index) => {
    const userAnswer = answers[index];
    const isCorrect = userAnswer === question.correct;
    if (isCorrect) correct++;

    return {
      question: question.question,
      userAnswer,
      correctAnswer: question.correct,
      isCorrect,
      explanation: question.explanation,
      options: question.options,
    };
  });

  return {
    score: correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100),
    results,
  };
}

export function saveQuizResult(result) {
  try {
    const history = getQuizHistory();
    const newResult = {
      ...result,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };

    history.unshift(newResult);

    // Keep only last 10 results
    const trimmedHistory = history.slice(0, 10);

    localStorage.setItem('quiz-history', JSON.stringify(trimmedHistory));
    return newResult;
  } catch (error) {
    console.error('Failed to save quiz result:', error);
    return result;
  }
}

export function getQuizHistory() {
  try {
    const history = localStorage.getItem('quiz-history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to load quiz history:', error);
    return [];
  }
}

export function getLeaderboard() {
  try {
    const history = getQuizHistory();
    return history
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    return [];
  }
}
