import { ConnectionToggle } from "./utils/ConnectionToggle";
import { EquipmentContainer } from "./utils/EquipmentContainer";
import { EquipmentTitle } from "./utils/EquipmentTitle";
import { EquipmentDisplay } from "./utils/EquipmentDisplay";
import { useEquipment } from "../../../contexts/EquipmentContext";

// Available sensitivity options
const SENSITIVITY_OPTIONS = [
  "1 V", "500 mV", "200 mV", "100 mV", "50 mV", "20 mV", "10 mV",
  "5 mV", "2 mV", "1 mV", "500 μV", "200 μV", "100 μV", "50 μV",
  "20 μV", "10 μV", "5 μV", "2 μV", "1 μV"
];

// Available time constant options
const TIME_CONSTANT_OPTIONS = [
  "1 μs", "3 μs", "10 μs", "30 μs", "100 μs", "300 μs",
  "1 ms", "3 ms", "10 ms", "30 ms", "100 ms", "300 ms",
  "1 s", "3 s", "10 s", "30 s", "100 s", "300 s",
  "1 ks", "3 ks", "10 ks", "30 ks"
];

export const LockInControl = () => {
  const {
    isLockInConnected,
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
    connectLockIn,
    disconnectLockIn
  } = useEquipment();

  const handleSetToggle = async (connected: boolean): Promise<boolean> => {
    try {
      if (connected) {
        await connectLockIn();
        return true;
      } else {
        await disconnectLockIn();
        return true;
      }
    } catch (error) {
      console.error('Error toggling lock-in connection:', error);
      return false;
    }
  };

  return (
    <EquipmentContainer>
      <ConnectionToggle onToggle={handleSetToggle} />
      <EquipmentTitle title={'Lock-in Amplifier'} />
      <div className="flex flex-col items-center">
        <EquipmentDisplay
          command_name="R Value"
          command_value={rValue}
          onGetValue={getRValue}
          isConnected={isLockInConnected}
          readOnly={true}
        />
        <EquipmentDisplay
          command_name="Sensitivity"
          command_value={sensitivity}
          onValueChange={(value) => setSensitivity(value.toString())}
          onGetValue={getSensitivity}
          onSetValue={(value) => setSensitivity(value.toString())}
          isConnected={isLockInConnected}
          useDropdown={true}
          dropdownOptions={SENSITIVITY_OPTIONS}
        />
        <EquipmentDisplay
          command_name="Time Constant"
          command_value={timeConstant}
          onValueChange={(value) => setTimeConstant(value.toString())}
          onGetValue={getTimeConstant}
          onSetValue={(value) => setTimeConstant(value.toString())}
          isConnected={isLockInConnected}
          useDropdown={true}
          dropdownOptions={TIME_CONSTANT_OPTIONS}
        />
        <EquipmentDisplay
          command_name="Overload Status"
          command_value={overload}
          onGetValue={getOverload}
          isConnected={isLockInConnected}
          readOnly={true}
        />
      </div>
    </EquipmentContainer>
  );
};