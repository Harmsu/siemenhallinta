import { useAuth } from './hooks/useAuth';
import { Login } from './components/Login';
import { MainApp } from './components/MainApp';
import './App.css';

function App() {
  const { user, loading, signIn, signOut } = useAuth();

  // Näytä lataus kun tarkistetaan kirjautumista
  if (loading) {
    return (
      <div className="app">
        <div className="loading">Ladataan...</div>
      </div>
    );
  }

  // Näytä kirjautumissivu jos ei kirjautunut
  if (!user) {
    return <Login onSignIn={signIn} />;
  }

  // Näytä pääsovellus kun kirjautunut
  return <MainApp onLogout={signOut} />;
}

export default App;
