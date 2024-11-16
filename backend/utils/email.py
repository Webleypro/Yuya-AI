import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Auth = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://yuya-ai.onrender.com/api';

  const saveUserData = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/save-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      return response.ok;
    } catch (err) {
      console.error('Erreur de sauvegarde:', err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setSuccess('Connexion réussie!');
          await saveUserData({ email, password });
          onAuth(email);
        } else {
          setError(data.error || 'Identifiants incorrects');
        }
      } else {
        if (!showVerification) {
          const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
          });

          const data = await response.json();

          if (response.ok) {
            // Génération d'un code de vérification unique pour l'utilisateur
            const verificationCode = Math.floor(1000 + Math.random() * 9000); // Code à 4 chiffres
            await fetch(`${API_URL}/send-verification-code`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, verificationCode })
            });

            setShowVerification(true);
            setSuccess('Code de vérification envoyé par email!');
          } else {
            setError(data.error || 'Erreur lors de l\'inscription');
          }
        } else {
          // Vérification du code de l'utilisateur
          const response = await fetch(`${API_URL}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ 
              email,
              verificationCode,
              password // On envoie aussi le mot de passe pour la sauvegarde
            })
          });

          const data = await response.json();

          if (response.ok) {
            setSuccess('Compte vérifié avec succès!');
            await saveUserData({ email, password });
            setIsLogin(true);
            setShowVerification(false);
            onAuth(email);
          } else {
            setError(data.error || 'Code de vérification incorrect');
          }
        }
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isLogin ? 'Connexion' : 'Inscription'}
      </h2>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          
          {!showVerification && (
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength="6"
            />
          )}
          
          {showVerification && (
            <input
              type="text"
              placeholder="Code de vérification (4 chiffres)"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length <= 4) setVerificationCode(value);
              }}
              disabled={loading}
              required
              pattern="[0-9]{4}"
              maxLength="4"
            />
          )}
        </div>
        
        <button 
          type="submit" 
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Chargement...' : (
            isLogin ? 'Se connecter' : (
              showVerification ? 'Vérifier le code' : 'S\'inscrire'
            )
          )}
        </button>
      </form>
      
      <button
        className="w-full p-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
        onClick={() => {
          setIsLogin(!isLogin);
          setShowVerification(false);
          setError('');
          setSuccess('');
        }}
        disabled={loading}
      >
        {isLogin ? 'Créer un compte' : 'Déjà inscrit ?'}
      </button>
    </div>
  );
};

export default Auth;
