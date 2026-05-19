import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, totalQuizzes: 0, passRate: 0 });

  useEffect(() => {
    api.getPlatformStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent-blue-dark via-blue-900 to-dark-bg text-dark-text">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-accent-orange/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6 text-accent-orange">
              <span className="w-2 h-2 bg-accent-orange rounded-full animate-pulse" />
              Plateforme e-learning nouvelle generation
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
              Apprenez les competences
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-amber-400">
                numeriques de demain
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-200/80 mb-8 max-w-2xl">
              Accedez a des cours interactifs, suivez votre progression et devenez un expert
              en developpement web, securite, IA et plus encore.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-orange text-white font-semibold rounded-xl hover:bg-accent-orange-dark transition-all shadow-xl shadow-accent-orange/20">
                  Mon tableau de bord
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
              ) : (
                <>
                  <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-orange text-white font-semibold rounded-xl hover:bg-accent-orange-dark transition-all shadow-xl shadow-accent-orange/20">
                    Commencer maintenant
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                  <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20">Voir les cours</Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#0f172a" /></svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: stats.totalCourses, label: 'Cours disponibles' },
              { number: stats.totalStudents, label: 'Etudiants inscrits' },
              { number: `${stats.passRate}%`, label: 'Taux de reussite quiz' },
              { number: stats.totalQuizzes, label: 'Quiz realises' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {stat.number}
                </div>
                <div className="text-sm text-dark-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Une experience d'apprentissage complete</h2>
            <p className="text-dark-muted max-w-2xl mx-auto">Tout ce dont vous avez besoin pour apprendre efficacement le developpement numerique.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-dark-card p-8 rounded-2xl border border-dark-border hover:border-accent-orange/50 hover:shadow-lg transition-all duration-300">
              <svg className="w-10 h-10 text-accent-orange mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              <h3 className="text-xl font-semibold text-white mb-2">Cours structures</h3>
              <p className="text-dark-muted text-sm leading-relaxed">Modules organises avec situation-probleme, activites, solutions et resumes pour un apprentissage progressif.</p>
            </div>
            <div className="bg-dark-card p-8 rounded-2xl border border-dark-border hover:border-accent-blue/50 hover:shadow-lg transition-all duration-300">
              <svg className="w-10 h-10 text-accent-blue mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232 1.232 3.229 0 4.461l-.671.671c-1.232 1.232-3.229 1.232-4.461 0L5 14.5" /></svg>
              <h3 className="text-xl font-semibold text-white mb-2">Activites pratiques</h3>
              <p className="text-dark-muted text-sm leading-relaxed">Mettez en pratique vos connaissances avec des exercices concrets et des projets reels.</p>
            </div>
            <div className="bg-dark-card p-8 rounded-2xl border border-dark-border hover:border-accent-gray/50 hover:shadow-lg transition-all duration-300">
              <svg className="w-10 h-10 text-accent-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
              <h3 className="text-xl font-semibold text-white mb-2">Suivi de progression</h3>
              <p className="text-dark-muted text-sm leading-relaxed">Visualisez votre avancement et vos statistiques d apprentissage en temps reel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-accent-blue-dark via-blue-900 to-dark-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pret a commencer votre parcours ?</h2>
          <p className="text-lg text-blue-200/80 mb-8 max-w-2xl mx-auto">Rejoignez des milliers d apprenants et transformez votre avenir professionnel.</p>
          <Link to={isAuthenticated ? '/dashboard' : '/register'} className="inline-flex items-center gap-2 px-8 py-4 bg-accent-orange text-white font-semibold rounded-xl hover:bg-accent-orange-dark transition-all shadow-xl shadow-accent-orange/20 text-lg">
            {isAuthenticated ? 'Acceder au tableau de bord' : 'Creer un compte gratuit'}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
