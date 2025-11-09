'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { listQuizzes } from '@/lib/api';
import { Plus, Clock, BookOpen, TrendingUp } from 'lucide-react';

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

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return { background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #4ade80' };
      case 'medium':
        return { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #fbbf24' };
      case 'hard':
        return { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #f87171' };
      default:
        return { background: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', border: '1px solid #94a3b8' };
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid var(--border-color)',
            borderTop: '3px solid var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading quizzes...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      padding: '3rem 1.5rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            AI-Generated Quizzes
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            View all your quizzes and track your progress
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--accent-danger)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{
              color: 'var(--accent-danger)',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Error Loading Quizzes
            </p>
            <p style={{ color: 'var(--accent-danger)', fontSize: '0.875rem' }}>
              {error}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!error && quizzes.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '5rem',
              height: '5rem',
              background: 'var(--bg-card)',
              borderRadius: '50%',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <BookOpen style={{ width: '2.5rem', height: '2.5rem', color: 'var(--text-secondary)' }} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: 'var(--text-primary)'
            }}>
              No Quizzes Yet
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              Get started by generating your first AI-powered quiz
            </p>
            <button
              onClick={() => router.push('/quiz/generate')}
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
              Generate Your First Quiz
            </button>
          </div>
        )}

        {/* Quiz Grid */}
        {quizzes.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginBottom: '6rem'
          }}>
            {quizzes.map((quiz) => (
              <div
                key={quiz.quiz_id}
                onClick={() => router.push(`/quiz/${quiz.quiz_id}/history`)}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border-color)',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Quiz Header */}
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '0.75rem',
                    color: 'var(--text-primary)',
                    lineHeight: '1.4',
                    minHeight: '2.8rem'
                  }}>
                    {quiz.topic}
                  </h3>
                  <span style={{
                    ...getDifficultyStyle(quiz.difficulty),
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {quiz.difficulty}
                  </span>
                </div>

                {/* Quiz Stats */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <BookOpen style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    <span>{quiz.total_questions} Questions</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <Clock style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    <span>{formatDate(quiz.created_at)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/quiz/${quiz.quiz_id}/history`);
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 217, 255, 0.1)',
                      color: 'var(--accent-primary)',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: '500',
                      border: '1px solid var(--accent-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)';
                    }}
                  >
                    <TrendingUp style={{ width: '1rem', height: '1rem' }} />
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
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: 'white',
            padding: '1rem',
            borderRadius: '50%',
            boxShadow: '0 4px 20px rgba(0, 217, 255, 0.3)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(0, 217, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 217, 255, 0.3)';
          }}
          aria-label="Generate New Quiz"
          title="Generate New Quiz"
        >
          <Plus style={{ width: '1.5rem', height: '1.5rem' }} />
        </button>
      </div>
    </div>
  );
}
