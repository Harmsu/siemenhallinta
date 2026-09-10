import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from './Login';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Login', () => {
  it('näyttää kirjautumislomakkeen', () => {
    render(<Login onSignIn={vi.fn()} />);
    expect(screen.getByText('Harmsun siemenet')).toBeInTheDocument();
    expect(screen.getByText('Kirjaudu sisään')).toBeInTheDocument();
    expect(screen.getByLabelText('Sähköposti')).toBeInTheDocument();
    expect(screen.getByLabelText('Salasana')).toBeInTheDocument();
  });

  it('näyttää kirjaudu-napin', () => {
    render(<Login onSignIn={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Kirjaudu' })).toBeInTheDocument();
  });

  it('kutsuu onSignIn lomakkeen lähetyksessä', async () => {
    const onSignIn = vi.fn().mockResolvedValue(undefined);
    render(<Login onSignIn={onSignIn} />);

    fireEvent.change(screen.getByLabelText('Sähköposti'), {
      target: { value: 'test@test.fi' },
    });
    fireEvent.change(screen.getByLabelText('Salasana'), {
      target: { value: 'salasana123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kirjaudu' }));

    await waitFor(() => {
      expect(onSignIn).toHaveBeenCalledWith('test@test.fi', 'salasana123');
    });
  });

  it('näyttää virheen virheellisillä tunnuksilla', async () => {
    const onSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    render(<Login onSignIn={onSignIn} />);

    fireEvent.change(screen.getByLabelText('Sähköposti'), {
      target: { value: 'test@test.fi' },
    });
    fireEvent.change(screen.getByLabelText('Salasana'), {
      target: { value: 'vääräsalasana' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kirjaudu' }));

    await waitFor(() => {
      expect(screen.getByText('Virheellinen sähköposti tai salasana')).toBeInTheDocument();
    });
  });

  it('näyttää lataustilaviestin kirjautumisen aikana', async () => {
    const onSignIn = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<Login onSignIn={onSignIn} />);

    fireEvent.change(screen.getByLabelText('Sähköposti'), {
      target: { value: 'test@test.fi' },
    });
    fireEvent.change(screen.getByLabelText('Salasana'), {
      target: { value: 'salasana123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kirjaudu' }));

    await waitFor(() => {
      expect(screen.getByText('Kirjaudutaan...')).toBeInTheDocument();
    });
  });
});
