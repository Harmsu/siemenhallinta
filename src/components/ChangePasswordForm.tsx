import { useState } from 'react';
import { api } from '../api/client';
import './ChangePasswordForm.css';

interface ChangePasswordFormProps {
  onClose: () => void;
}

const MIN_PASSWORD_LENGTH = 8;

export function ChangePasswordForm({ onClose }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Uuden salasanan pitää olla vähintään ${MIN_PASSWORD_LENGTH} merkkiä`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Uudet salasanat eivät täsmää');
      return;
    }

    setSubmitting(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      alert('Salasana vaihdettu');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Salasanan vaihto epäonnistui');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="change-password-overlay">
      <form className="change-password-form" onSubmit={handleSubmit}>
        <h2>Vaihda salasana</h2>

        <div className="form-group">
          <label htmlFor="currentPassword">Nykyinen salasana</label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">Uusi salasana</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Uusi salasana uudestaan</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </div>

        {error && <p className="change-password-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Peruuta
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Vaihdetaan...' : 'Vaihda salasana'}
          </button>
        </div>
      </form>
    </div>
  );
}
