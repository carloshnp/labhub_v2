import { ConnectionToggle } from "./ConnectionToggle";
import { EquipmentContainer } from "./EquipmentContainer";
import { EquipmentTitle } from "./EquipmentTitle";

export const MonochromatorControl = () => {
//   const { equipmentStates, executeMethod } = useEquipment();
//   const equipmentName = 'monochromator';
//   const config = equipmentConfig[equipmentName];

//   const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
//   const [wavelength, setWavelength] = useState<string>('');
//   const [grat, setGrat] = useState<string>('');
//   const [isToolboxOpen, setIsToolboxOpen] = useState(false);
//   const [isVaryingWavelength, setIsVaryingWavelength] = useState(false);

//   useEffect(() => {
//     console.log('ok')
//   }, []);

//   const handleSetWavelength = async (value: string) => {
//     const setResponse = await executeMethod(equipmentName, 'setWavelength', { wavelength: Number(value) });
//     console.log(setResponse);
//     setToast({ message: setResponse.detail || 'Wavelength set', type: 'info' });
    
//     const getResponse = await executeMethod(equipmentName, 'getWavelength', {});
//     console.log(getResponse);
//     if (getResponse.get_wavelength !== undefined) {
//       setWavelength(getResponse.get_wavelength);
//     }
//     setToast({ message: getResponse.detail || 'Wavelength updated', type: 'info' });
//   };

  const handleSetToggle = () => {
    return true
  }

  return (
    <EquipmentContainer>
      <ConnectionToggle onToggle={handleSetToggle} />
      <EquipmentTitle title={'Monochromator'} />
    </EquipmentContainer>
  )

//   return (
//     <EquipmentContainer>
//       <ConnectionToggle onToggle={handleConnectionToggle} />
//       <EquipmentTitle title={config.name} />
//       <div className="flex items-center">
//         <EquipmentDisplay
//           equipmentName={equipmentName}
//           controlName="setWavelength"
//           label="Wavelength"
//           value={wavelength || equipmentStates[equipmentName]?.wavelength?.toString() || ''}
//           onUpdate={handleSetWavelength}
//         />
//         <Button
//           onClick={() => setIsToolboxOpen(true)}
//           label="Vary"
//           className="ml-2 p-2 bg-blue-500 text-white rounded"
//           disabled={isVaryingWavelength}
//         />
//       </div>
//       <EquipmentDisplay
//         equipmentName={equipmentName}
//         controlName="setGrat"
//         label="Grat"
//         value={grat || equipmentStates[equipmentName]?.grat?.toString() || ''}
//         onUpdate={handleSetGrat}
//       />
//       {isToolboxOpen && (
//         <EquipmentToolbox
//           equipmentName={equipmentName}
//           methodName="varyWavelength"
//           currentValue=""
//           onClose={() => setIsToolboxOpen(false)}
//           onSubmit={handleVaryWavelength}
//         />
//       )}
//       {toast && (
//         <Toast
//           message={toast.message}
//           type={toast.type}
//           onClose={() => setToast(null)}
//         />
//       )}
//     </EquipmentContainer>
//   );
};