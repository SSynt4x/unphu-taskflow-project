import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { 
    Plus, 
    UsersRound, 
    UserPlus,
    Trash2,
    CheckCircle2,
    Circle,
    ArrowLeft,
    CalendarIcon,
    Mail
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Groups() {
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupTasks, setGroupTasks] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    
    // Add member
    const [memberDialogOpen, setMemberDialogOpen] = useState(false);
    const [memberEmail, setMemberEmail] = useState('');
    
    // Add task
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [taskDueDate, setTaskDueDate] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) fetchGroupTasks(selectedGroup.id);
    }, [selectedGroup]);

    const fetchGroups = async () => {
        try {
            const response = await axios.get(`${API}/groups`);
            setGroups(response.data);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupTasks = async (groupId) => {
        try {
            const response = await axios.get(`${API}/groups/${groupId}/tasks`);
            setGroupTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch group tasks:', error);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!name) { toast.error('Nombre requerido'); return; }
        try {
            const response = await axios.post(`${API}/groups`, { name, description });
            setGroups([response.data, ...groups]);
            setDialogOpen(false);
            setName('');
            setDescription('');
            toast.success('Grupo creado');
        } catch (error) {
            toast.error('Error al crear grupo');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!memberEmail) { toast.error('Correo requerido'); return; }
        try {
            const response = await axios.post(`${API}/groups/${selectedGroup.id}/members`, { friend_email: memberEmail });
            toast.success(response.data.message);
            setMemberDialogOpen(false);
            setMemberEmail('');
            fetchGroups();
            // Update selected group
            const updatedGroups = await axios.get(`${API}/groups`);
            const updated = updatedGroups.data.find(g => g.id === selectedGroup.id);
            if (updated) setSelectedGroup(updated);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!taskTitle || !taskDueDate) { toast.error('Completa los campos'); return; }
        try {
            const response = await axios.post(`${API}/groups/tasks`, {
                group_id: selectedGroup.id,
                title: taskTitle,
                description: taskDesc,
                due_date: taskDueDate
            });
            setGroupTasks([response.data, ...groupTasks]);
            setTaskDialogOpen(false);
            setTaskTitle('');
            setTaskDesc('');
            setTaskDueDate('');
            toast.success('Tarea creada');
        } catch (error) {
            toast.error('Error al crear tarea');
        }
    };

    const handleCompleteTask = async (taskId) => {
        try {
            const response = await axios.put(`${API}/groups/tasks/${taskId}/complete`);
            toast.success(`+${response.data.points_earned} pts`);
            fetchGroupTasks(selectedGroup.id);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error');
        }
    };

    const handleDeleteGroup = async (groupId) => {
        try {
            await axios.delete(`${API}/groups/${groupId}`);
            setGroups(groups.filter(g => g.id !== groupId));
            if (selectedGroup?.id === groupId) setSelectedGroup(null);
            toast.success('Grupo eliminado');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    // Detail view
    if (selectedGroup) {
        const pendingTasks = groupTasks.filter(t => t.status === 'pending');
        const completedTasks = groupTasks.filter(t => t.status === 'completed');
        const progress = groupTasks.length > 0 ? (completedTasks.length / groupTasks.length) * 100 : 0;

        return (
            <div className="space-y-6 animate-fadeIn" data-testid="group-detail-page">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedGroup(null)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-heading font-bold text-foreground">{selectedGroup.name}</h1>
                        <p className="text-muted-foreground text-sm">{selectedGroup.description}</p>
                    </div>
                </div>

                {/* Members */}
                <Card className="glass-card border-emerald-500/20">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-heading flex items-center gap-2">
                                <UsersRound className="w-4 h-4 text-emerald-400" />
                                Miembros ({selectedGroup.members?.length || 0})
                            </CardTitle>
                            <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white">
                                        <UserPlus className="w-3 h-3" />
                                        Agregar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="glass-card border-emerald-500/20 sm:max-w-sm">
                                    <DialogHeader>
                                        <DialogTitle>Agregar Miembro</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddMember} className="space-y-4 mt-2">
                                        <div className="space-y-2">
                                            <Label>Correo del usuario</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    value={memberEmail}
                                                    onChange={(e) => setMemberEmail(e.target.value)}
                                                    placeholder="correo@unphu.edu.do"
                                                    className="pl-10 bg-black/20 border-white/10"
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full bg-emerald-500 text-white">Agregar</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {selectedGroup.members?.map((m) => (
                                <span key={m.user_id} className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    m.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted/50 text-muted-foreground'
                                }`}>
                                    {m.name} {m.role === 'admin' ? '(Admin)' : ''}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Progress */}
                <Card className="glass-card border-emerald-500/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Progreso del grupo</span>
                            <span className="text-sm font-bold text-emerald-400">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {completedTasks.length} de {groupTasks.length} tareas completadas
                        </p>
                    </CardContent>
                </Card>

                {/* Tasks */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Tareas del Grupo</h2>
                    <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="new-group-task-btn">
                                <Plus className="w-4 h-4" />
                                Nueva Tarea
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-emerald-500/20 sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Nueva Tarea Grupal</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateTask} className="space-y-4 mt-2">
                                <div className="space-y-2">
                                    <Label>Título *</Label>
                                    <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Nombre de la tarea" className="bg-black/20 border-white/10" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <Textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Detalles..." className="bg-black/20 border-white/10 resize-none" rows={2} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha límite *</Label>
                                    <Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="bg-black/20 border-white/10" required />
                                </div>
                                <Button type="submit" className="w-full bg-emerald-500 text-white">Crear Tarea</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {groupTasks.length === 0 ? (
                    <Card className="glass-card border-white/10">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No hay tareas en este grupo
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {pendingTasks.map((task) => (
                            <Card key={task.id} className="glass-card border-white/10">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleCompleteTask(task.id)} className="flex-shrink-0">
                                            <Circle className="w-5 h-5 text-yellow-400 hover:text-emerald-400 transition-colors" />
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-foreground">{task.title}</h3>
                                            {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" /> {task.due_date}
                                                <span className="ml-2">por {task.created_by_name}</span>
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {completedTasks.map((task) => (
                            <Card key={task.id} className="glass-card border-emerald-500/20 opacity-60">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        <h3 className="font-medium text-foreground line-through">{task.title}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Group list view
    return (
        <div className="space-y-6 animate-fadeIn" data-testid="groups-page">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                        <UsersRound className="w-8 h-8 text-emerald-400" />
                        Grupos de Estudio
                    </h1>
                    <p className="text-emerald-500 dark:text-emerald-400 mt-1">Colabora con tus compañeros</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="new-group-btn">
                            <Plus className="w-4 h-4" />
                            Nuevo Grupo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-emerald-500/20 sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="font-heading">Nuevo Grupo de Estudio</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateGroup} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Nombre del Grupo *</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Grupo de Algorítmica" className="bg-black/20 border-white/10" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Qué estudiará el grupo?" className="bg-black/20 border-white/10 resize-none" rows={2} />
                            </div>
                            <Button type="submit" className="w-full bg-emerald-500 text-white">Crear Grupo</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {groups.length === 0 ? (
                <Card className="glass-card border-emerald-500/20">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                            <UsersRound className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-muted-foreground text-center">No tienes grupos de estudio</p>
                        <p className="text-sm text-muted-foreground text-center mt-1">Crea un grupo y agrega a tus compañeros</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group) => {
                        const progress = group.task_count > 0 ? (group.completed_count / group.task_count) * 100 : 0;
                        return (
                            <Card 
                                key={group.id}
                                className="glass-card border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer hover:scale-[1.02]"
                                onClick={() => setSelectedGroup(group)}
                                data-testid={`group-card-${group.id}`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                            <UsersRound className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        {group.creator_id === user?.id && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-foreground">{group.name}</h3>
                                    {group.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{group.description}</p>}
                                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                        <span>{group.members?.length || 0} miembros</span>
                                        <span>{group.task_count || 0} tareas</span>
                                    </div>
                                    <div className="mt-3">
                                        <Progress value={progress} className="h-1.5" />
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
