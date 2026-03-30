import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Target, 
    Trophy,
    TrendingUp,
    Activity,
    Coffee,
    Sprout,
    BookOpen,
    Briefcase,
    Shield,
    BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RANKS = [
    { name: 'Procrastinador', min: 0, max: 299, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', icon: Coffee },
    { name: 'Freshman', min: 300, max: 499, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: Sprout },
    { name: 'Sophomore', min: 500, max: 799, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: BookOpen },
    { name: 'Business Man', min: 800, max: 1199, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: Briefcase },
    { name: 'Soldier', min: 1200, max: Infinity, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: Shield },
];

const getCurrentRank = (points) => {
    return RANKS.find(r => points >= r.min && points <= r.max) || RANKS[0];
};

const getNextRank = (points) => {
    const currentIndex = RANKS.findIndex(r => points >= r.min && points <= r.max);
    return RANKS[currentIndex + 1] || null;
};

export default function Dashboard() {
    const { user, updateUserPoints } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, activitiesRes, historyRes] = await Promise.all([
                axios.get(`${API}/stats`),
                axios.get(`${API}/activities?limit=10`),
                axios.get(`${API}/stats/history`)
            ]);
            setStats(statsRes.data);
            setRecentActivities(activitiesRes.data);
            
            // Format chart data
            const history = historyRes.data.history || [];
            const formattedData = history.map(item => ({
                ...item,
                dateLabel: formatChartDate(item.date)
            }));
            setChartData(formattedData);
            
            // Update user points in context
            if (statsRes.data.points !== user?.points) {
                updateUserPoints(statsRes.data.points, statsRes.data.rank, statsRes.data.redeemable_points);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            // Try to load from localStorage for offline mode
            const cachedStats = localStorage.getItem('stats');
            const cachedActivities = localStorage.getItem('activities');
            if (cachedStats) setStats(JSON.parse(cachedStats));
            if (cachedActivities) setRecentActivities(JSON.parse(cachedActivities));
        } finally {
            setLoading(false);
        }
    };

    const formatChartDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleString('es', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    // Cache data for offline use
    useEffect(() => {
        if (stats) localStorage.setItem('stats', JSON.stringify(stats));
        if (recentActivities.length) localStorage.setItem('activities', JSON.stringify(recentActivities));
    }, [stats, recentActivities]);

    const currentRank = getCurrentRank(stats?.points || 0);
    const nextRank = getNextRank(stats?.points || 0);
    const progressToNext = nextRank 
        ? ((stats?.points || 0) - currentRank.min) / (nextRank.min - currentRank.min) * 100 
        : 100;

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

    const getActivityIcon = (action) => {
        switch (action) {
            case 'task_completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            case 'task_created': return <Clock className="w-4 h-4 text-primary" />;
            case 'task_deleted': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'plan_created': return <Target className="w-4 h-4 text-purple-400" />;
            default: return <Activity className="w-4 h-4 text-muted-foreground" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn" data-testid="dashboard-page">
            {/* Welcome header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                    ¡Hola, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-emerald-500 dark:text-emerald-400 mt-2">
                    TaskFlow Lite - UNPHU | Tu progreso académico
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card border-white/10" data-testid="stat-completed">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats?.completed_tasks || 0}</p>
                                <p className="text-xs text-muted-foreground">Completadas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-white/10" data-testid="stat-pending">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats?.pending_tasks || 0}</p>
                                <p className="text-xs text-muted-foreground">Pendientes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-white/10" data-testid="stat-incomplete">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats?.incomplete_tasks || 0}</p>
                                <p className="text-xs text-muted-foreground">No finalizadas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-white/10" data-testid="stat-plans">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <Target className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats?.total_plans || 0}</p>
                                <p className="text-xs text-muted-foreground">Planes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Rank progress */}
                <Card className="glass-card border-emerald-500/20" data-testid="rank-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg font-heading">
                            <Trophy className="w-5 h-5 text-emerald-400" />
                            Tu Rango
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-full ${currentRank.bg} ${currentRank.border} border`}>
                            {currentRank.icon && <currentRank.icon className={`w-6 h-6 ${currentRank.color}`} />}
                            <span className={`text-lg font-bold ${currentRank.color}`}>{currentRank.name}</span>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{stats?.points || 0} puntos</span>
                                {nextRank && (
                                    <span className="text-muted-foreground">
                                        {nextRank.min - (stats?.points || 0)} pts para {nextRank.name}
                                    </span>
                                )}
                            </div>
                            <Progress value={progressToNext} className="h-2" />
                        </div>

                        <div className="grid grid-cols-5 gap-2 pt-2">
                            {RANKS.map((rank, i) => {
                                const RankIcon = rank.icon;
                                return (
                                    <div 
                                        key={rank.name}
                                        className={`text-center p-2 rounded-lg ${(stats?.points || 0) >= rank.min ? rank.bg : 'bg-muted/30'}`}
                                    >
                                        <div className="flex justify-center mb-1">
                                            <RankIcon className={`w-4 h-4 ${(stats?.points || 0) >= rank.min ? rank.color : 'text-muted-foreground'}`} />
                                        </div>
                                        <p className={`text-xs font-medium truncate ${(stats?.points || 0) >= rank.min ? rank.color : 'text-muted-foreground'}`}>
                                            {rank.name.split(' ')[0]}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">{rank.min}+</p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent activities */}
                <Card className="glass-card border-emerald-500/20" data-testid="activities-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg font-heading">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Actividad Reciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentActivities.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No hay actividad reciente
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                                {recentActivities.map((activity, index) => (
                                    <div 
                                        key={activity.id}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        {getActivityIcon(activity.action)}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-foreground truncate">{activity.description}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</p>
                                        </div>
                                        {activity.points_earned > 0 && (
                                            <span className="text-xs font-bold text-emerald-400">+{activity.points_earned}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Performance Chart */}
            <Card className="glass-card border-emerald-500/20" data-testid="performance-chart">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-heading">
                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                        Gráfico de Desempeño
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {chartData.length <= 1 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                Completa tareas para ver tu progreso aquí
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                El gráfico mostrará tu evolución con el tiempo
                            </p>
                        </div>
                    ) : (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis 
                                        dataKey="dateLabel" 
                                        stroke="#94A3B8" 
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                    />
                                    <YAxis 
                                        stroke="#94A3B8" 
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(10, 26, 10, 0.95)', 
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                        }}
                                        labelStyle={{ color: '#10B981', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#F8FAFC' }}
                                        formatter={(value, name) => {
                                            if (name === 'points') return [`${value} pts`, 'Puntos Rango'];
                                            if (name === 'tasks_completed') return [value, 'Tareas Completadas'];
                                            return [value, name];
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="points" 
                                        stroke="#10B981" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorPoints)" 
                                        name="points"
                                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="tasks_completed" 
                                        stroke="#FBBF24" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorTasks)" 
                                        name="tasks_completed"
                                        dot={{ fill: '#FBBF24', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#FBBF24', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-xs text-muted-foreground">Puntos de Rango</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <span className="text-xs text-muted-foreground">Tareas Completadas</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
