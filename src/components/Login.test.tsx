import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from './Login';
import { supabase } from '../lib/supabase';

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

describe('Login', () => {
  it('näyttää kirjautumislomakkeen', () => {
    render(<Login onLogin={vi.fn()} />);
    expect(screen.getByText('Harmsun siemenet')).toBeInTheDocument();
    expect(screen.getByText('Kirjaudu sisään')).toBeInTheDocument();
    expect(screen.getByLabelText('Sähköposti')).toBeInTheDocument();
    expect(screen.getByLabelText('Salasana')).toBeInTheDocument();
  });

  it('näyttää kirjaudu-napin', () => {
    render(<Login onLogin={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Kirjaudu' })).toBeInTheDocument();
  });

  it('kutsuu supabase.auth.signInWithPassword lomakkeen lähetyksessä', async () => {
    const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValue({ data: { user: {}, session: {} }, error: null } as any);

    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText('Sähköposti'), {
      target: { value: 'test@test.fi' },
    });
    fireEvent.change(screen.getByLabelText('Salasana'), {
      target: { value: 'salasana123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kirjaudu' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@test.fi',
        password: 'salasana123',
      });
    });
  });

  it('kutsuu onLogin onnistuneen kirjautumisen jälkeen', async () => {
    const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValue({ data: { user: {}, session: {} }, error: null } as any);

    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText('Sähköposti'), {
      target: { value: 'test@test.fi' },
    });
    fireEvent.change(screen.getByLabelText('Salasana'), {
      target: { value: 'salasana123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kirjaudu' }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalled();
    });
  });

  it('näyttää virheen virheellisillä tunnuksilla', async () => {
    const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'Invalid credentials' } } as any);

    render(<Login onLogin={vi.fn()} />);

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
    const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
    mockSignIn.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Login onLogin={vi.fn()} />);

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
