import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface EquipmentContextType {
  // Connection states
  isMonochromatorConnected: boolean;
  isLockInConnected: boolean;

  // Monochromator state and handlers
  wavelength: string;
  grating: string;
  getWavelength: () => Promise<boolean>;
  setWavelength: (value: string | number) => Promise<void>;
  getGrating: () => Promise<void>;
  setGrating: (value: string | number) => Promise<void>;

  // Lock-in state and handlers
  rValue: string;
  sensitivity: string;
  timeConstant: string;
  overload: string;
  getRValue: () => Promise<void>;
  getSensitivity: () => Promise<void>;
  setSensitivity: (value: string) => Promise<void>;
  getTimeConstant: () => Promise<void>;
  setTimeConstant: (value: string) => Promise<void>;
  getOverload: () => Promise<void>;

  // Connection handlers
  connectMonochromator: () => Promise<boolean>;
  disconnectMonochromator: () => Promise<void>;
  connectLockIn: () => Promise<void>;
  disconnectLockIn: () => Promise<void>;

  // Measurement state
  isMeasuring: boolean;
  setIsMeasuring: (value: boolean) => void;
}

const defaultContext: EquipmentContextType = {
  isMonochromatorConnected: false,
  isLockInConnected: false,
  isMeasuring: false,
  wavelength: "0.0",
  grating: "1",
  rValue: "0.0",
  sensitivity: "1 V",
  timeConstant: "1 ms",
  overload: "No Overload",
  getWavelength: async () => false,
  setWavelength: async () => {},
  getGrating: async () => {},
  setGrating: async () => {},
  getRValue: async () => {},
  getSensitivity: async () => {},
  setSensitivity: async () => {},
  getTimeConstant: async () => {},
  setTimeConstant: async () => {},
  getOverload: async () => {},
  connectMonochromator: async () => false,
  disconnectMonochromator: async () => {},
  connectLockIn: async () => {},
  disconnectLockIn: async () => {},
  setIsMeasuring: async () => {},
};

const EquipmentContext = createContext<EquipmentContextType>(defaultContext);

export function useEquipment() {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipment must be used within an EquipmentProvider');
  }
  return context;
}

interface EquipmentProviderProps {
  children: ReactNode;
}

