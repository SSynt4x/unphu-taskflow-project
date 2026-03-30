import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const UNPHU_LOGO = "/unphu-logo.png";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
            toast.success('¡Bienvenido de vuelta!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a1a0a] dark:bg-[#0a1a0a]">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-green-900/20" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
            
            <Card className="w-full max-w-md glass-card border-emerald-500/20 animate-fadeIn relative z-10" data-testid="login-card">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-28 h-28 rounded-2xl flex items-center justify-center overflow-hidden">
                        <img src={UNPHU_LOGO} alt="TaskFlow Lite UNPHU" className="w-full h-full object-contain" />
                    </div>
                    <CardTitle className="text-2xl font-heading text-white">TaskFlow Lite</CardTitle>
                    <CardDescription className="text-emerald-400 font-medium">
                        UNPHU - Gestión de Tareas Académicas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-black/20 border-white/10 focus:border-primary text-white placeholder:text-slate-500 h-12"
                                    required
                                    data-testid="login-email-input"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-black/20 border-white/10 focus:border-primary text-white placeholder:text-slate-500 h-12"
                                    required
                                    data-testid="login-password-input"
                                />
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl hover:scale-[1.02] transition-transform"
                            style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}
                            disabled={isLoading}
                            data-testid="login-submit-btn"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Cargando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Iniciar Sesión
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </form>
                    <p className="mt-6 text-center text-slate-400">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="text-emerald-400 hover:underline font-medium" data-testid="register-link">
                            Regístrate
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
