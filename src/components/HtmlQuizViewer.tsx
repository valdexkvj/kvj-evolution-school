import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

interface HtmlQuizViewerProps {
  htmlContent: string;
  courseId: string;
  quizTitle: string;
  onComplete?: (score: number, total: number, percentage: number) => void;
}

export default function HtmlQuizViewer({ htmlContent, courseId, quizTitle, onComplete }: HtmlQuizViewerProps) {
  const { user } = useAuth();
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 });

  const handleMessage = async (event: MessageEvent) => {
    if (event.data && event.data.type === 'quiz_completed') {
      const { correct, total } = event.data;
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      setScore({ correct, total, percentage });
      setQuizCompleted(true);
      if (user) {
        try {
          await api.saveResult({
            studentId: user._id, courseId, quizId: `html_${courseId}`,
            quizTitle, score: correct, totalQuestions: total, percentage, passed: percentage >= 60,
          });
        } catch (e) { console.error(e); }
      }
      if (onComplete) onComplete(correct, total, percentage);
    }
  };

  const blobUrl = (() => {
    try {
      let content = htmlContent;
      if (!content.startsWith('data:')) {
        const files = JSON.parse(localStorage.getItem('kvj_files') || '{}');
        content = files[content] || '';
      }
      if (!content) return '';
      const base64 = content.split(',')[1];
      const bytes = new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
      return URL.createObjectURL(new Blob([bytes], { type: 'text/html' }));
    } catch { return ''; }
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent-orange/20 rounded-xl flex items-center justify-center"><span className="text-lg">🧩</span></div>
        <div><h3 className="text-lg font-bold text-white">{quizTitle}</h3><p className="text-xs text-dark-muted">Quiz interactif importé</p></div>
      </div>
      <div className="bg-dark-card border-2 border-dark-border rounded-2xl overflow-hidden">
        <iframe src={blobUrl} title={quizTitle} className="w-full" style={{ height: '600px', border: 'none' }} onLoad={() => window.addEventListener('message', handleMessage)} sandbox="allow-scripts allow-same-origin allow-forms" />
      </div>
      {quizCompleted && (
        <div className={`rounded-2xl p-6 text-center ${score.percentage >= 60 ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'}`}>
          <div className="text-4xl mb-3">{score.percentage >= 60 ? '🎉' : '😅'}</div>
          <h3 className={`text-2xl font-bold ${score.percentage >= 60 ? 'text-green-400' : 'text-red-400'}`}>{score.percentage >= 60 ? 'Reussi' : 'Non reussi'}</h3>
          <p className={`text-lg ${score.percentage >= 60 ? 'text-green-500' : 'text-red-500'}`}>{score.correct}/{score.total} ({score.percentage}%)</p>
        </div>
      )}
    </div>
  );
}
