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

/**
 * Generates quiz questions based on topic, difficulty, and mode
 */
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

/**
 * Grades quiz responses for all question types:
 * - MCQ: compares index to correct
 * - True/False: compares boolean values
 * - Open: checks if answer contains keywords
 */
export function gradeQuiz(questions, answers) {
  let correct = 0;

  const results = questions.map((question, index) => {
    const userAnswer = answers[index];
    let isCorrect = false;
    let correctAnswer = null;

    switch (question.type) {
      case "mcq":
        correctAnswer = question.correct;
        isCorrect = userAnswer === question.correct;
        break;

      case "true_false":
        correctAnswer = question.answer;
        // Convert possible string "true"/"false" to boolean
        const normalizedUserAnswer =
          typeof userAnswer === "string"
            ? userAnswer.toLowerCase() === "true"
            : !!userAnswer;
        isCorrect = normalizedUserAnswer === question.answer;
        break;

      case "open":
        correctAnswer = question.expected_keywords;
        if (typeof userAnswer === "string" && Array.isArray(question.expected_keywords)) {
          const userResponse = userAnswer.toLowerCase();
          // Count how many keywords appear in the response
          const matched = question.expected_keywords.filter((kw) =>
            userResponse.includes(kw.toLowerCase())
          ).length;
          // Mark correct if at least half the keywords appear
          isCorrect = matched >= Math.ceil(question.expected_keywords.length / 2);
        }
        break;

      default:
        console.warn("Unknown question type:", question.type);
        break;
    }

    if (isCorrect) correct++;

    return {
      id: question.id,
      type: question.type,
      question: question.question,
      userAnswer,
      correctAnswer,
      isCorrect,
      explanation: question.explanation,
      options: question.options || null,
    };
  });

  return {
    score: correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100),
    results,
  };
}

/**
 * Saves quiz result in localStorage (for leaderboard/history)
 */
export function saveQuizResult(result) {
  try {
    const history = getQuizHistory();
    const newResult = {
      ...result,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };

    history.unshift(newResult);
    const trimmedHistory = history.slice(0, 10);
    localStorage.setItem("quiz-history", JSON.stringify(trimmedHistory));
    return newResult;
  } catch (error) {
    console.error("Failed to save quiz result:", error);
    return result;
  }
}

/**
 * Retrieves past quiz results
 */
export function getQuizHistory() {
  try {
    const history = localStorage.getItem("quiz-history");
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Failed to load quiz history:", error);
    return [];
  }
}

/**
 * Generates leaderboard from past scores
 */
export function getLeaderboard() {
  try {
    const history = getQuizHistory();
    return history.sort((a, b) => b.percentage - a.percentage).slice(0, 5);
  } catch (error) {
    console.error("Failed to load leaderboard:", error);
    return [];
  }
}
