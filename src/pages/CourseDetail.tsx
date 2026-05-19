import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService, progressService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import ProgressBar from '@/components/ProgressBar';
import QuizComponent from '@/components/QuizComponent';
import HtmlQuizViewer from '@/components/HtmlQuizViewer';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cours' | 'td' | 'tp' | 'quiz'>('cours');
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('situation');
  const [moduleProgress, setModuleProgress] = useState<Record<string, boolean>>({});
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  // Quiz data from localStorage
  const [manualQuizzes, setManualQuizzes] = useState<any[]>([]);
  const [htmlQuizzes, setHtmlQuizzes] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await courseService.getById(id!);
        setCourse(data);
        if (data.modules && data.modules.length > 0) setActiveModule(data.modules[0]._id);

        // Load quizzes associated with this course
        const mq = JSON.parse(localStorage.getItem('kvj_quizzes') || '[]');
        const hq = JSON.parse(localStorage.getItem('kvj_html_quizzes') || '[]');
        setManualQuizzes(mq.filter((q: any) => q.courseId === id));
        setHtmlQuizzes(hq.filter((q: any) => q.courseId === id));

        if (isAuthenticated && user) {
          const progressData = await progressService.getByStudent(user._id);
          const cp = progressData.find((p: any) => p.courseId === id);
          if (cp) {
            setUserProgress(cp);
            const completedMap: Record<string, boolean> = {};
            cp.completedModules.forEach((mId: string) => { completedMap[mId] = true; });
            setModuleProgress(completedMap);
          }
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchCourse();
  }, [id, isAuthenticated, user]);

  const handleCompleteModule = async (moduleId: string) => {
    if (!isAuthenticated || !user) return;
    try {
      const updated = await progressService.updateModuleProgress(user._id, id!, moduleId);
      setUserProgress(updated);
      setModuleProgress((prev) => ({ ...prev, [moduleId]: true }));
    } catch (e) { console.error(e); }
  };

  // Resolve PDF URL (handles file IDs and data URLs)
  const resolvePdfUrl = (fileRef: string): string => {
    if (!fileRef) return '';
    if (fileRef.startsWith('data:') || fileRef.startsWith('http')) return fileRef;
    const files = JSON.parse(localStorage.getItem('kvj_files') || '{}');
    return files[fileRef] || '';
  };

  // Download PDF file
  const handleDownload = (fileRef: string, filename: string) => {
    const dataUrl = resolvePdfUrl(fileRef);
    if (!dataUrl) return;
    if (dataUrl.startsWith('http')) {
      window.open(dataUrl, '_blank');
      return;
    }
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename.endsWith('.pdf') ? filename : filename + '.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const currentModule = course?.modules?.find((m: any) => m._id === activeModule);

  // All available quizzes for this course
  const allQuizzes = [
    ...manualQuizzes.map((q: any) => ({ ...q, type: 'qcm' })),
    ...htmlQuizzes.map((q: any) => ({ ...q, type: 'html' })),
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-dark-border border-t-accent-orange" /></div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><svg className="w-16 h-16 mx-auto mb-4 text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg><h2 className="text-2xl font-bold mb-2 text-white">Cours non trouve</h2><Link to="/courses" className="text-accent-orange">Retour aux cours</Link></div></div>;

  const tabs = [
    { key: 'cours' as const, label: 'Cours' },
    { key: 'td' as const, label: 'TD' },
    { key: 'tp' as const, label: 'TP' },
    { key: 'quiz' as const, label: `Quiz (${allQuizzes.length})` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/courses" className="hover:text-blue-600">Cours</Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium truncate">{course.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Header */}
          <div className="bg-dark-card rounded-2xl border border-dark-border p-6 md:p-8 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{course.title}</h1>
            {course.enonce && <p className="text-dark-muted mb-4 whitespace-pre-wrap">{course.enonce}</p>}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="px-2.5 py-1 bg-accent-blue/10 text-accent-blue rounded-full text-xs font-medium">{course.category}</span>
              <span className="px-2.5 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-medium">{course.niveau}</span>
              {course.modules && <span className="text-dark-muted">{course.modules.length} module{course.modules.length > 1 ? 's' : ''}</span>}
            </div>
          </div>



          {/* Content Tabs */}
          <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
            <div className="flex border-b border-dark-border overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${activeTab === tab.key ? 'border-accent-orange text-accent-orange bg-accent-orange/5' : 'border-transparent text-dark-muted hover:text-white hover:bg-dark-border'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8">
              {/* ──── TAB: COURS ──── */}
              {activeTab === 'cours' && (
                <>
                  {/* PDF Viewer for course PDF */}
                  {course.pdfUrl && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white">Support PDF du cours</h3>
                        <div className="flex gap-2">
                          <button onClick={() => handleDownload(course.pdfUrl, course.title)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Télécharger
                          </button>
                          <button onClick={() => window.open(course.pdfUrl, '_blank')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-border text-dark-text text-sm font-medium rounded-lg hover:bg-dark-border/80 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Plein écran
                          </button>
                        </div>
                      </div>
                      <div className="bg-dark-bg border border-dark-border rounded-xl overflow-hidden" style={{ height: '700px' }}>
                        <iframe src={course.pdfUrl} title={course.title} className="w-full h-full" style={{ border: 'none' }} />
                      </div>
                    </div>
                  )}

                  {currentModule ? (
                    <div>
                      {/* Module sub-tabs */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                          {[
                            { key: 'situation', label: 'Situation-probleme' },
                            { key: 'activite', label: 'Activite' },
                            { key: 'solution', label: 'Solution' },
                          ].map(tab => (
                            <button key={tab.key} onClick={() => setActiveSection(tab.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeSection === tab.key ? 'bg-accent-orange/20 text-accent-orange' : 'bg-dark-border text-dark-muted hover:bg-dark-border/80 hover:text-white'}`}>
                              {tab.label}
                            </button>
                          ))}
                        </div>

                      {activeSection === 'situation' && currentModule.situationProbleme && (
                        <div className="bg-amber-900/20 border border-amber-800/30 rounded-xl p-5">
                          <h3 className="font-bold text-amber-400 mb-2">{currentModule.situationProbleme.titre}</h3>
                          {currentModule.situationProbleme.contenu.split('\n').map((l: string, i: number) => l.trim() ? <p key={i} className="text-sm text-amber-300/80 mb-1">{l}</p> : null)}
                        </div>
                      )}
                      {activeSection === 'activite' && currentModule.activite && (
                        <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-xl p-5">
                          <h3 className="font-bold text-accent-blue mb-2">{currentModule.activite.titre}</h3>
                          <pre className="text-sm text-blue-300/80 whitespace-pre-wrap font-sans">{currentModule.activite.consigne}</pre>
                        </div>
                      )}
                      {activeSection === 'solution' && currentModule.solution && (
                        <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-5">
                          <h3 className="font-bold text-green-400 mb-2">{currentModule.solution.titre}</h3>
                          <pre className="text-sm text-green-300/80 whitespace-pre-wrap font-sans">{currentModule.solution.contenu}</pre>
                        </div>
                      )}

                      {/* Complete module button */}
                      {isAuthenticated && !moduleProgress[currentModule._id] && (
                        <button onClick={() => handleCompleteModule(currentModule._id)} className="mt-4 px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                          ✓ Marquer ce module comme terminé
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      <p className="text-dark-muted">Aucun module dans ce cours pour le moment.</p>
                    </div>
                  )}
                </>
              )}

              {/* ──── TAB: TD ──── */}
              {activeTab === 'td' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Travaux Dirigés</h2>
                    {course.tdUrl && (
                      <div className="flex gap-2">
                        <button onClick={() => handleDownload(course.tdUrl, 'TD')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          Télécharger
                        </button>
                        <button onClick={() => window.open(course.tdUrl, '_blank')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-border text-dark-text text-sm font-medium rounded-lg hover:bg-dark-border/80 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          Plein écran
                        </button>
                      </div>
                    )}
                  </div>
                  {course.tdUrl ? (
                    <div className="bg-dark-bg border border-dark-border rounded-xl overflow-hidden" style={{ height: '700px' }}>
                      <iframe src={course.tdUrl} title="TD" className="w-full h-full" style={{ border: 'none' }} />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-dark-muted"><svg className="w-12 h-12 mx-auto mb-2 text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p>Aucun TD disponible pour ce cours.</p></div>
                  )}
                </div>
              )}

              {/* ──── TAB: TP ──── */}
              {activeTab === 'tp' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Travaux Pratiques</h2>
                    {course.tpUrl && (
                      <div className="flex gap-2">
                        <button onClick={() => handleDownload(course.tpUrl, 'TP')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue text-white text-sm font-medium rounded-lg hover:bg-accent-blue-dark transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          Télécharger
                        </button>
                        <button onClick={() => window.open(course.tpUrl, '_blank')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-border text-dark-text text-sm font-medium rounded-lg hover:bg-dark-border/80 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          Plein écran
                        </button>
                      </div>
                    )}
                  </div>
                  {course.tpUrl ? (
                    <div className="bg-dark-bg border border-dark-border rounded-xl overflow-hidden" style={{ height: '700px' }}>
                      <iframe src={course.tpUrl} title="TP" className="w-full h-full" style={{ border: 'none' }} />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-dark-muted"><svg className="w-12 h-12 mx-auto mb-2 text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p>Aucun TP disponible pour ce cours.</p></div>
                  )}
                </div>
              )}

              {/* ──── TAB: QUIZ ──── */}
              {activeTab === 'quiz' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Quiz du cours</h2>
                  {selectedQuiz ? (
                    <div>
                      <button onClick={() => setSelectedQuiz(null)} className="text-sm text-accent-orange hover:text-accent-orange-dark mb-4 flex items-center gap-1">← Retour a la liste des quiz</button>
                      {selectedQuiz.type === 'html' ? (
                        <HtmlQuizViewer htmlContent={selectedQuiz.htmlUrl} courseId={course._id} quizTitle={selectedQuiz.title} />
                      ) : (
                        <div className="bg-accent-blue/5 border border-dark-border rounded-xl p-6">
                          <QuizComponent quiz={selectedQuiz} courseId={course._id} moduleId={`manual_${selectedQuiz._id}`} />
                        </div>
                      )}
                    </div>
                  ) : allQuizzes.length > 0 ? (
                    <div className="space-y-4">
                      {allQuizzes.map((quiz: any) => (
                        <div key={quiz._id} className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-accent-orange/50 hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedQuiz(quiz)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 text-dark-muted">{quiz.type === 'html' ? (
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
                              ) : (
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              )}</span>
                              <div><h3 className="font-bold text-white">{quiz.title}</h3><p className="text-xs text-dark-muted">{quiz.type === 'html' ? 'Quiz interactif HTML' : `${quiz.questions.length} questions • Passage : ${quiz.passingScore}%`}</p></div>
                            </div>
                            <svg className="w-5 h-5 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-dark-muted"><svg className="w-12 h-12 mx-auto mb-2 text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p>Aucun quiz disponible pour ce cours.</p></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Module List */}
        <div className="lg:col-span-1">
          <div className="bg-dark-card rounded-2xl border border-dark-border p-6 sticky top-24">
            <h3 className="font-bold text-white mb-4">Modules du cours</h3>
            {course.modules && course.modules.length > 0 ? (
              <div className="space-y-2">
                {course.modules.map((mod: any, idx: number) => {
                  const isActive = activeModule === mod._id;
                  const isCompleted = moduleProgress[mod._id];
                  return (
                    <button key={mod._id} onClick={() => { setActiveModule(mod._id); setActiveSection('situation'); setActiveTab('cours'); }}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${isActive ? 'border-accent-orange/50 bg-accent-orange/10 text-accent-orange' : 'border-dark-border hover:bg-dark-border'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${isCompleted ? 'bg-green-900/30 text-green-400' : isActive ? 'bg-accent-orange/20 text-accent-orange' : 'bg-dark-border text-dark-muted'}`}>
                          {isCompleted ? '✓' : idx + 1}
                        </span>
                        <span className="truncate">{mod.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-dark-muted">Aucun module</p>
            )}
            {userProgress && (
              <div className="mt-6 pt-4 border-t border-dark-border">
                <p className="text-xs font-medium text-dark-muted mb-2">Progression</p>
                <ProgressBar percentage={userProgress.percentage} size="sm" />
              </div>
            )}
            <Link to="/courses" className="block w-full text-center mt-4 py-2.5 text-sm text-dark-muted border border-dark-border rounded-lg hover:bg-dark-border hover:text-white">← Retour aux cours</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
