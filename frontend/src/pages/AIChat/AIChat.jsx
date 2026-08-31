import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../shared/ui/BackButton/BackButton';
import { sendChatMessage } from '../../api/chat';
import './AIChat.css';

function buildGreeting(user) {
  const specialRoles = [];
  if (user?.is_architect) specialRoles.push('Architect');
  if (user?.inquisitor) specialRoles.push('Inquisitor');

  const alias = user?.alias || 'Unknown user';
  const status = user?.status || 'unknown';
  const roles = specialRoles.length ? specialRoles.join(', ') : 'None';

  return `Hello, ${alias}! Status: ${status}. Special roles: ${roles}. How can I help you?`;
}

export default function AIChat({ user }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: 'agent', text: buildGreeting(user) },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages
        .filter(message => message.sender === 'user' || message.sender === 'agent')
        .map(message => ({ role: message.sender, text: message.text }));
      const data = await sendChatMessage(userMessage, history);
      if (data.reply) {
        setMessages(prev => [...prev, { sender: 'agent', text: data.reply }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'system', text: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <header className="admin-header">
        <div className="admin-header-row">
          <BackButton onClick={() => navigate(-1)} style={{ margin: '60px' }} />
          <h1 className="admin-title">Ai Assistant</h1>
        </div>
      </header>

      <div className="chat-container">
        <div className="chat-window">
          {messages.map((msg, index) => (
             <div key={index} className={`message-bubble ${msg.sender}`}>
               {msg.text}
             </div>
          ))}
          {isLoading && <div className="message-bubble system">The assistant is thinking...</div>}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-row">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="chat-submit-btn" onClick={handleSend} disabled={isLoading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
