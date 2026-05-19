import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { courseService, progressService, quizService, api } from '@/services/api';
import CourseCard from '@/components/CourseCard';
import ProgressBar from '@/components/ProgressBar';

interface Progress {
  studentId: string;
  courseId: string;
  completedModules: string[];
  percentage: number;
  startedAt?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number>(0);
  const [myAvgScore, setMyAvgScore] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, progressData, attemptsData, leaderboard] = await Promise.all([
          courseService.getAll(),
          progressService.getByStudent(user?._id || ''),
          quizService.getStudentAttempts(user?._id || ''),
          api.getLeaderboard(),
        ]);
        setCourses(coursesData);
        setProgress(progressData);
        setQuizAttempts(attemptsData);
        const myIndex = leaderboard.findIndex((s: any) => s.studentId === user?._id);
        setMyRank(myIndex >= 0 ? myIndex + 1 : 0);
        if (myIndex >= 0) setMyAvgScore(leaderboard[myIndex].avgPercentage);
      } catch (err) { console.error('Erreur chargement dashboard:', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const totalQuizAttempts = quizAttempts.length;
  const passedQuizzes = quizAttempts.filter((a: any) => a.passed).length;
  const avgQuizScore = totalQuizAttempts > 0 ? Math.round(quizAttempts.reduce((sum: number, a: any) => sum + a.percentage, 0) / totalQuizAttempts) : 0;
  const recentAttempts = [...quizAttempts].sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).slice(0, 5);
  const totalProgress = progress.length > 0 ? Math.round(progress.reduce((sum, p) => sum + p.percentage, 0) / progress.length) : 0;
  const inProgressCourses = courses.filter((c) => progress.some((p) => p.courseId === c._id && p.percentage < 100));
  const completedCourses = courses.filter((c) => progress.some((p) => p.courseId === c._id && p.percentage === 100));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-dark-border border-t-accent-orange" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Bonjour, {user?.name}</h1>
        <p className="text-dark-muted mt-1">Voici votre resume d'apprentissage</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { n: courses.length, l: 'Cours disponibles', color: 'text-accent-blue', bg: 'bg-blue-900/30' },
          { n: completedCourses.length, l: 'Cours termines', color: 'text-green-400', bg: 'bg-green-900/30' },
          { n: inProgressCourses.length, l: 'En cours', color: 'text-orange-400', bg: 'bg-orange-900/30' },
          { n: `${totalProgress}%`, l: 'Progression globale', color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
          { n: `${passedQuizzes}/${totalQuizAttempts}`, l: 'Quiz reussis', color: 'text-indigo-400', bg: 'bg-indigo-900/30' },
          { n: `${avgQuizScore}%`, l: 'Score moyen quiz', color: avgQuizScore >= 60 ? 'text-green-400' : 'text-yellow-400', bg: avgQuizScore >= 60 ? 'bg-green-900/30' : 'bg-yellow-900/30' },
        ].map((s, i) => (
          <div key={i} className="bg-dark-card rounded-xl border border-dark-border p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                <span className={`text-lg font-bold ${s.color}`}>{s.n}</span>
              </div>
              <div><p className={`text-lg font-bold text-white`}>{s.n}</p><p className="text-xs text-dark-muted">{s.l}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* My Rank Card */}
      {myRank > 0 && (
        <div className="bg-gradient-to-r from-accent-orange to-accent-blue rounded-2xl p-5 mb-8 text-white shadow-xl shadow-accent-orange/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-black">#{myRank}</div>
            <div><p className="text-sm text-white/80">Votre classement</p><p className="text-xl font-bold">Moyenne : {myAvgScore || avgQuizScore}%</p></div>
          </div>
          <Link to="/leaderboard" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Voir le classement →</Link>
        </div>
      )}

      {/* Global Progress */}
      <div className="bg-dark-card rounded-xl border border-dark-border p-5 mb-8">
        <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-white">Progression globale</h3><span className="text-sm text-dark-muted">{totalProgress}% complete</span></div>
        <ProgressBar percentage={totalProgress} size="lg" showLabel={false} />
      </div>

      {/* Quiz Results */}
      {recentAttempts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Derniers quiz</h2>
          <div className="bg-dark-card rounded-xl border border-dark-border divide-y divide-dark-border">
            {recentAttempts.map((attempt: any) => {
              const course = courses.find((c: any) => c._id === attempt.courseId);
              return (
                <div key={attempt._id} className="flex items-center gap-4 p-4 hover:bg-dark-border/50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${attempt.passed ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                    <span className="text-lg">{attempt.passed ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{course?.title || 'Quiz'}</p><p className="text-xs text-dark-muted">{attempt.score}/{attempt.totalQuestions} bonnes reponses</p></div>
                  <div className="text-right flex-shrink-0"><div className={`text-sm font-bold ${attempt.passed ? 'text-green-400' : 'text-red-400'}`}>{attempt.percentage}%</div><p className="text-xs text-dark-muted">{new Date(attempt.completedAt).toLocaleDateString('fr-FR')}</p></div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Courses in Progress */}
      {inProgressCourses.length > 0 && (
        <section className="mb-8"><h2 className="text-xl font-bold text-white mb-4">Cours en cours</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{inProgressCourses.map((course) => <CourseCard key={course._id} course={course} progress={progress.find((p) => p.courseId === course._id)?.percentage} />)}</div>
        </section>
      )}

      {/* All Courses */}
      <section>
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-white">Tous les cours</h2><Link to="/courses" className="text-sm text-accent-orange font-medium hover:underline">Voir tout</Link></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{courses.map((course) => <CourseCard key={course._id} course={course} progress={progress.find((p) => p.courseId === course._id)?.percentage} />)}</div>
      </section>
    </div>
  );
}
