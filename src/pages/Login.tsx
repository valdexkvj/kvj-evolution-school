import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      const storedUser = localStorage.getItem('elearning_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      } else navigate('/dashboard');
    } catch (err: any) { setError(err.message || 'Erreur de connexion'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-dark-card rounded-2xl shadow-xl shadow-accent-orange/5 border border-dark-border p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-accent-orange to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Connexion</h1>
            <p className="text-dark-muted text-sm mt-1">Accedez a votre espace d'apprentissage</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent outline-none text-white transition-all" placeholder="vous@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text mb-1">Mot de passe</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent outline-none text-white transition-all" placeholder="Votre mot de passe" required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-accent-orange to-accent-orange-dark text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-md shadow-accent-orange/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <p className="text-center text-sm text-dark-muted mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-accent-orange font-medium hover:underline">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
