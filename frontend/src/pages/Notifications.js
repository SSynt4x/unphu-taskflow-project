import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
    Bell, 
    BellOff,
    MessageCircle,
    Users,
    UsersRound,
    CheckCircle2,
    Info,
    CheckCheck
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NOTIFICATION_ICONS = {
    message: MessageCircle,
    friend: Users,
    group: UsersRound,
    group_task: CheckCircle2,
    info: Info,
};

const NOTIFICATION_COLORS = {
    message: 'text-blue-400',
    friend: 'text-purple-400',
    group: 'text-emerald-400',
    group_task: 'text-yellow-400',
    info: 'text-gray-400',
};

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${API}/notifications`);
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`${API}/notifications/${id}/read`);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.put(`${API}/notifications/read-all`);
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast.success('Todas las notificaciones marcadas como leídas');
        } catch (error) {
            toast.error('Error al marcar notificaciones');
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes}m`;
        if (hours < 24) return `Hace ${hours}h`;
        if (days < 7) return `Hace ${days}d`;
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="notifications-page">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                        <Bell className="w-8 h-8 text-emerald-400" />
                        Notificaciones
                    </h1>
                    <p className="text-emerald-500 dark:text-emerald-400 mt-1">
                        {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button 
                        onClick={markAllRead}
                        className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                        data-testid="mark-all-read-btn"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Marcar todas como leídas
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card className="glass-card border-emerald-500/20">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                            <BellOff className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-muted-foreground text-center">No tienes notificaciones</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => {
                        const Icon = NOTIFICATION_ICONS[notification.type] || Info;
                        const colorClass = NOTIFICATION_COLORS[notification.type] || 'text-gray-400';
                        
                        return (
                            <Card 
                                key={notification.id}
                                className={`glass-card transition-colors cursor-pointer ${
                                    notification.read ? 'border-white/5 opacity-60' : 'border-emerald-500/20'
                                }`}
                                onClick={() => !notification.read && markAsRead(notification.id)}
                                data-testid={`notification-${notification.id}`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            notification.read ? 'bg-muted/30' : 'bg-emerald-500/20'
                                        }`}>
                                            <Icon className={`w-5 h-5 ${notification.read ? 'text-muted-foreground' : colorClass}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{formatDate(notification.created_at)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
