import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
    Plus, 
    ArrowLeft, 
    BookOpen,
    FileText,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [expandedModule, setExpandedModule] = useState(null);
    
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            const [coursesRes, modulesRes] = await Promise.all([
                axios.get(`${API}/courses`),
                axios.get(`${API}/modules/${courseId}`)
            ]);
            const foundCourse = coursesRes.data.find(c => c.id === courseId);
            setCourse(foundCourse);
            setModules(modulesRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateModule = async (e) => {
        e.preventDefault();
        if (!title || !content) {
            toast.error('Título y contenido son requeridos');
            return;
        }

        try {
            const response = await axios.post(`${API}/modules`, {
                course_id: courseId,
                title,
                content,
                order: modules.length
            });
            setModules([...modules, response.data]);
            setDialogOpen(false);
            setTitle('');
            setContent('');
            toast.success('Módulo creado');
        } catch (error) {
            toast.error('Error al crear módulo');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-16">
                <p className="text-muted-foreground">Curso no encontrado</p>
                <Button onClick={() => navigate('/courses')} className="mt-4">
                    Volver a cursos
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="course-detail-page">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/courses')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{course.code}</p>
                    <h1 className="text-2xl font-heading font-bold text-foreground">{course.name}</h1>
                </div>
                <div className="w-4 h-full rounded" style={{ backgroundColor: course.color }} />
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                            <Plus className="w-4 h-4" />
                            Nuevo Módulo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-emerald-500/20 sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="font-heading">Nuevo Módulo de Enseñanza</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateModule} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Título del Módulo *</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ej: Introducción a Bases de Datos"
                                    className="bg-black/20 border-white/10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Contenido Teórico *</Label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Escribe el contenido teórico del módulo..."
                                    className="bg-black/20 border-white/10 resize-none min-h-[200px]"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1 bg-emerald-500 text-white">
                                    Crear Módulo
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Modules */}
            {modules.length === 0 ? (
                <Card className="glass-card border-emerald-500/20">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-muted-foreground text-center">
                            No hay módulos en este curso. ¡Crea el primer módulo!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {modules.map((module, index) => (
                        <Card 
                            key={module.id}
                            className="glass-card border-emerald-500/20 overflow-hidden"
                        >
                            <CardHeader 
                                className="cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                        style={{ backgroundColor: course.color }}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{module.title}</CardTitle>
                                    </div>
                                    {expandedModule === module.id ? (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                            </CardHeader>
                            {expandedModule === module.id && (
                                <CardContent className="pt-0 border-t border-white/10">
                                    <div className="prose prose-invert max-w-none mt-4">
                                        <div className="whitespace-pre-wrap text-muted-foreground">
                                            {module.content}
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
