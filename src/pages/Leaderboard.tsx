import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import ProgressBar from '@/components/ProgressBar';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getLeaderboard();
        setLeaderboard(data);
        if (user) {
          const myIndex = data.findIndex((s: any) => s.studentId === user._id);
          setMyRank(myIndex >= 0 ? myIndex + 1 : 0);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadData();
  }, [user]);

  const medals = ['🥇', '🥈', '🥉'];
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-dark-border border-t-accent-orange" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-3">
          <span className="text-4xl">🏆</span>
          <h1 className="text-3xl font-black text-white">Classement General</h1>
        </div>
        <p className="text-dark-muted">Les meilleurs etudiants de KVJ-Evolution School</p>
      </div>

      {/* My Rank Card */}
      {user && myRank > 0 && (
        <div className="bg-gradient-to-r from-accent-orange to-accent-blue rounded-2xl p-6 mb-8 text-white shadow-xl shadow-accent-orange/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-black">{myRank}</div>
              <div><p className="text-sm text-white/80">Votre position</p><p className="text-xl font-bold">{user.name}</p></div>
            </div>
            <div className="text-right"><p className="text-sm text-white/80">Moyenne</p><p className="text-3xl font-black">{leaderboard[myRank - 1]?.avgPercentage ?? 0}%</p></div>
          </div>
          <div className="mt-4"><ProgressBar percentage={leaderboard[myRank - 1]?.avgPercentage ?? 0} size="sm" showLabel={false} /></div>
        </div>
      )}

      {/* Top 10 Leaderboard */}
      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 px-6 py-4 border-b border-dark-border">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">🏅 Top 10 des Etudiants</h2>
        </div>
        {leaderboard.length === 0 ? (
          <div className="text-center py-16 text-dark-muted"><p className="text-4xl mb-2">📊</p><p>Aucune donnee disponible</p><p className="text-sm mt-1">Passez des quiz pour apparaitre dans le classement</p></div>
        ) : (
          <div className="divide-y divide-dark-border">
            {leaderboard.slice(0, 10).map((entry, index) => (
              <div key={entry.studentId} className={`flex items-center gap-4 px-6 py-4 hover:bg-dark-border/50 transition-colors ${user?._id === entry.studentId ? 'bg-accent-orange/10 border-l-4 border-accent-orange' : ''}`}>
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">{index < 3 ? <span className="text-3xl">{medals[index]}</span> : <span className="text-lg font-bold text-dark-muted">#{index + 1}</span>}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white truncate">{entry.name}</p>
                    {user?._id === entry.studentId && <span className="text-xs px-2 py-0.5 bg-accent-orange/20 text-accent-orange rounded-full font-medium">Vous</span>}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-dark-muted"><span>{entry.totalQuizzes} quiz passes</span><span>•</span><span>{entry.passedQuizzes} reussis</span></div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-2xl font-black ${entry.avgPercentage >= 80 ? 'text-green-400' : entry.avgPercentage >= 60 ? 'text-accent-blue' : 'text-accent-orange'}`}>{entry.avgPercentage}%</p>
                  <div className="w-24 h-1.5 bg-dark-border rounded-full mt-1 overflow-hidden"><div className={`h-full rounded-full transition-all ${entry.avgPercentage >= 80 ? 'bg-green-500' : entry.avgPercentage >= 60 ? 'bg-accent-blue' : 'bg-accent-orange'}`} style={{ width: `${entry.avgPercentage}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
