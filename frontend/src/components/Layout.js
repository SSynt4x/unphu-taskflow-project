import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { 
    LayoutDashboard, 
    CheckSquare, 
    History, 
    Target, 
    LogOut, 
    Menu, 
    X,
    Sun,
    Moon,
    Trophy,
    BookOpen,
    FileText,
    ShoppingCart,
    Users,
    CalendarDays,
    Sparkles,
    Bell,
    MessageCircle,
    UsersRound,
    Swords,
    Trash2
} from 'lucide-react';

const UNPHU_LOGO = "/unphu-logo.png";

const AVATAR_EMOJIS = {
    owl_baby: "🐣", owl_sleepy: "😴", owl_happy: "😊", owl_cool: "😎",
    owl_basic: "🦉", owl_glasses: "🤓", owl_book: "📚", owl_smart: "🧠",
    owl_studious: "✏️", owl_graduate: "🎓", owl_professor: "👨‍🏫",
    owl_scientist: "🔬", owl_astronaut: "🚀", owl_soldier: "🎖️",
    owl_king: "👑", owl_diamond: "💎", owl_golden: "🏆"
};

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tareas', icon: CheckSquare },
    { path: '/assignments', label: 'Asignaciones', icon: FileText },
    { path: '/courses', label: 'Mis Cursos', icon: BookOpen },
    { path: '/calendar', label: 'Calendario', icon: CalendarDays },
    { path: '/history', label: 'Historial', icon: History },
    { path: '/plans', label: 'Planes Futuros', icon: Target },
    { path: '/friends', label: 'Amigos', icon: Users },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/groups', label: 'Grupos', icon: UsersRound },
    { path: '/challenges', label: 'Desafíos', icon: Swords },
    { path: '/notifications', label: 'Notificaciones', icon: Bell },
    { path: '/avatars', label: 'Avatares', icon: Sparkles },
    { path: '/store', label: 'Tienda', icon: ShoppingCart },
    { path: '/trash', label: 'Basurero', icon: Trash2 },
];

const getRankColor = (rankName) => {
    const colors = {
        'Procrastinador': 'text-gray-400',
        'Freshman': 'text-emerald-400',
        'Sophomore': 'text-blue-400',
        'Business Man': 'text-purple-400',
        'Soldier': 'text-yellow-400',
    };
    return colors[rankName] || 'text-gray-400';
};

export const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userAvatar = user?.current_avatar ? AVATAR_EMOJIS[user.current_avatar] : null;

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-72 sidebar border-r border-emerald-500/20
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                overflow-y-auto
            `}>
                <div className="flex flex-col h-full p-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                            <img src={UNPHU_LOGO} alt="TaskFlow Lite" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-heading font-bold text-emerald-400">TaskFlow Lite</span>
                            <span className="text-xs text-emerald-300/70">UNPHU</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden ml-auto"
                            onClick={() => setSidebarOpen(false)}
                            data-testid="close-sidebar-btn"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* User info */}
                    <div className="glass-card rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-2xl border-2 border-emerald-500">
                                {userAvatar || user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <div className="flex items-center gap-1">
                                <Trophy className="w-4 h-4 text-emerald-400" />
                                <span className="text-muted-foreground">{user?.points || 0} pts</span>
                            </div>
                            <span className={`font-bold ${getRankColor(user?.rank?.name)}`}>
                                {user?.rank?.name || 'Procrastinador'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-yellow-400">
                            <ShoppingCart className="w-3 h-3" />
                            <span className="opacity-70">Canjeables:</span>
                            <span className="font-bold">{user?.redeemable_points || 0} pts</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        flex items-center gap-3 px-4 py-2.5 rounded-xl
                                        transition-colors duration-200
                                        ${isActive 
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                                        }
                                    `}
                                    onClick={() => setSidebarOpen(false)}
                                    data-testid={`nav-${item.path.slice(1)}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom actions */}
                    <div className="space-y-2 pt-4 border-t border-emerald-500/20">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                            onClick={toggleTheme}
                            data-testid="theme-toggle-btn"
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun className="w-5 h-5" />
                                    Modo Claro
                                </>
                            ) : (
                                <>
                                    <Moon className="w-5 h-5" />
                                    Modo Oscuro
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={handleLogout}
                            data-testid="logout-btn"
                        >
                            <LogOut className="w-5 h-5" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Mobile header */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-emerald-500/20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                        data-testid="open-sidebar-btn"
                    >
                        <Menu className="w-6 h-6" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded overflow-hidden">
                            <img src={UNPHU_LOGO} alt="TaskFlow" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-heading font-bold text-emerald-400">TaskFlow</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        data-testid="mobile-theme-toggle"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>
                </header>

                {/* Page content */}
                <div className="flex-1 p-4 lg:p-8 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
