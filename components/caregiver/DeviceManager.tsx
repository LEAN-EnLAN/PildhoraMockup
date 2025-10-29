
import React, { useState, useEffect, useRef } from 'react';
import { useDevice } from '../../context/DeviceContext';
import { ScanStatus, PillboxDevice } from '../../types';

const BatteryIcon: React.FC<{ level: number }> = ({ level }) => {
    const getBarColor = () => {
        if (level > 80) return 'fill-pildhora-success';
        if (level > 40) return 'fill-yellow-400';
        if (level > 15) return 'fill-pildhora-warning';
        return 'fill-pildhora-error';
    };
    const barWidth = Math.max(0.5, (level / 100) * 12); // Max width of 12, min width to be visible

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
            <line x1="23" y1="13" x2="23" y2="11"></line>
            {level > 0 && 
                <rect x="3" y="8" width={barWidth} height="8" rx="1" ry="1" className={`${getBarColor()} stroke-none`}></rect>
            }
        </svg>
    );
};


const Spinner: React.FC<{ className?: string }> = ({ className = 'border-white' }) => (
    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${className}`}></div>
);

// New simulation component with weekly view
const WeeklySimulationPanel: React.FC<{ isConnected: boolean; onOpen: (slot: number) => void }> = ({ isConnected, onOpen }) => {
    const [selectedDay, setSelectedDay] = useState(1); // 1 for Monday, 7 for Sunday
    const [activeSlot, setActiveSlot] = useState<number | null>(null);

    const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const timeSlotLabels = [
        { name: 'Mañana', position: 'top-2 left-2 text-left' },
        { name: 'Mediodía', position: 'top-2 right-2 text-right' },
        { name: 'Tarde', position: 'bottom-2 left-2 text-left' },
        { name: 'Noche', position: 'bottom-2 right-2 text-right' },
    ];
    
    // Mapping from visual quadrant index to logical time slot (0:Mañana, 1:Mediodía, 2:Tarde, 3:Noche)
    const quadrantMap = [0, 1, 2, 3]; 

    const handleSlotClick = (quadrantIndex: number) => {
        if (!isConnected) return;
        // logical time slot index (0-3)
        const timeSlotIndex = quadrantMap[quadrantIndex];
        // compartment number (1-28)
        const compartment = (selectedDay - 1) * 4 + (timeSlotIndex + 1);
        onOpen(compartment);
        setActiveSlot(compartment);
        setTimeout(() => setActiveSlot(null), 500);
    };
    
    const handleExtraSlotClick = () => {
        if (!isConnected) return;
        const compartment = 29;
        onOpen(compartment);
        setActiveSlot(compartment);
        setTimeout(() => setActiveSlot(null), 500);
    };

    return (
        <div className={`transition-opacity ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}>
             <div className="flex justify-center space-x-1 sm:space-x-2 mb-4">
                {dayLabels.map((label, index) => (
                    <button
                        key={index}
                        disabled={!isConnected}
                        onClick={() => setSelectedDay(index + 1)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-sm font-bold transition-colors ${
                            selectedDay === index + 1
                                ? 'bg-pildhora-secondary text-white'
                                : isConnected ? 'bg-slate-200 text-gray-700 hover:bg-slate-300' : 'bg-slate-200 text-gray-500'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto mt-8">
                {timeSlotLabels.map((labelInfo) => (
                    <div key={labelInfo.name} className={`absolute ${labelInfo.position}`}>
                        <p className="font-bold text-xs text-gray-400 tracking-wider">{labelInfo.name.toUpperCase()}</p>
                    </div>
                ))}

                <div className="w-full h-full p-2">
                    <div className="relative w-full h-full rounded-full bg-slate-100 shadow-inner grid grid-cols-2 grid-rows-2">
                        {Array.from({ length: 4 }).map((_, index) => {
                            const timeSlotIndex = quadrantMap[index];
                            const compartment = (selectedDay - 1) * 4 + (timeSlotIndex + 1);
                            const isActive = activeSlot === compartment;
                            
                            const quadrantClasses: { [key: number]: string } = {
                                0: 'rounded-tl-full', // Top-left (Mañana)
                                1: 'rounded-tr-full', // Top-right (Mediodía)
                                2: 'rounded-bl-full', // Bottom-left (Tarde)
                                3: 'rounded-br-full', // Bottom-right (Noche)
                            };

                            return (
                                <button
                                    key={index}
                                    disabled={!isConnected}
                                    onClick={() => handleSlotClick(index)}
                                    className={`relative flex items-center justify-center transition-all duration-200
                                        ${quadrantClasses[index]}
                                        ${isConnected ? 'bg-white hover:bg-slate-200' : 'bg-slate-200'}
                                        ${isActive ? 'bg-pildhora-primary' : ''}
                                        border border-slate-200
                                    `}
                                     aria-label={`Simular apertura compartimento ${compartment}`}
                                >
                                    <span className={`text-2xl font-bold transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                        {compartment}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
             <div className="mt-4 text-center">
                <button
                    disabled={!isConnected}
                    onClick={handleExtraSlotClick}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        activeSlot === 29 ? 'bg-pildhora-primary text-white' :
                        isConnected ? 'bg-slate-200 text-gray-700 hover:bg-slate-300' : 'bg-slate-200 text-gray-500'
                    }`}
                >
                    Compartimento #29 (Extra)
                </button>
            </div>
        </div>
    );
};


const DeviceManager: React.FC = () => {
    const { 
        deviceState, 
        foundDevices, 
        scanStatus, 
        startScan, 
        connectToDevice, 
        disconnectFromDevice,
        connectingDeviceId,
        isDisconnecting,
        connectionError,
        _mockOpenCompartment 
    } = useDevice();
    const { isConnected, device, batteryLevel } = deviceState;

    const [showSuccess, setShowSuccess] = useState(false);
    const prevIsConnected = useRef(isConnected);

    useEffect(() => {
        if (!prevIsConnected.current && isConnected) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
        prevIsConnected.current = isConnected;
    }, [isConnected]);

    const renderScanView = () => (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Conectar Pastillero</h3>
            <p className="text-gray-600">Busca el pastillero PILDHORA para vincularlo a la cuenta del paciente y habilitar el registro automático de tomas.</p>
            <button
                onClick={startScan}
                disabled={scanStatus === ScanStatus.SCANNING || !!connectingDeviceId}
                className="w-full px-4 py-3 text-lg font-semibold text-white bg-pildhora-secondary rounded-xl hover:bg-blue-800 disabled:bg-gray-400 transition"
            >
                {scanStatus === ScanStatus.SCANNING ? 'Buscando...' : 'Buscar Dispositivos'}
            </button>
            {scanStatus === ScanStatus.SCANNING && (
                 <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pildhora-secondary"></div>
                </div>
            )}
             {connectionError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm">
                    <strong>Error:</strong> {connectionError}
                </div>
            )}
            {scanStatus === ScanStatus.FINISHED && (
                <div className="space-y-3 pt-4">
                    <h4 className="font-semibold text-gray-700">Dispositivos Encontrados:</h4>
                    {foundDevices.length > 0 ? (
                        foundDevices.map((dev: PillboxDevice) => {
                            const isConnecting = connectingDeviceId === dev.id;
                            return (
                                <div key={dev.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                    <p className="font-semibold text-gray-700">{dev.name}</p>
                                    <button
                                        onClick={() => connectToDevice(dev.id)}
                                        disabled={isConnecting || !!connectingDeviceId}
                                        className="px-3 py-1 text-sm font-semibold text-white bg-pildhora-primary rounded-md hover:bg-green-700 w-24 flex justify-center items-center disabled:bg-gray-400"
                                    >
                                        {isConnecting ? <Spinner /> : 'Conectar'}
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-500">No se encontraron dispositivos. Asegúrate de que el pastillero esté encendido y cerca.</p>
                    )}
                </div>
            )}
        </div>
    );
    
    const renderConnectedView = () => (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
            {showSuccess && (
                <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-md text-sm transition-opacity duration-300">
                    ¡Dispositivo conectado con éxito!
                </div>
            )}
            <div>
                 <h3 className="text-xl font-bold text-gray-800">Pastillero Conectado</h3>
                 <p className="text-pildhora-success font-semibold">El dispositivo está vinculado y funcionando.</p>
            </div>
           
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600">Dispositivo:</span>
                    <span className="font-bold text-gray-800">{device?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600">Nivel de Batería:</span>
                    <div className="flex items-center space-x-2">
                        <BatteryIcon level={batteryLevel} />
                        <span className="font-bold text-gray-800">{batteryLevel}%</span>
                    </div>
                </div>
            </div>

            <button
                onClick={disconnectFromDevice}
                disabled={isDisconnecting}
                className="w-full px-4 py-2 text-md font-semibold text-pildhora-error-dark bg-red-100 rounded-xl hover:bg-red-200 transition flex justify-center items-center disabled:opacity-70"
            >
                {isDisconnecting ? (
                     <>
                        <Spinner className="border-pildhora-error-dark mr-2" />
                        <span>Desvinculando...</span>
                    </>
                ) : (
                    'Desvincular Dispositivo'
                )}
            </button>
        </div>
    );

    const renderSimulationView = () => (
        <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-bold text-gray-800 text-lg text-center">Simulación</h4>
            <div className="mt-6">
                <WeeklySimulationPanel isConnected={isConnected} onOpen={_mockOpenCompartment} />
                
                {!isConnected && <p className="text-center text-xs text-gray-500 mt-6">Conecta un dispositivo para activar la simulación.</p>}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {isConnected ? renderConnectedView() : renderScanView()}
            {renderSimulationView()}
        </div>
    );
};

export default DeviceManager;
