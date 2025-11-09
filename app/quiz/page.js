'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { listQuizzes } from '@/lib/api';
import { Plus, Clock, BookOpen, TrendingUp } from 'lucide-react';

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
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const data = await listQuizzes(0, 50); // Get up to 50 quizzes
        setQuizzes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI-Generated Quizzes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all your attempted quizzes and track your progress
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
            <p className="text-red-800 dark:text-red-200 font-semibold mb-2">Error Loading Quizzes</p>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && quizzes.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Quizzes Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by generating your first AI-powered quiz
            </p>
            <button
              onClick={() => router.push('/quiz/generate')}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold transition-colors inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Generate Your First Quiz
            </button>
          </div>
        )}

        {/* Quiz Grid */}
        {quizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.quiz_id}
                onClick={() => router.push(`/quiz/${quiz.quiz_id}/history`)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500 p-6"
              >
                {/* Quiz Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{quiz.topic}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                </div>

                {/* Quiz Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>{quiz.total_questions} Questions</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{formatDate(quiz.created_at)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/quiz/${quiz.quiz_id}/history`);
                    }}
                    className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 px-4 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 font-medium transition-colors flex items-center justify-center"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View History & Attempts
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => router.push('/quiz/generate')}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center justify-center group"
          aria-label="Generate New Quiz"
        >
          <Plus className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap ml-0 group-hover:ml-2">
            Generate Quiz
          </span>
        </button>
      </div>
    </div>
  );
}
