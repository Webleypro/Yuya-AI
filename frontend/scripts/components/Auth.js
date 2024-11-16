const Auth = ({ onAuth }) => {
    const [isLogin, setIsLogin] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [verificationCode, setVerificationCode] = React.useState('');
    const [showVerification, setShowVerification] = React.useState(false);
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const API_URL = 'https://yuya-ai.onrender.com/api'; // L'URL de ton serveur

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let response;
            let data;
            
            if (isLogin) {
                response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                });
                
                data = await response.json();
                
                if (response.ok) {
                    onAuth(email);
                } else {
                    setError(data.error || 'Erreur de connexion');
                }
            } else {
                if (!showVerification) {
                    response = await fetch(`${API_URL}/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ email, password })
                    });

                    data = await response.json();

                    if (response.ok) {
                        setShowVerification(true);
                        // Si un code de test est fourni (mode développement), on l'affiche
                        if (data.test_code) {
                            alert(`Code de test: ${data.test_code}`);
                        }
                    } else {
                        setError(data.error || 'Erreur d\'inscription');
                    }
                } else {
                    response = await fetch(`${API_URL}/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ email, code: verificationCode })
                    });

                    data = await response.json();

                    if (response.ok) {
                        setIsLogin(true);
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
