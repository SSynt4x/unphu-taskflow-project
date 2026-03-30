import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
    Lock, 
    Unlock, 
    Check,
    Sparkles,
    Coins
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AVATAR_EMOJIS = {
    owl_baby: "🐣", owl_sleepy: "😴", owl_happy: "😊", owl_cool: "😎",
    owl_basic: "🦉", owl_glasses: "🤓", owl_book: "📚", owl_smart: "🧠",
    owl_studious: "✏️", owl_graduate: "🎓", owl_professor: "👨‍🏫",
    owl_scientist: "🔬", owl_astronaut: "🚀", owl_soldier: "🎖️",
    owl_king: "👑", owl_diamond: "💎", owl_golden: "🏆"
};

const CATEGORY_COLORS = {
    basic: { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-400' },
    intermediate: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
    advanced: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
    legendary: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
};

const CATEGORY_NAMES = {
    basic: 'Básico',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    legendary: 'Legendario'
};

export default function Avatars() {
    const { user } = useAuth();
    const [avatars, setAvatars] = useState([]);
    const [redeemablePoints, setRedeemablePoints] = useState(0);
    const [currentAvatar, setCurrentAvatar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAvatars();
    }, []);

    const fetchAvatars = async () => {
        try {
            const response = await axios.get(`${API}/avatars`);
            setAvatars(response.data.avatars);
            setRedeemablePoints(response.data.redeemable_points);
            setCurrentAvatar(response.data.current_avatar);
        } catch (error) {
            console.error('Failed to fetch avatars:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async (avatarId) => {
        try {
            const response = await axios.post(`${API}/avatars/${avatarId}/unlock`);
            toast.success(`¡${response.data.avatar.name} desbloqueado!`);
            fetchAvatars();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al desbloquear');
        }
    };

    const handleSelect = async (avatarId) => {
        try {
            await axios.post(`${API}/avatars/${avatarId}/select`);
            setCurrentAvatar(avatarId);
            toast.success('¡Avatar seleccionado! Tu foto de perfil ha sido actualizada.');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al seleccionar');
        }
    };

    const groupedAvatars = avatars.reduce((acc, avatar) => {
        const category = avatar.category || 'basic';
        if (!acc[category]) acc[category] = [];
        acc[category].push(avatar);
        return acc;
    }, {});

    const filteredAvatars = filter === 'all' 
        ? avatars 
        : avatars.filter(a => a.category === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="avatars-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                        Avatares
                    </h1>
                    <p className="text-yellow-400 mt-1">Desbloquea y personaliza tu foto de perfil</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">{redeemablePoints.toLocaleString()} pts disponibles</span>
                </div>
            </div>

            {/* Current Avatar */}
            <Card className="glass-card border-emerald-500/20">
                <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-5xl border-4 border-emerald-500">
                            {currentAvatar ? AVATAR_EMOJIS[currentAvatar] || '🦉' : user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                            <p className="text-muted-foreground">{user?.email}</p>
                            <p className="text-emerald-400 mt-1">
                                Avatar actual: {currentAvatar ? avatars.find(a => a.id === currentAvatar)?.name : 'Sin avatar'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'bg-emerald-500' : ''}
                >
                    Todos ({avatars.length})
                </Button>
                {Object.keys(CATEGORY_NAMES).map((cat) => (
                    <Button
                        key={cat}
                        variant={filter === cat ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(cat)}
                        className={filter === cat ? CATEGORY_COLORS[cat].bg.replace('/20', '') : ''}
                    >
                        {CATEGORY_NAMES[cat]} ({groupedAvatars[cat]?.length || 0})
                    </Button>
                ))}
            </div>

            {/* Avatars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredAvatars.map((avatar) => {
                    const isUnlocked = avatar.unlocked;
                    const isSelected = currentAvatar === avatar.id;
                    const canAfford = redeemablePoints >= avatar.price;
                    const categoryStyle = CATEGORY_COLORS[avatar.category] || CATEGORY_COLORS.basic;
                    
                    return (
                        <Card 
                            key={avatar.id}
                            className={`glass-card overflow-hidden transition-all duration-300 ${
                                isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-105' : 
                                isUnlocked ? 'border-emerald-500/30' : 'border-white/10'
                            }`}
                            data-testid={`avatar-card-${avatar.id}`}
                        >
                            <CardContent className="p-3">
                                {/* Category Badge */}
                                <div className={`text-[10px] px-2 py-0.5 rounded-full ${categoryStyle.bg} ${categoryStyle.text} text-center mb-2`}>
                                    {CATEGORY_NAMES[avatar.category]}
                                </div>

                                {/* Avatar */}
                                <div className={`relative aspect-square rounded-xl ${categoryStyle.border} border-2 flex items-center justify-center mb-2 ${
                                    !isUnlocked ? 'opacity-50 grayscale' : ''
                                }`}>
                                    <span className="text-4xl">
                                        {AVATAR_EMOJIS[avatar.id] || avatar.image}
                                    </span>
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                                            <Lock className="w-6 h-6 text-white/80" />
                                        </div>
                                    )}
                                    {isSelected && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Info */}
                                <h3 className="font-medium text-foreground text-xs text-center truncate">{avatar.name}</h3>
                                <p className="text-center text-yellow-400 font-bold text-xs mt-1">
                                    {avatar.price.toLocaleString()} pts
                                </p>
                                
                                {/* Action */}
                                <div className="mt-2">
                                    {isUnlocked ? (
                                        <Button
                                            size="sm"
                                            className={`w-full text-xs h-7 ${isSelected ? 'bg-emerald-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                            onClick={() => handleSelect(avatar.id)}
                                            disabled={isSelected}
                                        >
                                            {isSelected ? '✓ Usando' : 'Usar'}
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className={`w-full text-xs h-7 ${canAfford ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-gray-600'}`}
                                            onClick={() => handleUnlock(avatar.id)}
                                            disabled={!canAfford}
                                        >
                                            {canAfford ? (
                                                <>
                                                    <Unlock className="w-3 h-3 mr-1" />
                                                    Comprar
                                                </>
                                            ) : (
                                                `Faltan ${(avatar.price - redeemablePoints).toLocaleString()}`
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Info */}
            <Card className="glass-card border-yellow-500/20">
                <CardContent className="p-6">
                    <h3 className="font-bold text-yellow-400 mb-2">¿Cómo obtener más puntos?</h3>
                    <ul className="text-muted-foreground text-sm space-y-1">
                        <li>• Completa tareas: <span className="text-emerald-400">+5 puntos</span> por tarea</li>
                        <li>• Completa asignaciones: <span className="text-emerald-400">+5-25 puntos</span> según dificultad</li>
                        <li>• Compra puntos en la <span className="text-yellow-400">Tienda de Puntos</span></li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
