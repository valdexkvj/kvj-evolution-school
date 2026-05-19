import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

interface QuizComponentProps {
  quiz: any;
  courseId: string;
  moduleId?: string;
  onComplete?: (attempt: any) => void;
}

export default function QuizComponent({ quiz, courseId, onComplete }: QuizComponentProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(quiz.questions?.length || 0).fill(-1));
  const [attempt, setAttempt] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  const correctCount = answers.filter((a, i) => quiz.questions?.[i]?.correctAnswer === a).length;
  const progress = ((answers.filter((a) => a !== -1).length) / (quiz.questions?.length || 1)) * 100;

  const handleSubmit = async () => {
    if (answers.some((a) => a === -1)) { setError('Repondez a toutes les questions'); return; }
    if (!isAuthenticated || !user) { setError('Connectez-vous pour soumettre'); return; }
    setSubmitting(true);
    setError('');
    try {
      const result = await api.saveResult({
        studentId: user._id, courseId, quizId: quiz._id,
        quizTitle: quiz.title, score: correctCount,
        totalQuestions: quiz.questions.length,
        percentage: Math.round((correctCount / quiz.questions.length) * 100),
        passed: Math.round((correctCount / quiz.questions.length) * 100) >= quiz.passingScore,
      });
      setAttempt(result);
      setShowResults(true);
      if (onComplete) onComplete(result);
    } catch (err: any) { setError(err.message || 'Erreur'); }
    finally { setSubmitting(false); }
  };

  const handleRetry = () => {
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setAttempt(null); setShowResults(false); setCurrentQuestion(0); setError('');
  };

  if (!quiz.questions?.length) return <p className="text-center text-dark-muted py-8">Aucune question dans ce quiz.</p>;

  const q = quiz.questions[currentQuestion];

  if (showResults && attempt) {
    return (
      <div className="space-y-6">
        <div className={`rounded-2xl p-6 text-center ${attempt.passed ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'}`}>
          <div className={`text-4xl mb-3`}>{attempt.passed ? '🎉' : '😅'}</div>
          <h3 className={`text-2xl font-bold mb-1 ${attempt.passed ? 'text-green-400' : 'text-red-400'}`}>{attempt.passed ? 'Quiz reussi !' : 'Quiz non reussi'}</h3>
          <p className={`text-lg mb-2 ${attempt.passed ? 'text-green-500' : 'text-red-500'}`}>{attempt.score} / {attempt.totalQuestions}</p>
          <p className="text-sm text-dark-muted">Score minimum : {quiz.passingScore}%</p>
          {!attempt.passed && <button onClick={handleRetry} className="mt-4 px-6 py-2 bg-accent-orange text-white font-medium rounded-lg hover:bg-accent-orange-dark transition-all">Reessayer</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h3 className="text-lg font-bold text-white">{quiz.title}</h3><p className="text-sm text-dark-muted">Question {currentQuestion + 1} sur {quiz.questions.length}</p></div>
        <span className="text-sm text-dark-muted">{answers.filter((a) => a !== -1).length}/{quiz.questions.length}</span>
      </div>
      <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-accent-orange to-accent-blue rounded-full transition-all duration-300" style={{ width: `${progress}%` }} /></div>
      {error && <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400">{error}</div>}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-8 h-8 bg-accent-orange/20 rounded-lg flex items-center justify-center"><span className="text-sm font-bold text-accent-orange">{currentQuestion + 1}</span></div>
          <p className="text-lg font-medium text-white">{q.question}</p>
        </div>
        <div className="space-y-3">
          {q.options.map((option: string, idx: number) => (
            <button key={idx} onClick={() => { const n = [...answers]; n[currentQuestion] = idx; setAnswers(n); }}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQuestion] === idx ? 'border-accent-orange bg-accent-orange/10 ring-2 ring-accent-orange/30' : 'border-dark-border bg-dark-bg hover:border-dark-border'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${answers[currentQuestion] === idx ? 'bg-accent-orange text-white' : 'bg-dark-border text-dark-muted'}`}>{String.fromCharCode(65 + idx)}</div>
                <span className={`text-sm ${answers[currentQuestion] === idx ? 'text-white font-medium' : 'text-dark-muted'}`}>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentQuestion(currentQuestion - 1)} disabled={currentQuestion === 0} className="px-4 py-2 text-sm font-medium text-dark-muted hover:text-white disabled:opacity-30">← Precedente</button>
        <div className="flex gap-1.5">{quiz.questions.map((_: any, idx: number) => (
          <button key={idx} onClick={() => setCurrentQuestion(idx)} className={`w-7 h-7 rounded text-xs font-medium transition-all ${currentQuestion === idx ? 'bg-accent-orange text-white' : answers[idx] !== -1 ? 'bg-accent-orange/20 text-accent-orange' : 'bg-dark-border text-dark-muted'}`}>{idx + 1}</button>
        ))}</div>
        {currentQuestion < quiz.questions.length - 1 ? (
          <button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="px-4 py-2 text-sm text-accent-orange">Suivante →</button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 bg-accent-orange text-white font-medium rounded-lg hover:bg-accent-orange-dark disabled:opacity-50">{submitting ? '...' : 'Soumettre'}</button>
        )}
      </div>
    </div>
  );
}
