import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
    MessageCircle, 
    Send, 
    ArrowLeft,
    Users,
    Trophy
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AVATARS = {
    owl_baby: "🐣", owl_sleepy: "😴", owl_happy: "😊", owl_cool: "😎",
    owl_basic: "🦉", owl_glasses: "🤓", owl_book: "📚", owl_smart: "🧠",
    owl_studious: "✏️", owl_graduate: "🎓", owl_professor: "👨‍🏫",
    owl_scientist: "🔬", owl_astronaut: "🚀", owl_soldier: "🎖️",
    owl_king: "👑", owl_diamond: "💎", owl_golden: "🏆"
};

export default function Chat() {
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollRef = useRef(null);

    useEffect(() => {
        fetchFriends();
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    useEffect(() => {
        if (selectedFriend) {
            fetchMessages(selectedFriend.id);
            // Poll for new messages every 2 seconds for near real-time
            pollRef.current = setInterval(() => fetchMessages(selectedFriend.id), 2000);
            return () => clearInterval(pollRef.current);
        }
    }, [selectedFriend]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchFriends = async () => {
        try {
            const response = await axios.get(`${API}/friends`);
            setFriends(response.data);
        } catch (error) {
            console.error('Failed to fetch friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (friendId) => {
        try {
            const response = await axios.get(`${API}/messages/${friendId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedFriend) return;

        setSending(true);
        try {
            const response = await axios.post(`${API}/messages`, {
                to_user_id: selectedFriend.id,
                content: newMessage.trim()
            });
            setMessages([...messages, response.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fadeIn h-[calc(100vh-8rem)]" data-testid="chat-page">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                        <MessageCircle className="w-8 h-8 text-blue-400" />
                        Chat
                    </h1>
                    <p className="text-blue-400 mt-1">Mensajería con tus amigos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100%-5rem)]">
                {/* Friends list */}
                <Card className={`glass-card border-blue-500/20 overflow-hidden ${selectedFriend ? 'hidden lg:block' : ''}`}>
                    <CardHeader className="py-3 px-4 border-b border-white/10">
                        <CardTitle className="text-sm font-heading flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            Contactos ({friends.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto max-h-[calc(100%-3.5rem)]">
                        {friends.length === 0 ? (
                            <div className="p-6 text-center">
                                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground text-sm">Agrega amigos para chatear</p>
                            </div>
                        ) : (
                            friends.map((friend) => (
                                <button
                                    key={friend.id}
                                    onClick={() => setSelectedFriend(friend)}
                                    className={`w-full flex items-center gap-3 p-4 transition-colors text-left ${
                                        selectedFriend?.id === friend.id
                                            ? 'bg-blue-500/20 border-l-2 border-blue-500'
                                            : 'hover:bg-white/5 border-l-2 border-transparent'
                                    }`}
                                    data-testid={`chat-friend-${friend.id}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg flex-shrink-0">
                                        {friend.current_avatar ? AVATARS[friend.current_avatar] : friend.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">{friend.name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Trophy className="w-3 h-3 text-yellow-400" />
                                            {friend.points} pts • {friend.rank?.name}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Chat area */}
                <Card className={`glass-card border-blue-500/20 lg:col-span-2 flex flex-col overflow-hidden ${!selectedFriend ? 'hidden lg:flex' : 'flex'}`}>
                    {selectedFriend ? (
                        <>
                            {/* Chat header */}
                            <div className="flex items-center gap-3 p-4 border-b border-white/10">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="lg:hidden"
                                    onClick={() => setSelectedFriend(null)}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg">
                                    {selectedFriend.current_avatar ? AVATARS[selectedFriend.current_avatar] : selectedFriend.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{selectedFriend.name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedFriend.rank?.name}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground">No hay mensajes aún</p>
                                        <p className="text-xs text-muted-foreground mt-1">Envía el primer mensaje</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg, idx) => {
                                            const isOwn = msg.from_user_id === user?.id;
                                            const showDate = idx === 0 || formatDate(msg.created_at) !== formatDate(messages[idx - 1].created_at);
                                            return (
                                                <div key={msg.id}>
                                                    {showDate && (
                                                        <div className="text-center my-3">
                                                            <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                                                {formatDate(msg.created_at)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                                                            isOwn 
                                                                ? 'bg-blue-500 text-white rounded-br-sm' 
                                                                : 'bg-muted/50 text-foreground rounded-bl-sm'
                                                        }`}>
                                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                                            <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/60' : 'text-muted-foreground'}`}>
                                                                {formatTime(msg.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="bg-black/20 border-white/10 flex-1"
                                    data-testid="chat-input"
                                />
                                <Button 
                                    type="submit" 
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-blue-500 hover:bg-blue-600"
                                    data-testid="chat-send-btn"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Selecciona un amigo para chatear</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
