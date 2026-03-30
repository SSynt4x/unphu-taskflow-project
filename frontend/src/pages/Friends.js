import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
    Users, 
    Search,
    UserPlus,
    Trash2,
    Trophy,
    Mail
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AVATARS = {
    owl_baby: "🐣", owl_sleepy: "😴", owl_happy: "😊", owl_cool: "😎",
    owl_basic: "🦉", owl_glasses: "🤓", owl_book: "📚", owl_smart: "🧠",
    owl_studious: "✏️", owl_graduate: "🎓", owl_professor: "👨‍🏫",
    owl_scientist: "🔬", owl_astronaut: "🚀", owl_soldier: "🎖️",
    owl_king: "👑", owl_diamond: "💎", owl_golden: "🏆"
};

export default function Friends() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchFriends();
    }, []);

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

    const handleAddFriend = async (e) => {
        e.preventDefault();
        if (!searchEmail || !searchEmail.endsWith('@unphu.edu.do')) {
            toast.error('Ingresa un correo institucional válido (@unphu.edu.do)');
            return;
        }
        // Validate format: name@unphu.edu.do
        const localPart = searchEmail.split('@')[0];
        if (!localPart || localPart.length < 1) {
            toast.error('El correo debe tener formato: nombre@unphu.edu.do');
            return;
        }

        setAdding(true);
        try {
            const response = await axios.post(`${API}/friends/add`, { friend_email: searchEmail });
            setFriends([response.data.friend, ...friends]);
            setSearchEmail('');
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al agregar amigo');
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveFriend = async (friendId) => {
        try {
            await axios.delete(`${API}/friends/${friendId}`);
            setFriends(friends.filter(f => f.id !== friendId));
            toast.success('Amigo eliminado');
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="friends-page">
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-400" />
                    Mis Amigos
                </h1>
                <p className="text-blue-400 mt-1">Conecta con otros estudiantes UNPHU</p>
            </div>

            {/* Add Friend */}
            <Card className="glass-card border-blue-500/20">
                <CardContent className="p-6">
                    <form onSubmit={handleAddFriend} className="flex gap-3">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                placeholder="Buscar por correo institucional (@unphu.edu.do)"
                                className="pl-10 bg-black/20 border-white/10"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={adding}
                            className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {adding ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <UserPlus className="w-4 h-4" />
                            )}
                            Agregar
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Friends List */}
            {friends.length === 0 ? (
                <Card className="glass-card border-blue-500/20">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-blue-400" />
                        </div>
                        <p className="text-muted-foreground text-center">
                            No tienes amigos agregados aún
                        </p>
                        <p className="text-sm text-muted-foreground text-center mt-1">
                            Busca a tus compañeros por su correo institucional
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map((friend) => (
                        <Card 
                            key={friend.id}
                            className="glass-card border-white/10 hover:border-blue-500/30 transition-colors"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl">
                                        {friend.current_avatar ? AVATARS[friend.current_avatar] || '🦉' : friend.name?.charAt(0).toUpperCase()}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-foreground truncate">{friend.name}</h3>
                                        <p className="text-xs text-muted-foreground truncate">{friend.email}</p>
                                        
                                        <div className="flex items-center gap-2 mt-2">
                                            <Trophy className="w-4 h-4 text-yellow-400" />
                                            <span className="text-sm text-yellow-400 font-bold">{friend.points} pts</span>
                                        </div>
                                        
                                        <div className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                                            friend.rank?.name === 'Soldier' ? 'bg-yellow-500/20 text-yellow-400' :
                                            friend.rank?.name === 'Business Man' ? 'bg-purple-500/20 text-purple-400' :
                                            friend.rank?.name === 'Sophomore' ? 'bg-blue-500/20 text-blue-400' :
                                            friend.rank?.name === 'Freshman' ? 'bg-emerald-500/20 text-emerald-400' :
                                            'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {friend.rank?.name || 'Procrastinador'}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveFriend(friend.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
