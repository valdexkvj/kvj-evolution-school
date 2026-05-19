import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NIVEAUX } from '@/utils/constants';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', niveau: 'L1' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caracteres'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, niveau: form.niveau });
      navigate('/dashboard');
    } catch (err: any) { setError(err.message || 'Erreur lors de l\'inscription'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-dark-card rounded-2xl shadow-xl shadow-accent-blue/5 border border-dark-border p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-accent-blue to-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Inscription</h1>
            <p className="text-dark-muted text-sm mt-1">Creez votre compte pour commencer</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-dark-text mb-1">Nom complet</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none text-white" placeholder="Jean Dupont" required /></div>
            <div><label className="block text-sm font-medium text-dark-text mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none text-white" placeholder="vous@email.com" required /></div>
            <div><label className="block text-sm font-medium text-dark-text mb-1">Niveau d'etude</label><select value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none text-white">{NIVEAUX.map((n) => (<option key={n} value={n}>{n}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-dark-text mb-1">Mot de passe</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none text-white" placeholder="Minimum 6 caracteres" required /></div>
            <div><label className="block text-sm font-medium text-dark-text mb-1">Confirmer le mot de passe</label><input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none text-white" placeholder="Retapez votre mot de passe" required /></div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-accent-blue to-accent-blue-dark text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-md shadow-accent-blue/20 disabled:opacity-50">{loading ? 'Inscription...' : 'Creer mon compte'}</button>
          </form>
          <p className="text-center text-sm text-dark-muted mt-6">Deja un compte ?{' '}<Link to="/login" className="text-accent-blue font-medium hover:underline">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
}
