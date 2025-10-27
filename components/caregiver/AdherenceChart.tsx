import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IntakeStatus } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell } from 'recharts';

const getAdherenceColor = (percentage: number): string => {
    if (percentage >= 90) return '#4CAF50'; // pildhora-success
    if (percentage >= 70) return '#FF9800'; // pildhora-warning
    return '#F44336'; // pildhora-error
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="font-bold text-gray-800">{`Día: ${label}`}</p>
                {data.adherence != null ? (
                    <p className="text-sm text-gray-600">
                        Adherencia: <span style={{ color: getAdherenceColor(data.adherence), fontWeight: 'bold' }}>{`${Math.round(data.adherence)}%`}</span>
                    </p>
                ) : (
                    <p className="text-sm text-gray-500 italic">Sin datos</p>
                )}
            </div>
        );
    }
    return null;
};

const AdherenceChart: React.FC = () => {
    const { intakeHistory, loading } = useData();

    const adherenceData = useMemo(() => {
        if (loading || intakeHistory.length === 0) {
            return {
                takenDoses: 0,
                missedDoses: 0,
                percentage: 0,
                weeklyData: [],
            };
        }

        const today = new Date();
        const last7DaysHistory = intakeHistory.filter(record => {
            const recordDate = new Date(record.scheduledTime);
            const diffTime = today.getTime() - recordDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            // Only include records from today and the past 6 days that are not in the future
            return diffDays < 7 && diffDays >= 0 && record.scheduledTime <= today;
        });

        const takenDoses = last7DaysHistory.filter(r => r.status === IntakeStatus.TAKEN).length;
        const missedDoses = last7DaysHistory.filter(r => r.status === IntakeStatus.MISSED).length;
        const totalTrackedDoses = takenDoses + missedDoses;

        const percentage = totalTrackedDoses > 0 ? Math.round((takenDoses / totalTrackedDoses) * 100) : 100;

        // For a simple visualization
        const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const weeklyData = Array.from({ length: 7 }).map((_, i) => {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            const dayKey = day.toISOString().split('T')[0];
            const dayRecords = last7DaysHistory.filter(r => r.scheduledTime.toISOString().split('T')[0] === dayKey);
            const taken = dayRecords.filter(r => r.status === IntakeStatus.TAKEN).length;
            const missed = dayRecords.filter(r => r.status === IntakeStatus.MISSED).length;
            const total = taken + missed;
            const adherence = total > 0 ? (taken / total) * 100 : null; // Use null for no data
            return {
                label: dayLabels[day.getDay()],
                adherence: adherence,
            };
        }).reverse();

        return {
            takenDoses,
            missedDoses,
            percentage,
            weeklyData,
        };
    }, [intakeHistory, loading]);

    const radialData = [{ name: 'Adherencia', value: adherenceData.percentage, fill: getAdherenceColor(adherenceData.percentage) }];

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pildhora-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-8">
            <h3 className="text-xl font-bold text-gray-800">Reporte de Adherencia (Últimos 7 días)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-1 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                         <RadialBarChart 
                            innerRadius="70%" 
                            outerRadius="100%" 
                            data={radialData} 
                            startAngle={90} 
                            endAngle={-270}
                         >
                            <RadialBar 
                                background 
                                dataKey="value" 
                                cornerRadius={10}
                            />
                            <text 
                                x="50%" 
                                y="50%" 
                                textAnchor="middle" 
                                dominantBaseline="middle" 
                                className="text-5xl font-extrabold"
                                style={{ fill: getAdherenceColor(adherenceData.percentage) }}
                            >
                                {`${adherenceData.percentage}%`}
                            </text>
                             <text 
                                x="50%" 
                                y="65%" 
                                textAnchor="middle" 
                                dominantBaseline="middle" 
                                className="text-lg font-semibold text-gray-500"
                            >
                                Adherencia
                            </text>
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-lg">
                    <div>
                        <p className="text-lg font-semibold text-gray-600">Dosis Tomadas</p>
                        <p className="text-4xl font-bold text-pildhora-success">{adherenceData.takenDoses}</p>
                    </div>
                     <div>
                        <p className="text-lg font-semibold text-gray-600">Dosis Omitidas</p>
                        <p className="text-4xl font-bold text-pildhora-error">{adherenceData.missedDoses}</p>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-gray-700 mb-4">Adherencia Diaria</h4>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={adherenceData.weeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis unit="%" tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 100]} axisLine={false} tickLine={false}/>
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }} />
                            <Bar dataKey="adherence" radius={[8, 8, 0, 0]}>
                                {adherenceData.weeklyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.adherence != null ? getAdherenceColor(entry.adherence) : '#E5E7EB'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <p className="text-xs text-gray-400 mt-2 text-center">
                    El porcentaje se calcula basado en las tomas que ya han pasado (tomadas y omitidas). Las tomas pendientes no se incluyen en el cálculo.
                </p>
            </div>
        </div>
    );
};

export default AdherenceChart;