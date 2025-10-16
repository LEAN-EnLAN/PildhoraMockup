
import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IntakeStatus } from '../../types';

const AdherenceChart: React.FC = () => {
    const { intakeHistory, loading } = useData();

    const adherenceData = useMemo(() => {
        if (loading || intakeHistory.length === 0) {
            return {
                totalDoses: 0,
                takenDoses: 0,
                missedDoses: 0,
                pendingDoses: 0,
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
            const adherence = total > 0 ? (taken / total) * 100 : -1; // -1 to indicate no doses
            return {
                label: dayLabels[day.getDay()],
                adherence: adherence,
            };
        }).reverse();

        return {
            totalDoses: last7DaysHistory.length,
            takenDoses,
            missedDoses,
            percentage,
            weeklyData,
        };
    }, [intakeHistory, loading]);

    if (loading) {
        return <div className="bg-white p-6 rounded-lg shadow">Cargando reporte de adherencia...</div>;
    }

    const getBarColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-pildhora-success';
        if (percentage >= 70) return 'bg-yellow-400';
        return 'bg-pildhora-error';
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Reporte de Adherencia (Últimos 7 días)</h3>
            
            <div className="text-center bg-slate-50 p-6 rounded-lg">
                <p className="text-gray-600 font-semibold">Tasa de Adherencia General</p>
                <p className={`text-6xl font-extrabold ${getBarColor(adherenceData.percentage).replace('bg-', 'text-')}`}>
                    {adherenceData.percentage}%
                </p>
                <div className="mt-2 text-sm text-gray-500">
                    <span>{adherenceData.takenDoses} tomadas</span>
                    <span className="mx-2">|</span>
                    <span>{adherenceData.missedDoses} omitidas</span>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-gray-700 mb-4">Adherencia Diaria</h4>
                <div className="flex justify-between items-end h-48 p-4 border-l border-b border-gray-200">
                    {adherenceData.weeklyData.map((day, index) => (
                        <div key={index} className="flex flex-col items-center w-1/7">
                            {day.adherence >= 0 ? (
                                <>
                                    <div className="text-xs font-bold mb-1">{Math.round(day.adherence)}%</div>
                                    <div className="w-8 md:w-10 h-full flex items-end">
                                        <div
                                            className={`w-full ${getBarColor(day.adherence)} rounded-t-md`}
                                            style={{ height: `${day.adherence}%` }}
                                            title={`${Math.round(day.adherence)}%`}
                                        ></div>
                                    </div>
                                </>
                            ) : (
                                <div className="w-8 md:w-10 h-full flex items-end justify-center">
                                    <span className="text-gray-400 text-xs transform -rotate-90 whitespace-nowrap">Sin datos</span>
                                </div>
                            )}
                            <div className="mt-2 text-sm font-semibold text-gray-600">{day.label}</div>
                        </div>
                    ))}
                </div>
                 <p className="text-xs text-gray-400 mt-2 text-center">
                    El porcentaje se calcula basado en las tomas que ya han pasado (tomadas y omitidas). Las tomas pendientes no se incluyen en el cálculo.
                </p>
            </div>
        </div>
    );
};

export default AdherenceChart;
