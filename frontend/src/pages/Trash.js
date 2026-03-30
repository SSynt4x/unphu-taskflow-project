import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
    Trash2, 
    RotateCcw,
    AlertTriangle,
    CalendarIcon,
    CheckCircle2,
    Circle,
    XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_CONFIG = {
    pending: { label: 'Pendiente', icon: Circle, color: 'text-yellow-400' },
    completed: { label: 'Completada', icon: CheckCircle2, color: 'text-emerald-400' },
    incomplete: { label: 'No finalizada', icon: XCircle, color: 'text-red-400' },
};

export default function Trash() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmEmpty, setConfirmEmpty] = useState(false);

    useEffect(() => {
        fetchTrash();
    }, []);

    const fetchTrash = async () => {
        try {
            const response = await axios.get(`${API}/trash`);
            setItems(response.data);
        } catch (error) {
            console.error('Failed to fetch trash:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (taskId) => {
        try {
            await axios.post(`${API}/trash/${taskId}/restore`);
            setItems(items.filter(i => i.id !== taskId));
            toast.success('Tarea restaurada');
        } catch (error) {
            toast.error('Error al restaurar');
        }
    };

    const handlePermanentDelete = async (taskId) => {
        try {
            await axios.delete(`${API}/trash/${taskId}/permanent`);
            setItems(items.filter(i => i.id !== taskId));
            toast.success('Eliminada permanentemente');
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleEmptyTrash = async () => {
        try {
            await axios.delete(`${API}/trash/empty`);
            setItems([]);
            setConfirmEmpty(false);
            toast.success('Basurero vaciado');
        } catch (error) {
            toast.error('Error al vaciar basurero');
        }
    };

    const formatDeletedDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (hours < 1) return 'Hace menos de 1 hora';
        if (hours < 24) return `Hace ${hours}h`;
        if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="trash-page">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                        <Trash2 className="w-8 h-8 text-red-400" />
                        Basurero
                    </h1>
                    <p className="text-red-400 mt-1">{items.length} tarea{items.length !== 1 ? 's' : ''} en el basurero</p>
                </div>
                {items.length > 0 && (
                    <Button 
                        onClick={() => setConfirmEmpty(true)}
                        className="gap-2 bg-red-500 hover:bg-red-600 text-white"
                        data-testid="empty-trash-btn"
                    >
                        <Trash2 className="w-4 h-4" />
                        Vaciar Basurero
                    </Button>
                )}
            </div>

            {items.length === 0 ? (
                <Card className="glass-card border-white/10">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                            <Trash2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-center">El basurero está vacío</p>
                        <p className="text-xs text-muted-foreground text-center mt-1">
                            Las tareas eliminadas aparecerán aquí
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {items.map((item) => {
                        const StatusIcon = STATUS_CONFIG[item.status]?.icon || Circle;
                        return (
                            <Card 
                                key={item.id}
                                className="glass-card border-red-500/10 hover:border-red-500/20 transition-colors"
                                data-testid={`trash-item-${item.id}`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <StatusIcon className={`w-5 h-5 ${STATUS_CONFIG[item.status]?.color || 'text-gray-400'} opacity-50 flex-shrink-0`} />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-foreground/70 line-through">{item.title}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {format(new Date(item.due_date), 'dd MMM yyyy', { locale: es })}
                                                </span>
                                                <span className="text-xs text-red-400">
                                                    Eliminada {formatDeletedDate(item.deleted_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRestore(item.id)}
                                                className="gap-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                                data-testid={`restore-${item.id}`}
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                Restaurar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePermanentDelete(item.id)}
                                                className="gap-1 text-red-400 border-red-500/30 hover:bg-red-500/10"
                                                data-testid={`delete-permanent-${item.id}`}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Confirm Empty Dialog */}
            <Dialog open={confirmEmpty} onOpenChange={setConfirmEmpty}>
                <DialogContent className="glass-card border-red-500/20 sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="w-5 h-5" />
                            Vaciar Basurero
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <p className="text-muted-foreground text-sm">
                            ¿Estás seguro? Se eliminarán <span className="text-red-400 font-bold">{items.length} tarea{items.length !== 1 ? 's' : ''}</span> de forma permanente. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setConfirmEmpty(false)}>
                                Cancelar
                            </Button>
                            <Button 
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                                onClick={handleEmptyTrash}
                                data-testid="confirm-empty-btn"
                            >
                                Eliminar Todo
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
