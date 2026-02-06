import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Login } from './components/Login';
import { MainApp } from './components/MainApp';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Tarkista kirjautumistila
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Näytä lataus kun tarkistetaan kirjautumista
  if (authLoading) {
    return (
      <div className="app">
        <div className="loading">Ladataan...</div>
      </div>
    );
  }

  // Näytä kirjautumissivu jos ei kirjautunut
  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  // Näytä pääsovellus kun kirjautunut
  return <MainApp onLogout={handleLogout} />;
}

export default App;
