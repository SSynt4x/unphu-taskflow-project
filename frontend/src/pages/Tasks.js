import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { 
    Plus, 
    CalendarIcon, 
    Clock, 
    MoreVertical, 
    Edit2, 
    Trash2,
    CheckCircle2,
    Circle,
    XCircle,
    Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_CONFIG = {
    pending: { label: 'Pendiente', icon: Circle, class: 'status-pending' },
    completed: { label: 'Completada', icon: CheckCircle2, class: 'status-completed' },
    incomplete: { label: 'No finalizada', icon: XCircle, class: 'status-incomplete' },
};

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [dueTime, setDueTime] = useState('12:00');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${API}/tasks`);
            setTasks(response.data);
            localStorage.setItem('tasks', JSON.stringify(response.data));
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            const cached = localStorage.getItem('tasks');
            if (cached) setTasks(JSON.parse(cached));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDueDate(null);
        setDueTime('12:00');
        setEditingTask(null);
    };

    const handleOpenDialog = (task = null) => {
        if (task) {
            setEditingTask(task);
            setTitle(task.title);
            setDescription(task.description);
            setDueDate(new Date(task.due_date));
            setDueTime(task.due_time);
        } else {
            resetForm();
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title || !dueDate) {
            toast.error('Por favor completa los campos requeridos');
            return;
        }

        const taskData = {
            title,
            description,
            due_date: format(dueDate, 'yyyy-MM-dd'),
            due_time: dueTime,
        };

        try {
            if (editingTask) {
                const response = await axios.put(`${API}/tasks/${editingTask.id}`, taskData);
                setTasks(tasks.map(t => t.id === editingTask.id ? response.data : t));
                toast.success('Tarea actualizada');
            } else {
                const response = await axios.post(`${API}/tasks`, taskData);
                setTasks([response.data, ...tasks]);
                toast.success('Tarea creada');
            }
            setDialogOpen(false);
            resetForm();
        } catch (error) {
            toast.error('Error al guardar la tarea');
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const response = await axios.put(`${API}/tasks/${taskId}`, { status: newStatus });
            setTasks(tasks.map(t => t.id === taskId ? response.data : t));
            if (newStatus === 'completed') {
                toast.success('¡Tarea completada! +10 puntos');
            } else {
                toast.success('Estado actualizado');
            }
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    const handleDelete = async (taskId) => {
        try {
            await axios.delete(`${API}/tasks/${taskId}`);
            setTasks(tasks.filter(t => t.id !== taskId));
            toast.success('Tarea movida al basurero');
        } catch (error) {
            toast.error('Error al eliminar la tarea');
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        return task.status === filter;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const dateA = new Date(`${a.due_date}T${a.due_time}`);
        const dateB = new Date(`${b.due_date}T${b.due_time}`);
        return dateA - dateB;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="tasks-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Mis Tareas</h1>
                    <p className="text-muted-foreground mt-1">Gestiona tus tareas pendientes</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2" data-testid="filter-btn">
                                <Filter className="w-4 h-4" />
                                {filter === 'all' ? 'Todas' : STATUS_CONFIG[filter]?.label}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setFilter('all')}>Todas</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter('pending')}>Pendientes</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter('completed')}>Completadas</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter('incomplete')}>No finalizadas</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                className="gap-2 bg-primary text-primary-foreground neon-glow"
                                onClick={() => handleOpenDialog()}
                                data-testid="new-task-btn"
                            >
                                <Plus className="w-4 h-4" />
                                Nueva Tarea
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-white/10 sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="font-heading">
                                    {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Título *</Label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Nombre de la tarea"
                                        className="bg-black/20 border-white/10"
                                        required
                                        data-testid="task-title-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Detalles de la tarea..."
                                        className="bg-black/20 border-white/10 resize-none"
                                        rows={3}
                                        data-testid="task-description-input"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Fecha *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full justify-start bg-black/20 border-white/10"
                                                    data-testid="task-date-btn"
                                                >
                                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                                    {dueDate ? format(dueDate, 'dd/MM/yyyy') : 'Seleccionar'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={dueDate}
                                                    onSelect={setDueDate}
                                                    locale={es}
                                                    data-testid="task-calendar"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hora</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                type="time"
                                                value={dueTime}
                                                onChange={(e) => setDueTime(e.target.value)}
                                                className="pl-10 bg-black/20 border-white/10"
                                                data-testid="task-time-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="flex-1"
                                        onClick={() => setDialogOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="flex-1 bg-primary text-primary-foreground"
                                        data-testid="task-submit-btn"
                                    >
                                        {editingTask ? 'Guardar' : 'Crear'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Tasks list */}
            {sortedTasks.length === 0 ? (
                <Card className="glass-card border-white/10">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-center">
                            {filter === 'all' 
                                ? 'No tienes tareas. ¡Crea una nueva!' 
                                : `No hay tareas ${STATUS_CONFIG[filter]?.label.toLowerCase()}`
                            }
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {sortedTasks.map((task, index) => {
                        const StatusIcon = STATUS_CONFIG[task.status]?.icon || Circle;
                        const isPastDue = new Date(`${task.due_date}T${task.due_time}`) < new Date() && task.status === 'pending';
                        
                        return (
                            <Card 
                                key={task.id}
                                className={`glass-card border-white/10 task-card ${isPastDue ? 'border-red-500/30' : ''}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                                data-testid={`task-card-${task.id}`}
                            >
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => handleStatusChange(
                                                task.id, 
                                                task.status === 'completed' ? 'pending' : 'completed'
                                            )}
                                            className="mt-1 flex-shrink-0"
                                            data-testid={`task-status-toggle-${task.id}`}
                                        >
                                            <StatusIcon className={`w-5 h-5 ${
                                                task.status === 'completed' ? 'text-emerald-400' : 
                                                task.status === 'incomplete' ? 'text-red-400' : 
                                                'text-yellow-400'
                                            }`} />
                                        </button>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-medium text-foreground ${
                                                task.status === 'completed' ? 'line-through opacity-60' : ''
                                            }`}>
                                                {task.title}
                                            </h3>
                                            {task.description && (
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {task.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_CONFIG[task.status]?.class}`}>
                                                    {STATUS_CONFIG[task.status]?.label}
                                                </span>
                                                <span className={`text-xs text-muted-foreground flex items-center gap-1 ${isPastDue ? 'text-red-400' : ''}`}>
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {format(new Date(task.due_date), 'dd MMM', { locale: es })} • {task.due_time}
                                                </span>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="flex-shrink-0" data-testid={`task-menu-${task.id}`}>
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenDialog(task)}>
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'pending')}>
                                                    <Circle className="w-4 h-4 mr-2" />
                                                    Marcar pendiente
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'completed')}>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Marcar completada
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'incomplete')}>
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Marcar no finalizada
                                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                                    onClick={() => handleDelete(task.id)}
                                                    className="text-red-400 focus:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Mover al basurero
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
