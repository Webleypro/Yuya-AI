// app.js
const App = () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [userEmail, setUserEmail] = React.useState('');
    
    React.useEffect(() => {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            setIsAuthenticated(true);
            setUserEmail(savedEmail);
        }
    }, []);

    return (
        <div className="container">
            <div className="grid-background" />
            {!isAuthenticated ? (
                <Auth onAuth={(email) => {
                    setIsAuthenticated(true);
                    setUserEmail(email);
                    localStorage.setItem('userEmail', email);
                }} />
            ) : (
                <Chat userEmail={userEmail} />
            )}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));

// components/Auth.js
const Auth = ({ onAuth }) => {
    const [isLogin, setIsLogin] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [verificationCode, setVerificationCode] = React.useState('');
    const [showVerification, setShowVerification] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isLogin) {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
                onAuth(email);
            } else {
                alert('Erreur de connexion');
            }
        } else {
            if (!showVerification) {
                const response = await fetch('http://localhost:5000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                if (response.ok) {
                    setShowVerification(true);
                } else {
                    alert('Erreur d\'inscription');
                }
            } else {
                const response = await fetch('http://localhost:5000/api/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, code: verificationCode })
                });
                
                if (response.ok) {
                    setIsLogin(true);
                    setShowVerification(false);
                } else {
                    alert('Code de vérification incorrect');
                }
            }
        }
    };

    return (
        <div className="auth-container">
            <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {!showVerification && (
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                )}
                {showVerification && (
                    <input
                        type="text"
                        placeholder="Code de vérification"
                        className="input"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                    />
                )}
                <button type="submit" className="button">
                    {isLogin ? 'Se connecter' : (showVerification ? 'Vérifier' : 'S\'inscrire')}
                </button>
            </form>
            <button
                className="button"
                onClick={() => {
                    setIsLogin(!isLogin);
                    setShowVerification(false);
                }}
            >
                {isLogin ? 'Créer un compte' : 'Déjà inscrit ?'}
            </button>
        </div>
    );
};

// components/Chat.js
const Chat = ({ userEmail }) => {
    const [messages, setMessages] = React.useState([]);
    const [input, setInput] = React.useState('');
    const [showSidebar, setShowSidebar] = React.useState(true);
    const [typing, setTyping] = React.useState(false);
    
    React.useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const response = await fetch(`http://localhost:5000/api/history?email=${userEmail}`);
        if (response.ok) {
            const history = await response.json();
            setMessages(history);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            user_message: input,
            ai_response: null
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setTyping(true);

        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: input,
                email: userEmail
            })
        });

        if (response.ok) {
            const data = await response.json();
            setTyping(false);
            setMessages(prev => prev.map(msg => 
                msg === userMessage 
                    ? { ...msg, ai_response: data.response }
                    : msg
            ));
        }
    };

    return (
        <div className="chat-container">
            <div className={`sidebar ${showSidebar ? '' : 'hidden'}`}>
                <button className="button" onClick={() => setShowSidebar(!showSidebar)}>
                    {showSidebar ? '←' : '→'}
                </button>
                <h3>Historique</h3>
                <div className="history-list">
                    {messages.map((msg, idx) => (
                        <div key={idx} className="history-item" onClick={() => {
                            setInput(msg.user_message);
                        }}>
                            {msg.user_message.substring(0, 30)}...
                        </div>
                    ))}
                </div>
            </div>
            <div className="chat-main">
                <div className="chat-messages">
                    {messages.map((msg, idx) => (
                        <React.Fragment key={idx}>
                            <div className="message user-message">
                                {msg.user_message}
                            </div>
                            {msg.ai_response && (
                                <div className="message ai-message">
                                    <div className="typing-effect" dangerouslySetInnerHTML={{
                                        __html: msg.ai_response
                                    }} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                    {typing && (
                        <div className="message ai-message">
                            Réflexion en cours...
                        </div>
                    )}
                </div>
                <div className="chat-input">
                    <input
                        type="text"
                        className="input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Posez votre question..."
                    />
                    <button className="button" onClick={handleSend}>
                        Envoyer
                    </button>
                </div>
            </div>
        </div>
    );
};

// components/UI.js
const Button = ({ children, ...props }) => (
    <button className="button" {...props}>
        {children}
    </button>
);

const Input = ({ ...props }) => (
    <input className="input" {...props} />
);