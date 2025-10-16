import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { mockBluetoothService } from '../services/mockBluetoothService';
import { PillboxDevice, PillboxDeviceState, ScanStatus } from '../types';

interface DeviceContextType {
    deviceState: PillboxDeviceState;
    foundDevices: PillboxDevice[];
    scanStatus: ScanStatus;
    startScan: () => void;
    connectToDevice: (deviceId: string) => Promise<void>;
    disconnectFromDevice: () => void;
    subscribeToCompartmentOpen: (callback: (compartmentId: number) => void) => () => void;
    // For simulation purposes
    _mockOpenCompartment: (compartmentId: number) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

const initialDeviceState: PillboxDeviceState = {
    isConnected: false,
    batteryLevel: 0,
    device: null,
    compartments: [
        { id: 1, isOpen: false },
        { id: 2, isOpen: false },
        { id: 3, isOpen: false },
        { id: 4, isOpen: false },
    ],
};

// Use a simple pub/sub for compartment open events
const compartmentOpenSubscribers = new Set<(compartmentId: number) => void>();

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [deviceState, setDeviceState] = useState<PillboxDeviceState>(initialDeviceState);
    const [foundDevices, setFoundDevices] = useState<PillboxDevice[]>([]);
    const [scanStatus, setScanStatus] = useState<ScanStatus>(ScanStatus.IDLE);

    useEffect(() => {
        mockBluetoothService.init(
            (newState) => {
                setDeviceState(newState);
            },
            (compartmentId) => {
                // Notify all subscribers
                compartmentOpenSubscribers.forEach(callback => callback(compartmentId));
            }
        );
    }, []);
    
    const subscribeToCompartmentOpen = useCallback((callback: (compartmentId: number) => void) => {
        compartmentOpenSubscribers.add(callback);
        // Return an unsubscribe function
        return () => {
            compartmentOpenSubscribers.delete(callback);
        };
    }, []);


    const startScan = useCallback(async () => {
        setScanStatus(ScanStatus.SCANNING);
        setFoundDevices([]);
        const devices = await mockBluetoothService.scanForDevices();
        setFoundDevices(devices);
        setScanStatus(ScanStatus.FINISHED);
    }, []);

    const connectToDevice = useCallback(async (deviceId: string) => {
        try {
            await mockBluetoothService.connect(deviceId);
        } catch (error) {
            console.error(`Failed to connect to device ${deviceId}`, error);
            // Optionally update state to show connection error
        }
    }, []);

    const disconnectFromDevice = useCallback(() => {
        mockBluetoothService.disconnect();
    }, []);

    // For simulation
    const _mockOpenCompartment = (compartmentId: number) => {
        mockBluetoothService.mockOpenCompartment(compartmentId);
    };

    return (
        <DeviceContext.Provider
            value={{
                deviceState,
                foundDevices,
                scanStatus,
                startScan,
                connectToDevice,
                disconnectFromDevice,
                subscribeToCompartmentOpen,
                _mockOpenCompartment,
            }}
        >
            {children}
        </DeviceContext.Provider>
    );
};

export const useDevice = () => {
    const context = useContext(DeviceContext);
    if (context === undefined) {
        throw new Error('useDevice must be used within a DeviceProvider');
    }
    return context;
};
