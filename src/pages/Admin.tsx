import { useState, useEffect } from 'react';
import { courseService, quizService, authService, api } from '@/services/api';

export default function Admin() {
  const [tab, setTab] = useState<'courses' | 'quizzes' | 'notes' | 'users' | 'stats'>('courses');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [htmlQuizzes, setHtmlQuizzes] = useState<any[]>([]);

  // Forms
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editCourse, setEditCourse] = useState<any>(null);
  const [cForm, setCForm] = useState({ title: '', enonce: '', category: '', niveau: 'L1', pdfUrl: '', tpUrl: '', tdUrl: '' });

  const [showQForm, setShowQForm] = useState(false);
  const [editQ, setEditQ] = useState<string | null>(null);
  const [qForm, setQForm] = useState({ courseId: '', title: '', passingScore: 60, questions: [] as any[] });

  const [showHqForm, setShowHqForm] = useState(false);
  const [hqForm, setHqForm] = useState({ courseId: '', title: '', htmlUrl: '' });

  const [showUserForm, setShowUserForm] = useState(false);
  const [uForm, setUForm] = useState({ name: '', email: '', niveau: 'L1', role: 'admin' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [c, , hq, n, lb, s, u] = await Promise.all([
        courseService.getAll(),
        quizService.getStudentAttempts(''),
        api.getHtmlQuizzes(),
        api.getAllResults(),
        api.getLeaderboard(),
        api.getPlatformStats(),
        authService.getAllUsers(),
      ]);
      setCourses(c); setHtmlQuizzes(hq); setNotes(n); setLeaderboard(lb); setStats(s); setUsers(u);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Course CRUD
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editCourse) await courseService.update(editCourse._id, cForm);
      else await courseService.create(cForm);
      resetCF(); await loadData();
    } catch (err: any) { alert(err.message); }
  };
  const resetCF = () => { setShowCourseForm(false); setEditCourse(null); setCForm({ title: '', enonce: '', category: '', niveau: 'L1', pdfUrl: '', tpUrl: '', tdUrl: '' }); };
  const editC = (c: any) => { setEditCourse(c); setCForm({ title: c.title, enonce: c.enonce || '', category: c.category, niveau: c.niveau, pdfUrl: '', tpUrl: '', tdUrl: '' }); setShowCourseForm(true); };
  const deleteC = async (id: string) => { if (confirm('Supprimer ?')) { await courseService.delete(id); await loadData(); } };

  // Quiz CRUD
  const handleQSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qForm.questions.length) { alert('Ajoutez des questions'); return; }
    try {
      if (editQ) await quizService.updateQuiz(editQ, qForm);
      else await api.createQuiz(qForm);
      resetQF(); await loadData();
    } catch (err: any) { alert(err.message); }
  };
  const resetQF = () => { setShowQForm(false); setEditQ(null); setQForm({ courseId: '', title: '', passingScore: 60, questions: [] }); };
  const addQ = () => setQForm({ ...qForm, questions: [...qForm.questions, { _id: `q_${Date.now()}`, question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }] });
  const removeQ = (i: number) => setQForm({ ...qForm, questions: qForm.questions.filter((_: any, j: number) => j !== i) });
  const editQuiz = (q: any) => { setEditQ(q._id); setQForm({ courseId: q.courseId || '', title: q.title, passingScore: q.passingScore, questions: [...q.questions] }); setShowQForm(true); };
  const deleteQ = async (id: string) => { if (confirm('Supprimer ?')) { await api.deleteQuiz(id); await loadData(); } };

  // HTML Quiz
  const handleHQSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hqForm.htmlUrl || !hqForm.title) { alert('Remplissez tous les champs'); return; }
    try {
      await api.createHtmlQuiz(hqForm);
      setShowHqForm(false); setHqForm({ courseId: '', title: '', htmlUrl: '' });
      await loadData();
    } catch (err: any) { alert(err.message); }
  };
  const deleteHQ = async (id: string) => { if (confirm('Supprimer ?')) { await api.deleteHtmlQuiz(id); await loadData(); } };

  // User
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.createAdmin({ ...uForm, password: 'admi-2026' });
      setShowUserForm(false); setUForm({ name: '', email: '', niveau: 'L1', role: 'admin' });
      await loadData();
    } catch (err: any) { alert(err.message); }
  };
  const deleteUser = async (id: string) => { if (confirm('Supprimer ?')) { await authService.deleteUser(id); await loadData(); } };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-dark-border border-t-accent-orange" /></div>;

  const tabs = [
    { key: 'courses' as const, label: 'Cours', icon: '📚' },
    { key: 'quizzes' as const, label: 'Quiz', icon: '🧠' },
    { key: 'notes' as const, label: 'Notes', icon: '📈' },
    { key: 'users' as const, label: 'Utilisateurs', icon: '👥' },
    { key: 'stats' as const, label: 'Stats', icon: '📊' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
      <p className="text-dark-muted mb-6">KVJ-Evolution School</p>

      <div className="flex gap-2 mb-8 border-b border-dark-border pb-2 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? 'bg-accent-orange text-white' : 'text-dark-muted hover:bg-dark-border hover:text-white'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* COURSES */}
      {tab === 'courses' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setEditCourse(null); setCForm({ title: '', enonce: '', category: '', niveau: 'L1', pdfUrl: '', tpUrl: '', tdUrl: '' }); setShowCourseForm(!showCourseForm); }} className="px-4 py-2 bg-accent-orange text-white rounded-lg text-sm font-medium">
              {showCourseForm ? 'Annuler' : '+ Nouveau cours'}
            </button>
          </div>
          {showCourseForm && (
            <div className="bg-dark-card rounded-2xl border border-dark-border p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">{editCourse ? 'Modifier' : 'Nouveau'} cours</h3>
              <form onSubmit={handleCourseSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-dark-text mb-1">Titre</label><input type="text" value={cForm.title} onChange={e => setCForm({ ...cForm, title: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white outline-none focus:ring-2 focus:ring-accent-orange" required /></div>
                  <div><label className="block text-sm font-medium text-dark-text mb-1">Categorie</label><input type="text" value={cForm.category} onChange={e => setCForm({ ...cForm, category: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white outline-none focus:ring-2 focus:ring-accent-orange" required /></div>
                  <div><label className="block text-sm font-medium text-dark-text mb-1">Niveau</label><select value={cForm.niveau} onChange={e => setCForm({ ...cForm, niveau: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white outline-none"><option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option></select></div>
                </div>
                <div><label className="block text-sm font-medium text-dark-text mb-1">Description</label><textarea value={cForm.enonce} onChange={e => setCForm({ ...cForm, enonce: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white outline-none focus:ring-2 focus:ring-accent-orange" placeholder="Description..." /></div>
                {['pdfUrl', 'tpUrl', 'tdUrl'].map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-dark-text mb-1">{key === 'pdfUrl' ? 'PDF du cours' : key === 'tpUrl' ? 'TP' : 'TD'}</label>
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-dark-bg border-2 border-dashed border-dark-border rounded-lg cursor-pointer hover:border-accent-orange/50 w-full">
                      <span className="text-sm text-dark-muted">{cForm[key as keyof typeof cForm] ? 'Changer' : 'Importer'}</span>
                      <input type="file" accept=".pdf" onChange={async (e) => {
                        const f = e.target.files?.[0]; if (!f) return;
                        try { const d = await courseService.uploadPdf(f); setCForm({ ...cForm, [key]: d }); } catch (err: any) { alert(err.message); }
                        e.target.value = '';
                      }} className="hidden" />
                    </label>
                    {cForm[key as keyof typeof cForm] && <div className="mt-1 flex gap-2"><span className="text-xs text-green-500">✓ Importé</span><button type="button" onClick={() => setCForm({ ...cForm, [key]: '' })} className="text-xs text-red-400">Supprimer</button></div>}
                  </div>
                ))}
                <div className="flex gap-3"><button type="submit" className="px-6 py-2.5 bg-accent-orange text-white font-medium rounded-lg">{editCourse ? 'Mettre à jour' : 'Créer'}</button><button type="button" onClick={resetCF} className="px-6 py-2.5 text-dark-muted border border-dark-border rounded-lg hover:bg-dark-border">Annuler</button></div>
              </form>
            </div>
          )}
          <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
            <table className="w-full"><thead><tr className="bg-dark-border/30"><th className="text-left px-6 py-4 text-sm font-semibold text-dark-muted">Titre</th><th className="text-left px-6 py-4 text-sm font-semibold text-dark-muted">Niveau</th><th className="text-right px-6 py-4 text-sm font-semibold text-dark-muted">Actions</th></tr></thead>
              <tbody className="divide-y divide-dark-border">
                {courses.length === 0 ? <tr><td colSpan={3} className="px-6 py-8 text-center text-dark-muted">Aucun cours</td></tr> :
                courses.map(c => (<tr key={c._id} className="hover:bg-dark-border/20"><td className="px-6 py-4"><p className="font-medium text-white">{c.title}</p><p className="text-sm text-dark-muted">{c.category}</p></td><td className="px-6 py-4"><span className="px-2.5 py-1 bg-accent-blue/10 text-accent-blue rounded-full text-xs">{c.niveau}</span></td><td className="px-6 py-4 text-right"><button onClick={() => editC(c)} className="px-3 py-1.5 text-sm text-accent-blue hover:bg-accent-blue/10 rounded-lg mr-2">Modifier</button><button onClick={() => deleteC(c._id)} className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/20 rounded-lg">Supprimer</button></td></tr>))}
              </tbody></table>
          </div>
        </div>
      )}

      {/* QUIZZES */}
      {tab === 'quizzes' && (
        <div className="space-y-8">
          {/* QCM Quizzes */}
          <div>
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">Quiz QCM</h2>
              <button onClick={() => { setEditQ(null); setQForm({ courseId: '', title: '', passingScore: 60, questions: [] }); setShowQForm(!showQForm); }} className="px-4 py-2 bg-accent-orange text-white rounded-lg text-sm">{showQForm ? 'Annuler' : '+ Créer un Quiz'}</button>
            </div>
            {showQForm && (
              <div className="bg-dark-card rounded-2xl border border-dark-border p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">{editQ ? 'Modifier' : 'Nouveau'} Quiz QCM</h3>
                <form onSubmit={handleQSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-dark-text mb-1">Cours</label><select value={qForm.courseId} onChange={e => setQForm({ ...qForm, courseId: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white outline-none"><option value="">Indépendant</option>{courses.map((c: any) => <option key={c._id} value={c._id}>{c.title}</option>)}</select></div>
                    <div><label className="block text-sm text-dark-text mb-1">Titre</label><input type="text" value={qForm.title} onChange={e => setQForm({ ...qForm, title: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white outline-none" required /></div>
                    <div><label className="block text-sm text-dark-text mb-1">Passage (%)</label><input type="number" min={0} max={100} value={qForm.passingScore} onChange={e => setQForm({ ...qForm, passingScore: parseInt(e.target.value) || 0 })} className="w-32 px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white outline-none" /></div>
                  </div>
                  <div className="flex justify-between items-center"><h4 className="font-semibold text-white">{qForm.questions.length} questions</h4><button type="button" onClick={addQ} className="px-4 py-2 text-sm bg-accent-blue text-white rounded-lg">+ Question</button></div>
                  {qForm.questions.length === 0 && <p className="text-center text-dark-muted py-6">Aucune question</p>}
                  {qForm.questions.map((q: any, qi: number) => (
                    <div key={q._id} className="bg-dark-bg rounded-xl p-4 border border-dark-border">
                      <div className="flex justify-between mb-2"><span className="text-sm font-bold text-white">Q{qi + 1}</span><button type="button" onClick={() => removeQ(qi)} className="text-sm text-red-400">Supprimer</button></div>
                      <input type="text" value={q.question} onChange={e => { const n = [...qForm.questions]; n[qi].question = e.target.value; setQForm({ ...qForm, questions: n }); }} placeholder="Question..." className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white text-sm mb-2 outline-none" required />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{q.options.map((o: string, oi: number) => (
                        <div key={oi} className="flex items-center gap-2"><input type="radio" name={`c_${q._id}`} checked={q.correctAnswer === oi} onChange={() => { const n = [...qForm.questions]; n[qi].correctAnswer = oi; setQForm({ ...qForm, questions: n }); }} className="w-4 h-4 text-accent-orange" /><input type="text" value={o} onChange={e => { const n = [...qForm.questions]; n[qi].options[oi] = e.target.value; setQForm({ ...qForm, questions: n }); }} placeholder={`Option ${String.fromCharCode(65 + oi)}`} className="flex-1 px-3 py-1.5 bg-dark-card border border-dark-border rounded-lg text-white text-sm outline-none" required /></div>
                      ))}</div>
                    </div>
                  ))}
                  <div className="flex gap-3"><button type="submit" className="px-6 py-2.5 bg-accent-orange text-white font-medium rounded-lg">{editQ ? 'Mettre à jour' : 'Créer'}</button><button type="button" onClick={resetQF} className="px-6 py-2.5 text-dark-muted border border-dark-border rounded-lg">Annuler</button></div>
                </form>
              </div>
            )}
            {/* Show manual quizzes from localStorage */}
            {(() => {
              const storedQuizzes = JSON.parse(localStorage.getItem('kvj_quizzes') || '[]');
              return storedQuizzes.length > 0 && (
                <div className="space-y-3">{storedQuizzes.map((q: any) => (
                  <div key={q._id} className="bg-dark-card rounded-xl border border-dark-border p-4 flex items-center justify-between"><div><h4 className="font-bold text-white">{q.title}</h4><p className="text-xs text-dark-muted">{q.questions?.length || 0} questions • {q.passingScore}%</p></div><div className="flex gap-2"><button onClick={() => editQuiz(q)} className="px-3 py-1 text-xs text-accent-blue hover:bg-accent-blue/10 rounded-lg">Modifier</button><button onClick={() => deleteQ(q._id)} className="px-3 py-1 text-xs text-red-400 hover:bg-red-900/20 rounded-lg">Supprimer</button></div></div>
                ))}</div>
              );
            })()}
          </div>

          {/* HTML Quizzes */}
          <div className="border-t border-dark-border pt-8">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">Quiz HTML</h2>
              <button onClick={() => setShowHqForm(!showHqForm)} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm">{showHqForm ? 'Annuler' : '+ Importer HTML'}</button>
            </div>
            {showHqForm && (
              <div className="bg-dark-card rounded-2xl border border-dark-border p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Importer un Quiz HTML</h3>
                <form onSubmit={handleHQSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-dark-text mb-1">Cours</label><select value={hqForm.courseId} onChange={e => setHqForm({ ...hqForm, courseId: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white outline-none"><option value="">Indépendant</option>{courses.map((c: any) => <option key={c._id} value={c._id}>{c.title}</option>)}</select></div>
                    <div><label className="block text-sm text-dark-text mb-1">Titre</label><input type="text" value={hqForm.title} onChange={e => setHqForm({ ...hqForm, title: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white outline-none" required /></div>
                  </div>
                  <div><label className="block text-sm text-dark-text mb-1">Fichier HTML</label>
                    <label className="flex items-center gap-2 px-4 py-3 bg-dark-bg border-2 border-dashed border-dark-border rounded-lg cursor-pointer hover:border-violet-500 w-full">
                      <span className="text-sm text-dark-muted">{hqForm.htmlUrl ? 'Changer' : 'Importer (.html)'}</span>
                      <input type="file" accept=".html,.htm" onChange={async (e) => {
                        const f = e.target.files?.[0]; if (!f) return;
                        try { const d = await courseService.uploadHtmlQuiz(f); setHqForm({ ...hqForm, htmlUrl: d }); alert('Importé !'); } catch (err: any) { alert(err.message); }
                        e.target.value = '';
                      }} className="hidden" />
                    </label>
                  </div>
                  <div className="flex gap-3"><button type="submit" className="px-6 py-2.5 bg-violet-600 text-white font-medium rounded-lg">Importer</button><button type="button" onClick={() => setShowHqForm(false)} className="px-6 py-2.5 text-dark-muted border border-dark-border rounded-lg">Annuler</button></div>
                </form>
              </div>
            )}
            {htmlQuizzes.length > 0 && (
              <div className="space-y-3">{htmlQuizzes.map((q: any) => (
                <div key={q._id} className="bg-dark-card rounded-xl border border-dark-border p-4 flex items-center justify-between"><div><h4 className="font-bold text-white">🧩 {q.title}</h4></div><button onClick={() => deleteHQ(q._id)} className="px-3 py-1 text-xs text-red-400 hover:bg-red-900/20 rounded-lg">Supprimer</button></div>
              ))}</div>
            )}
          </div>
        </div>
      )}

      {/* NOTES */}
      {tab === 'notes' && (
        <div className="space-y-6">
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { n: stats.totalStudents, l: 'Étudiants', c: 'text-accent-blue' },
                { n: stats.totalQuizzes, l: 'Quiz passés', c: 'text-green-400' },
                { n: `${stats.avgScore}%`, l: 'Moyenne', c: 'text-accent-orange' },
                { n: `${stats.passRate}%`, l: 'Réussite', c: 'text-emerald-400' },
              ].map((s, i) => (
                <div key={i} className="bg-dark-card rounded-xl border border-dark-border p-4"><p className={`text-2xl font-bold ${s.c}`}>{s.n}</p><p className="text-xs text-dark-muted">{s.l}</p></div>
              ))}
            </div>
          )}
          {leaderboard.length > 0 && (
            <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
              <div className="px-6 py-3 border-b border-dark-border"><h3 className="font-bold text-white">🏆 Classement</h3></div>
              <div className="divide-y divide-dark-border">{leaderboard.slice(0, 10).map((e: any, i: number) => (
                <div key={e.studentId} className="flex items-center gap-4 px-6 py-3"><span className="text-lg">{i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}</span><div className="flex-1"><p className="font-medium text-white">{e.name}</p><p className="text-xs text-dark-muted">{e.totalQuizzes} quiz • {e.passedQuizzes} réussis</p></div><span className={`text-xl font-bold ${e.avgPercentage >= 60 ? 'text-green-400' : 'text-red-400'}`}>{e.avgPercentage}%</span></div>
              ))}</div>
            </div>
          )}
          <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
            <div className="px-6 py-3 border-b border-dark-border"><h3 className="font-bold text-white">Toutes les notes ({notes.length})</h3></div>
            {notes.length === 0 ? <p className="text-center py-8 text-dark-muted">Aucune note</p> : (
              <div className="max-h-96 overflow-y-auto"><table className="w-full"><thead className="sticky top-0 bg-dark-bg"><tr><th className="text-left px-4 py-2 text-xs text-dark-muted">Étudiant</th><th className="text-left px-4 py-2 text-xs text-dark-muted">Quiz</th><th className="text-center px-4 py-2 text-xs text-dark-muted">Score</th><th className="text-center px-4 py-2 text-xs text-dark-muted">Statut</th><th className="text-center px-4 py-2 text-xs text-dark-muted">Date</th></tr></thead><tbody className="divide-y divide-dark-border">
                {notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((n: any) => (
                  <tr key={n._id}><td className="px-4 py-2 text-sm text-white">{n.studentName || n.studentId}</td><td className="px-4 py-2 text-xs text-dark-muted truncate max-w-48">{n.quizTitle}</td><td className="px-4 py-2 text-center text-sm font-bold">{n.score}/{n.totalQuestions} ({n.percentage}%)</td><td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs ${n.passed ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{n.passed ? 'Réussi' : 'Échoué'}</span></td><td className="px-4 py-2 text-center text-xs text-dark-muted">{new Date(n.date).toLocaleDateString('fr-FR')}</td></tr>
                ))}
              </tbody></table></div>
            )}
          </div>
        </div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-end"><button onClick={() => setShowUserForm(!showUserForm)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">{showUserForm ? 'Annuler' : '+ Ajouter utilisateur'}</button></div>
          {showUserForm && (
            <div className="bg-dark-card rounded-2xl border border-dark-border p-6">
              <h3 className="text-lg font-bold text-white mb-4">Nouvel utilisateur</h3>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-dark-text mb-1">Nom</label><input type="text" value={uForm.name} onChange={e => setUForm({ ...uForm, name: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white outline-none" required /></div>
                  <div><label className="block text-sm text-dark-text mb-1">Email</label><input type="email" value={uForm.email} onChange={e => setUForm({ ...uForm, email: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white outline-none" required /></div>
                </div>
                <p className="text-xs text-dark-muted">Mot de passe : admi-2026</p>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg">Créer</button>
              </form>
            </div>
          )}
          <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
            <table className="w-full"><thead><tr className="bg-dark-border/30"><th className="text-left px-6 py-4 text-sm text-dark-muted">Nom</th><th className="text-left px-6 py-4 text-sm text-dark-muted">Email</th><th className="text-left px-6 py-4 text-sm text-dark-muted">Rôle</th><th className="text-right px-6 py-4 text-sm text-dark-muted">Actions</th></tr></thead>
              <tbody className="divide-y divide-dark-border">{users.map((u: any) => (
                <tr key={u._id} className="hover:bg-dark-border/20"><td className="px-6 py-4 font-medium text-white">{u.name}</td><td className="px-6 py-4 text-sm text-dark-muted">{u.email}</td><td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs ${u.role === 'admin' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-accent-blue/10 text-accent-blue'}`}>{u.role === 'admin' ? 'Admin' : 'Étudiant'}</span></td><td className="px-6 py-4 text-right">{u.email !== 'valdexjoyeux@gmail.com' && <button onClick={() => deleteUser(u._id)} className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/20 rounded-lg">Supprimer</button>}</td></tr>
              ))}</tbody></table>
          </div>
        </div>
      )}

      {/* STATS */}
      {tab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-dark-card rounded-xl border border-dark-border p-5"><p className="text-2xl font-bold text-white">{stats?.totalStudents || 0}</p><p className="text-xs text-dark-muted">Étudiants inscrits</p></div>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5"><p className="text-2xl font-bold text-white">{stats?.totalCourses || 0}</p><p className="text-xs text-dark-muted">Cours publiés</p></div>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5"><p className="text-2xl font-bold text-white">{stats?.totalQuizzes || 0}</p><p className="text-xs text-dark-muted">Quiz passés</p></div>
            <div className="bg-dark-card rounded-xl border border-dark-border p-5"><p className="text-2xl font-bold text-accent-orange">{stats?.passRate || 0}%</p><p className="text-xs text-dark-muted">Taux de réussite</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
