import { useState } from "react";
import { useEquipment } from "../../../contexts/EquipmentContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

interface PLMeasurementResult {
  wavelength_target: number;
  R_average: number;
  R_list: number[];
  sensitivity: string;
  overload: string;
  time_constant: string;
  time_between_measures: number;
  number_of_measures: number;
  tolerance: number;
}

interface MeasurementResult {
  wavelength: number;
  average: number;
  standardDeviation: number;
  isValid: boolean;
  measurements: number[];
}

export const PLMeasurement = () => {
  const {
    isMonochromatorConnected,
    isLockInConnected,
    wavelength,
    rValue,
    sensitivity,
    timeConstant,
    overload,
    setWavelength,
    setSensitivity,
    getRValue,
    getOverload,
  } = useEquipment();

  // Form state
  const [startWavelength, setStartWavelength] = useState("400");
  const [endWavelength, setEndWavelength] = useState("800");
  const [wavelengthStep, setWavelengthStep] = useState("10");
  const [numberOfAverages, setNumberOfAverages] = useState("10");
  const [constantTime, setConstantTime] = useState("1");
  const [tolerance, setTolerance] = useState("0.1");
  
  // Measurement state
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementResults, setMeasurementResults] = useState<MeasurementResult[]>([]);
  const [currentWavelength, setCurrentWavelength] = useState<number | null>(null);
  const [currentMeasures, setCurrentMeasures] = useState<number[]>([]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const adjustSensitivity = async (value: number) => {
    const sensitivityValues = [
      "1 V", "500 mV", "200 mV", "100 mV", "50 mV", "20 mV", "10 mV",
      "5 mV", "2 mV", "1 mV", "500 μV", "200 μV", "100 μV", "50 μV",
      "20 μV", "10 μV", "5 μV", "2 μV", "1 μV"
    ];
    
    const currentIndex = sensitivityValues.indexOf(sensitivity);
    if (value >= 4 && currentIndex > 0) {
      // Signal too strong, increase sensitivity range
      await setSensitivity(sensitivityValues[currentIndex - 1]);
    } else if (value <= 0 && currentIndex < sensitivityValues.length - 1) {
      // Signal too weak, decrease sensitivity range
      await setSensitivity(sensitivityValues[currentIndex + 1]);
    }
  };

  const calculateAverage = (values: number[]) => {
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  };

  const isWithinTolerance = (values: number[], tolerance: number) => {
    const avg = calculateAverage(values);
    return values.every(v => Math.abs(v - avg) / avg <= tolerance);
  };

  const performMeasurement = async () => {
    if (!isMeasuring) return;

    try {
      const currentWavelength = parseFloat(startWavelength) + parseFloat(wavelengthStep);
      
      if (currentWavelength <= parseFloat(endWavelength)) {
        // Set wavelength
        await setWavelength(currentWavelength);
        setWavelengthStep(String(parseFloat(wavelengthStep) + parseFloat(wavelengthStep)));

        // Collect measurements
        const measurements: number[] = [];
        let retryCount = 0;
        
        while (measurements.length < parseInt(numberOfAverages) && retryCount < 3) {
          // Get R value and check sensitivity
          await getRValue();
          await getOverload();
          const currentR = parseFloat(rValue);
          await adjustSensitivity(currentR);

          measurements.push(currentR);
          
          // Wait specified time between measurements
          await sleep(parseFloat(constantTime) * 3);
        }

        // Calculate average and standard deviation
        const average = measurements.reduce((a, b) => a + b, 0) / measurements.length;
        const stdDev = Math.sqrt(
          measurements.reduce((sq, n) => sq + Math.pow(n - average, 2), 0) / 
          (measurements.length - 1)
        );

        // Check if measurement is within tolerance
        const toleranceValue = parseFloat(tolerance);
        const isValid = (stdDev / average) <= toleranceValue;

        const result: MeasurementResult = {
          wavelength: currentWavelength,
          average,
          standardDeviation: stdDev,
          isValid,
          measurements
        };

        setMeasurementResults(prev => [...prev, result]);
        console.log("Measurement at wavelength", currentWavelength, ":", result);
        
        // Schedule next measurement
        setTimeout(performMeasurement, 0);
      } else {
        setIsMeasuring(false);
        console.log("Final measurement results:", measurementResults);
      }
    } catch (error) {
      console.error("Error during measurement:", error);
      setIsMeasuring(false);
    }
  };

  const startMeasurement = () => {
    setIsMeasuring(true);
    setWavelengthStep("0");
    setMeasurementResults([]);
    console.log("Starting new measurement...");
    performMeasurement();
  };

  const stopMeasurement = () => {
    setIsMeasuring(false);
    console.log("Measurement stopped. Partial results:", measurementResults);
  };

  return (
    <Card className="w-fit flex flex-col">
      <CardHeader>
        <CardTitle>PL Measurement</CardTitle>
        <CardDescription>Configure and control PL measurements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startWavelength">Start Wavelength (nm)</Label>
            <Input
              id="startWavelength"
              value={startWavelength}
              onChange={(e) => setStartWavelength(e.target.value)}
              disabled={isMeasuring}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endWavelength">End Wavelength (nm)</Label>
            <Input
              id="endWavelength"
              value={endWavelength}
              onChange={(e) => setEndWavelength(e.target.value)}
              disabled={isMeasuring}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wavelengthStep">Wavelength Step (nm)</Label>
            <Input
              id="wavelengthStep"
              value={wavelengthStep}
              onChange={(e) => setWavelengthStep(e.target.value)}
              disabled={isMeasuring}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfAverages">Number of Averages</Label>
            <Input
              id="numberOfAverages"
              value={numberOfAverages}
              onChange={(e) => setNumberOfAverages(e.target.value)}
              disabled={isMeasuring}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="constantTime">Time Between Measures (s)</Label>
            <Input
              id="constantTime"
              value={constantTime}
              onChange={(e) => setConstantTime(e.target.value)}
              disabled={isMeasuring}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tolerance">Tolerance</Label>
            <Input
              id="tolerance"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              disabled={isMeasuring}
            />
          </div>
        </div>

        {currentWavelength !== null && (
          <div className="mt-4 space-y-2">
            <p>Current Wavelength: {currentWavelength} nm</p>
            <p>Current Measures: {currentMeasures.join(", ")}</p>
            <p>Current Sensitivity: {sensitivity}</p>
            <p>Overload Status: {overload}</p>
          </div>
        )}

        {measurementResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Results</h3>
            <pre className="mt-2 p-4 bg-zinc-100 rounded overflow-auto">
              {JSON.stringify(measurementResults, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {!isMeasuring ? (
          <Button
            onClick={startMeasurement}
            disabled={!isMonochromatorConnected || !isLockInConnected}
          >
            Start Measurement
          </Button>
        ) : (
          <Button onClick={stopMeasurement} variant="destructive">
            Stop Measurement
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
