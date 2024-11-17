import React from 'react';

const Auth = ({ onAuth, onAdmin }) => {
    const [isLogin, setIsLogin] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [verificationCode, setVerificationCode] = React.useState('');
    const [showVerification, setShowVerification] = React.useState(false);
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const API_URL = 'https://yuya-ai.onrender.com/api'; // URL de ton backend

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let response;
            let data;

            if (isLogin) {
                // Connexion
                if (email === 'a@admin' && password === 'adminn') {
                    onAdmin(); // Appelle une fonction spéciale pour les admins
                    return;
                }

                response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password }),
                });

                data = await response.json();

                if (response.ok) {
                    onAuth(email); // Redirige ou met à jour l'état après connexion
                } else {
                    setError(data.error || 'Erreur de connexion');
                }
            } else {
                if (!showVerification) {
                    // Inscription
                    response = await fetch(`${API_URL}/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ email, password }),
                    });

                    data = await response.json();

                    if (response.ok) {
                        setShowVerification(true);
                        alert('Un code de vérification a été envoyé à votre email.');
                        if (data.test_code) {
                            console.log(`Code de test: ${data.test_code}`);
                        }
                    } else {
                        setError(data.error || 'Erreur d\'inscription');
                    }
                } else {
                    // Vérification du code
                    response = await fetch(`${API_URL}/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ email, code: verificationCode }),
                    });

                    data = await response.json();

                    if (response.ok) {
                        setIsLogin(true); // Passe en mode connexion
                        setShowVerification(false);
                        alert('Compte vérifié avec succès ! Vous pouvez maintenant vous connecter.');
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
        <div className="auth-container">
            <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                />

                {!showVerification && (
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        className="input"
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
                        placeholder="Code de vérification"
                        className="input"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        disabled={loading}
                        required
                        pattern="[0-9]*"
                        minLength="6"
                        maxLength="6"
                    />
                )}

                <button
                    type="submit"
                    className="button"
                    disabled={loading}
                >
                    {loading ? 'Chargement...' : (
                        isLogin ? 'Se connecter' : (
                            showVerification ? 'Vérifier' : 'S\'inscrire'
                        )
                    )}
                </button>
            </form>

            <button
                className="button secondary"
                onClick={() => {
                    setIsLogin(!isLogin);
                    setShowVerification(false);
                    setError('');
                }}
                disabled={loading}
            >
                {isLogin ? 'Créer un compte' : 'Déjà inscrit ?'}
            </button>
        </div>
    );
};

export default Auth;
