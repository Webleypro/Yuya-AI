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