export function EquipmentProvider({ children }: EquipmentProviderProps) {
  // Connection states
  const [isMonochromatorConnected, setIsMonochromatorConnected] = useState(false);
  const [isLockInConnected, setIsLockInConnected] = useState(false);

  // Monochromator states
  const [wavelength, setWavelengthState] = useState("0.0");
  const [grating, setGratingState] = useState("1");

  // Lock-in states
  const [rValue, setRValue] = useState("0.0");
  const [sensitivity, setSensitivityState] = useState("1 V");
  const [timeConstant, setTimeConstantState] = useState("1 ms");
  const [overload, setOverload] = useState("No Overload");

  // Measurement state
  const [isMeasuring, setIsMeasuring] = useState(false);

  // Setup polling for R value and overload status when lock-in is connected
  useEffect(() => {
    let interval: number;
    if (isLockInConnected && !isMeasuring) {
      getRValue();
      getOverload();
      interval = window.setInterval(() => {
        getRValue();
        getOverload();
      }, 1000); // Poll every second
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLockInConnected, isMeasuring]);

  // Setup polling for wavelength when monochromator is connected
  useEffect(() => {
    if (isMonochromatorConnected) {
      getWavelength();
      // interval = window.setInterval(() => {
      //   getWavelength();
      // }, 1000); // Poll every second
    }
    // return () => {
    //   if (interval) {
    //     clearInterval(interval);
    //   }
    // };
  }, [isMonochromatorConnected]);

  // Monochromator handlers
  const getWavelength = async () => {
    try {
      const value = await invoke<string>('get_wavelength');
      setWavelengthState(value);
      return true;
    } catch (error) {
      console.error('Error getting wavelength:', error);
    }
    return false;
  };

  const setWavelength = async (value: string | number) => {
    try {
      const wavelengthValue = parseFloat(value.toString());
      if (!isNaN(wavelengthValue)) {
        await invoke('set_wavelength', { wavelength: wavelengthValue });
        await getWavelength();
      }
    } catch (error) {
      console.error('Error setting wavelength:', error);
    }
  };

  const getGrating = async () => {
    try {
      const value = await invoke<string>('get_grating');
      console.log(value)
      setGratingState(value);
    } catch (error) {
      console.error('Error getting grating:', error);
    }
  };

  const setGrating = async (value: string | number) => {
    try {
      const gratingValue = parseInt(value.toString());
      if (!isNaN(gratingValue)) {
        const boolGrating = await invoke('set_grating', { grating: gratingValue });
        if (boolGrating) {
          await getGrating();
        } else {
          console.error('Failed to set grating');
        }
      }
      
    } catch (error) {
      console.error('Error setting grating:', error);
    }
  };

  // Lock-in handlers
  const getRValue = async () => {
    try {
      const value = await invoke<string>('get_r_value');
      setRValue(value);
    } catch (error) {
      console.error('Error getting R value:', error);
    }
  };

  const getSensitivity = async () => {
    try {
      const value = await invoke<string>('get_sensitivity');
      setSensitivityState(value);
    } catch (error) {
      console.error('Error getting sensitivity:', error);
    }
  };

  const setSensitivity = async (value: string) => {
    try {
      await invoke('set_sensitivity', { sensitivity: value });
      await getSensitivity();
    } catch (error) {
      console.error('Error setting sensitivity:', error);
    }
  };

  const getTimeConstant = async () => {
    try {
      const value = await invoke<string>('get_time_constant');
      setTimeConstantState(value);
      console.log(typeof(value));
    } catch (error) {
      console.error('Error getting time constant:', error);
    }
  };

  const setTimeConstant = async (value: string) => {
    try {
      await invoke('set_time_constant', { timeConstant: value });
      await getTimeConstant();
    } catch (error) {
      console.error('Error setting time constant:', error);
    }
  };

  const getOverload = async () => {
    try {
      const value = await invoke<string>('get_overload');
      setOverload(value);
    } catch (error) {
      console.error('Error getting overload status:', error);
    }
  };

  // Connection handlers
  const connectMonochromator = async () => {
    try {
      const result = await invoke<boolean>('connect_monochromator');
      setIsMonochromatorConnected(result);
      if (result) {
        const wavelength = await getWavelength();
        if (wavelength) {
          const grating = await getGrating();
          console.log(grating);
        }
      }
      return result;
    } catch (error) {
      console.error('Error connecting monochromator:', error);
      setIsMonochromatorConnected(false);
      return false;
    }
  };

  const disconnectMonochromator = async () => {
    try {
      await invoke('disconnect_monochromator');
      setIsMonochromatorConnected(false);
    } catch (error) {
      console.error('Error disconnecting monochromator:', error);
    }
  };

  const connectLockIn = async () => {
    try {
      await invoke('connect_lockin');
      setIsLockInConnected(true);
      await getRValue();
      await getSensitivity();
      await getTimeConstant();
      await getOverload();
    } catch (error) {
      console.error('Error connecting lock-in:', error);
      setIsLockInConnected(false);
    }
  };

  const disconnectLockIn = async () => {
    try {
      await invoke('disconnect_lockin');
      setIsLockInConnected(false);
    } catch (error) {
      console.error('Error disconnecting lock-in:', error);
    }
  };

  const value = {
    // Connection states
    isMonochromatorConnected,
    isLockInConnected,

    // Monochromator state and handlers
    wavelength,
    grating,
    getWavelength,
    setWavelength,
    getGrating,
    setGrating,

    // Lock-in state and handlers
    rValue,
    sensitivity,
    timeConstant,
    overload,
    getRValue,
    getSensitivity,
    setSensitivity,
    getTimeConstant,
    setTimeConstant,
    getOverload,

    // Connection handlers
    connectMonochromator,
    disconnectMonochromator,
    connectLockIn,
    disconnectLockIn,

    // Measurement handlers
    isMeasuring,
    setIsMeasuring
  };

  return (
    <EquipmentContext.Provider value={value}>
      {children}
    </EquipmentContext.Provider>
  );
}
