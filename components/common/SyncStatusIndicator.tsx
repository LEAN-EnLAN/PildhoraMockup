import React from 'react';
import { SyncStatus } from '../../types';

interface SyncStatusIndicatorProps {
    status: SyncStatus;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ status }) => {
    const getStatusInfo = () => {
        switch (status) {
            case SyncStatus.UP_TO_DATE:
                return {
                    color: 'bg-green-500',
                    text: 'Sincronizado',
                };
            case SyncStatus.SYNCING:
                return {
                    color: 'bg-yellow-500 animate-pulse',
                    text: 'Sincronizando...',
                };
            case SyncStatus.OFFLINE:
            default:
                return {
                    color: 'bg-red-500',
                    text: 'Sin conexión',
                };
        }
    };

    const { color, text } = getStatusInfo();

    return (
        <div className="flex items-center space-x-2" title={text} aria-live="polite">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="text-sm font-medium text-gray-600 hidden sm:inline">{text}</span>
        </div>
    );
};

export default SyncStatusIndicator;