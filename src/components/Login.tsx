import { useState } from 'react';
import './Login.css';

interface LoginProps {
  onSignIn: (email: string, password: string) => Promise<void>;
}

export function Login({ onSignIn }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSignIn(email, password);
    } catch {
      setError('Virheellinen sähköposti tai salasana');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Harmsun Puutarhapäiväkirja</h1>
        <p className="login-subtitle">Kirjaudu sisään</p>

        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Sähköposti</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Salasana</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? 'Kirjaudutaan...' : 'Kirjaudu'}
        </button>
      </form>
    </div>
  );
}
