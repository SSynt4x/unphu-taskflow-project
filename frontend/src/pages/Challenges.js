import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { 
    Swords, 
    Trophy,
    CalendarDays,
    CalendarRange,
    Check,
    Coins,
    Flame,
    Star
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CHALLENGE_ICONS = {
    'weekly_5_tasks': Flame,
    'weekly_3_assignments': Star,
    'weekly_create_course': CalendarDays,
    'monthly_20_tasks': Trophy,
    'monthly_10_assignments': Swords,
    'monthly_add_friends': Star,
};

export default function Challenges() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const response = await axios.get(`${API}/challenges`);
            setChallenges(response.data);
        } catch (error) {
            console.error('Failed to fetch challenges:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (challengeId) => {
        try {
            const response = await axios.post(`${API}/challenges/${challengeId}/claim`);
            toast.success(response.data.message);
            fetchChallenges();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error');
        }
    };

    const weeklyChallenges = challenges.filter(c => c.type === 'weekly');
    const monthlyChallenges = challenges.filter(c => c.type === 'monthly');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    const ChallengeCard = ({ challenge }) => {
        const Icon = CHALLENGE_ICONS[challenge.id] || Swords;
        const progress = (challenge.progress / challenge.target) * 100;
        const isComplete = challenge.completed;
        const isClaimed = challenge.claimed;

        return (
            <Card 
                className={`glass-card overflow-hidden transition-all ${
                    isClaimed ? 'border-emerald-500/30 opacity-70' :
                    isComplete ? 'border-yellow-500/30' : 'border-white/10'
                }`}
                data-testid={`challenge-${challenge.id}`}
            >
                <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isClaimed ? 'bg-emerald-500/20' :
                            isComplete ? 'bg-yellow-500/20' : 'bg-orange-500/20'
                        }`}>
                            {isClaimed ? (
                                <Check className="w-6 h-6 text-emerald-400" />
                            ) : (
                                <Icon className={`w-6 h-6 ${isComplete ? 'text-yellow-400' : 'text-orange-400'}`} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground">{challenge.name}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">{challenge.description}</p>
                            
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-muted-foreground">
                                        {challenge.progress}/{challenge.target}
                                    </span>
                                    <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                                        <Coins className="w-3 h-3" />
                                        +{challenge.reward_points} pts / +{challenge.reward_redeemable} canjeables
                                    </span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            {isComplete && !isClaimed && (
                                <Button
                                    onClick={() => handleClaim(challenge.id)}
                                    className="mt-3 gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold w-full"
                                    data-testid={`claim-${challenge.id}`}
                                >
                                    <Trophy className="w-4 h-4" />
                                    Reclamar Recompensa
                                </Button>
                            )}
                            {isClaimed && (
                                <div className="mt-3 text-center py-2 bg-emerald-500/10 rounded-lg">
                                    <span className="text-sm text-emerald-400 font-bold flex items-center justify-center gap-1">
                                        <Check className="w-4 h-4" />
                                        Recompensa reclamada
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6 animate-fadeIn" data-testid="challenges-page">
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                    <Swords className="w-8 h-8 text-orange-400" />
                    Desafíos
                </h1>
                <p className="text-orange-400 mt-1">Completa desafíos para ganar puntos extra</p>
            </div>

            {/* Weekly */}
            <div>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-emerald-400" />
                    Desafíos Semanales
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {weeklyChallenges.map((c) => (
                        <ChallengeCard key={c.id} challenge={c} />
                    ))}
                </div>
            </div>

            {/* Monthly */}
            <div>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <CalendarRange className="w-5 h-5 text-purple-400" />
                    Desafíos Mensuales
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monthlyChallenges.map((c) => (
                        <ChallengeCard key={c.id} challenge={c} />
                    ))}
                </div>
            </div>

            {/* Info */}
            <Card className="glass-card border-orange-500/20">
                <CardContent className="p-6">
                    <h3 className="font-bold text-orange-400 mb-2">¿Cómo funcionan los desafíos?</h3>
                    <ul className="text-muted-foreground text-sm space-y-1">
                        <li>Los desafíos <span className="text-emerald-400">semanales</span> se reinician cada lunes</li>
                        <li>Los desafíos <span className="text-purple-400">mensuales</span> se reinician el primer día de cada mes</li>
                        <li>Completa el objetivo y reclama tu recompensa antes de que termine el período</li>
                        <li>Los puntos se agregan a tu saldo de <span className="text-yellow-400">puntos canjeables</span></li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
