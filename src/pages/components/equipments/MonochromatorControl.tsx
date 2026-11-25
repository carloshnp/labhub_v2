import { ConnectionToggle } from "./utils/ConnectionToggle";
import { EquipmentContainer } from "./utils/EquipmentContainer";
import { EquipmentTitle } from "./utils/EquipmentTitle";
import { EquipmentDisplay } from "./utils/EquipmentDisplay";
import { useEquipment } from "../../../contexts/EquipmentContext";

// Available grating options
const GRATING_OPTIONS = ["1", "2", "3"];

export const MonochromatorControl = () => {
  const {
    isMonochromatorConnected,
    wavelength,
    grating,
    getWavelength,
    setWavelength,
    getGrating,
    setGrating,
    connectMonochromator,
    disconnectMonochromator
  } = useEquipment();

  const handleSetToggle = async (connected: boolean): Promise<boolean> => {
    try {
      if (connected) {
        return await connectMonochromator();
      } else {
        await disconnectMonochromator();
        return true;
      }
    } catch (error) {
      console.error('Error toggling monochromator connection:', error);
      return false;
    }
  };

  return (
    <EquipmentContainer>
      <ConnectionToggle onToggle={handleSetToggle} />
      <EquipmentTitle title={'Monochromator'} />
      <div className="flex flex-col items-center">
        <EquipmentDisplay
          command_name="Wavelength (nm)"
          command_value={wavelength}
          onValueChange={(value) => setWavelength(value)}
          onGetValue={() => getWavelength().then(() => {})}
          onSetValue={setWavelength}
          isConnected={isMonochromatorConnected}
        />
        <EquipmentDisplay
          command_name="Grating"
          command_value={grating}
          onValueChange={(value) => setGrating(value)}
          onGetValue={getGrating}
          onSetValue={setGrating}
          isConnected={isMonochromatorConnected}
          useDropdown={true}
          dropdownOptions={GRATING_OPTIONS}
        />
      </div>
    </EquipmentContainer>
  );
};