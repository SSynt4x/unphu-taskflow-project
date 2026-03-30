import { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
    Download, 
    History as HistoryIcon, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Target,
    LogIn,
    UserPlus,
    Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ACTION_CONFIG = {
    task_completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    task_created: { icon: Clock, color: 'text-primary', bg: 'bg-primary/20' },
    task_deleted: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
    task_status_changed: { icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    plan_created: { icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    plan_deleted: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
    login: { icon: LogIn, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    register: { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
};

export default function History() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await axios.get(`${API}/activities?limit=100`);
            setActivities(response.data);
            localStorage.setItem('history', JSON.stringify(response.data));
        } catch (error) {
            console.error('Failed to fetch activities:', error);
            const cached = localStorage.getItem('history');
            if (cached) setActivities(JSON.parse(cached));
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 20;

        // Title
        doc.setFontSize(24);
        doc.setTextColor(0, 240, 255);
        doc.text('TaskFlow Lite', pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text('Historial de Actividades', pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 8;
        doc.setFontSize(10);
        doc.text(`Generado el ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}`, pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 15;
        doc.setDrawColor(0, 240, 255);
        doc.setLineWidth(0.5);
        doc.line(20, yPos, pageWidth - 20, yPos);
        
        yPos += 10;

        // Activities
        doc.setTextColor(0);
        doc.setFontSize(10);

        activities.forEach((activity, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            const date = format(new Date(activity.created_at), "dd/MM/yyyy HH:mm", { locale: es });
            const pointsText = activity.points_earned > 0 ? ` (+${activity.points_earned} pts)` : '';
            
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(date, 20, yPos);
            
            doc.setFontSize(10);
            doc.setTextColor(0);
            const text = `${activity.description}${pointsText}`;
            const lines = doc.splitTextToSize(text, pageWidth - 70);
            doc.text(lines, 60, yPos);
            
            yPos += lines.length * 5 + 8;
        });

        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, 290, { align: 'center' });
        }

        doc.save('taskflow-historial.pdf');
        toast.success('PDF descargado exitosamente');
    };

    const groupActivitiesByDate = () => {
        const groups = {};
        activities.forEach(activity => {
            const date = format(new Date(activity.created_at), 'yyyy-MM-dd');
            if (!groups[date]) groups[date] = [];
            groups[date].push(activity);
        });
        return groups;
    };

    const groupedActivities = groupActivitiesByDate();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="history-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Historial</h1>
                    <p className="text-muted-foreground mt-1">Registro de todas tus actividades</p>
                </div>
                
                <Button 
                    onClick={downloadPDF}
                    className="gap-2 bg-primary text-primary-foreground neon-glow"
                    disabled={activities.length === 0}
                    data-testid="download-pdf-btn"
                >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                </Button>
            </div>

            {/* Activities */}
            {activities.length === 0 ? (
                <Card className="glass-card border-white/10">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <HistoryIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-center">
                            No hay actividades registradas
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                        <div key={date}>
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background/80 backdrop-blur-sm py-2">
                                {format(new Date(date), "EEEE, d 'de' MMMM", { locale: es })}
                            </h3>
                            <Card className="glass-card border-white/10">
                                <CardContent className="p-0 divide-y divide-white/5">
                                    {dayActivities.map((activity, index) => {
                                        const config = ACTION_CONFIG[activity.action] || { 
                                            icon: Activity, 
                                            color: 'text-muted-foreground', 
                                            bg: 'bg-muted/50' 
                                        };
                                        const Icon = config.icon;

                                        return (
                                            <div 
                                                key={activity.id}
                                                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                                                data-testid={`activity-${activity.id}`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                                                    <Icon className={`w-5 h-5 ${config.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-foreground">{activity.description}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {format(new Date(activity.created_at), 'HH:mm', { locale: es })}
                                                    </p>
                                                </div>
                                                {activity.points_earned > 0 && (
                                                    <span className="text-sm font-bold text-emerald-400 flex-shrink-0">
                                                        +{activity.points_earned} pts
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
