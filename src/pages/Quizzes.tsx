import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import QuizComponent from '@/components/QuizComponent';
import HtmlQuizViewer from '@/components/HtmlQuizViewer';

export default function Quizzes() {
  const { user } = useAuth();
  const [allQuizzes, setAllQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'qcm' | 'html'>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [mq, hq, courses] = await Promise.all([
          api.getQuizzes(),
          api.getHtmlQuizzes(),
          api.getCourses(),
        ]);

        // Combine all quizzes with course info
        const qcm = mq.map((q: any) => {
          const course = courses.find((c: any) => c._id === q.courseId);
          return { ...q, type: 'qcm', courseName: course?.title || 'Independant' };
        });
        const html = hq.map((q: any) => {
          const course = courses.find((c: any) => c._id === q.courseId);
          return { ...q, type: 'html', courseName: course?.title || 'Independant' };
        });

        setAllQuizzes([...qcm, ...html]);

        if (user) {
          const r = await api.getResults(user._id);
          setResults(r);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const filtered = filter === 'all' ? allQuizzes : allQuizzes.filter(q => q.type === filter);

  // Get best result for a quiz
  const getBestResult = (quizId: string) => {
    const quizResults = results.filter((r: any) => r.quizId === quizId);
    if (!quizResults.length) return null;
    return quizResults.sort((a: any, b: any) => b.percentage - a.percentage)[0];
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-dark-border border-t-accent-orange" /></div>;

  // Quiz view
  if (selectedQuiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => setSelectedQuiz(null)} className="text-sm text-accent-orange hover:text-accent-orange-dark mb-6 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Retour aux quiz
        </button>
        {selectedQuiz.type === 'html' ? (
          <HtmlQuizViewer htmlContent={selectedQuiz.htmlUrl} courseId={selectedQuiz.courseId || ''} quizTitle={selectedQuiz.title} />
        ) : (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <QuizComponent quiz={selectedQuiz} courseId={selectedQuiz.courseId || ''} onComplete={async () => {
              if (user) {
                const r = await api.getResults(user._id);
                setResults(r);
              }
            }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Quiz</h1>
        <p className="text-dark-muted">Testez vos connaissances et suivez votre progression</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all' as const, label: `Tous (${allQuizzes.length})` },
          { key: 'qcm' as const, label: `QCM (${allQuizzes.filter(q => q.type === 'qcm').length})` },
          { key: 'html' as const, label: `HTML (${allQuizzes.filter(q => q.type === 'html').length})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.key ? 'bg-accent-orange text-white' : 'bg-dark-card text-dark-muted border border-dark-border hover:border-accent-orange/50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Quiz list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-dark-muted">
          <svg className="w-16 h-16 mx-auto mb-4 text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun quiz disponible</h3>
          <p>L'administrateur ajoutera bientot des quiz.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((quiz: any) => {
            const best = getBestResult(quiz._id);
            return (
              <div key={quiz._id} onClick={() => setSelectedQuiz(quiz)}
                className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-accent-orange/50 hover:shadow-lg hover:shadow-accent-orange/5 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${quiz.type === 'html' ? 'bg-violet-900/30' : 'bg-accent-orange/10'}`}>
                      {quiz.type === 'html' ? (
                        <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
                      ) : (
                        <svg className="w-6 h-6 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <h3 className="font-bold text-white group-hover:text-accent-orange transition-colors truncate">{quiz.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-dark-muted">
                        <span className={`px-2 py-0.5 rounded-full ${quiz.type === 'html' ? 'bg-violet-900/30 text-violet-400' : 'bg-accent-orange/10 text-accent-orange'}`}>
                          {quiz.type === 'html' ? 'HTML' : 'QCM'}
                        </span>
                        {quiz.type === 'qcm' && <span>{quiz.questions?.length || 0} questions</span>}
                        {quiz.type === 'qcm' && <span>Passage : {quiz.passingScore}%</span>}
                        <span>{quiz.courseName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score / Arrow */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {best ? (
                      <div className="text-right">
                        <p className={`text-lg font-bold ${best.passed ? 'text-green-400' : 'text-red-400'}`}>{best.percentage}%</p>
                        <p className="text-xs text-dark-muted">{best.passed ? 'Reussi' : 'Non reussi'}</p>
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-accent-orange/10 text-accent-orange text-xs font-medium rounded-full">Nouveau</span>
                    )}
                    <svg className="w-5 h-5 text-dark-muted group-hover:text-accent-orange transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
