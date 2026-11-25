import { useState, useEffect } from 'react';
import { useEquipment } from "../../../contexts/EquipmentContext";
import { EquipmentContainer } from "./utils/EquipmentContainer";
import { EquipmentTitle } from "./utils/EquipmentTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartContainer, ChartTooltip, ChartConfig } from "@/components/ui/chart";
import { Line, XAxis, YAxis, CartesianGrid, LineChart } from "recharts";
import { getWaitTime, sleep } from './utils/timeConstantUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Measurement {
  wavelength: number;
  rValues: number[];
  averageR: number;
}

interface IterationState {
  isActive: boolean;
  startWavelength: string;
  endWavelength: string;
  stepSize: string;
  measurementCount: string;
  currentTarget: number | null;
  measurements: Measurement[];
  lastRValue: string;
  waitingForR: boolean;
  currentMeasurementIndex: number;
}

const initialIterationState: IterationState = {
  isActive: false,
  startWavelength: "600",
  endWavelength: "700",
  stepSize: "10",
  measurementCount: "5",
  currentTarget: null,
  measurements: [],
  lastRValue: "",
  waitingForR: false,
  currentMeasurementIndex: 0,
};

const chartConfig = {
  wavelength: {
    label: "Wavelength (nm)",
    theme: {
      light: "hsl(142.1 76.2% 36.3%)",
      dark: "hsl(142.1 70.6% 45.3%)",
    },
  },
  averageR: {
    label: "Average R",
    theme: {
      light: "hsl(142.1 76.2% 36.3%)",
      dark: "hsl(142.1 70.6% 45.3%)",
    },
  },
} satisfies ChartConfig;

const TIME_CONSTANT_OPTIONS = [
  "1 μs", "3 μs", "10 μs", "30 μs", "100 μs", "300 μs",
  "1 ms", "3 ms", "10 ms", "30 ms", "100 ms", "300 ms",
  "1 s", "3 s", "10 s", "30 s", "100 s", "300 s",
  "1 ks", "3 ks", "10 ks", "30 ks"
];

export const WavelengthIterator: React.FC = () => {
  const {
    isMonochromatorConnected,
    wavelength,
    setIsMeasuring,
    setWavelength,
    getRValue,
    rValue
  } = useEquipment();

  const [iterationState, setIterationState] = useState<IterationState>(initialIterationState);
  const [timeConstant, setTimeConstant] = useState<string>("");
  const [timeAdjustment, setTimeAdjustment] = useState<string>("3");
  const [timeBetweenMeasurements, setTimeBetweenMeasurements] = useState<string>("");
  const [tolerance, setTolerance] = useState<string>("");

  const updateTimeAdjustment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(Number(value)) && Number(value) > 0)) {
      setTimeAdjustment(value);
    }
  };

  const updateTolerance = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numberValue = parseFloat(value);
    if (value === "" || (!isNaN(numberValue) && numberValue >= 0)) {
      setTolerance(value);
    }
  };

  // Monitor wavelength and R value changes
  useEffect(() => {
    const currentWavelength = parseFloat(wavelength);
    
    // Only proceed if we're iterating and have a target
    if (!iterationState.isActive || iterationState.currentTarget === null) return;
    
    // If we've reached our target (with some tolerance for floating point)
    console.log(Math.abs(currentWavelength - iterationState.currentTarget));
    if (Math.abs(currentWavelength - iterationState.currentTarget) < 0.1) {
      if (!iterationState.waitingForR) {
        const handleMeasurement = async () => {
          const adjustmentFactor = parseFloat(timeAdjustment);
          const baseWaitTime = getWaitTime(timeConstant);
          const adjustedWaitTime = baseWaitTime * adjustmentFactor;
          const baseWaitTimeBetweenMeasurements = getWaitTime(timeBetweenMeasurements);

          console.log(adjustedWaitTime);

          // Initial wait after reaching new wavelength
          if (iterationState.currentMeasurementIndex === 0) {
            await sleep(adjustedWaitTime);
          } else {
            await sleep(baseWaitTimeBetweenMeasurements);
          }

          setIterationState(prev => ({
            ...prev,
            waitingForR: true
          }));

          // Take measurement
          await getRValue();
          const currentR = parseFloat(rValue);
          const measurementCount = parseInt(iterationState.measurementCount);
          const currentMeasurementIndex = iterationState.currentMeasurementIndex;

          setIterationState(prev => {            
            const existingMeasurementIndex = prev.measurements.findIndex(m => 
              Math.abs(m.wavelength - currentWavelength) < 0.1
            );

            let newMeasurements = [...prev.measurements];
            
            if (existingMeasurementIndex === -1) {
              newMeasurements.push({
                wavelength: currentWavelength,
                rValues: [currentR],
                averageR: currentR
              });
            } else {
              const measurement = newMeasurements[existingMeasurementIndex];
              let toleranceOverload = false;

              if (measurement.rValues.length !== 0) {
                // const toleranceValue = measurement.averageR * Number(iterationState.tolerance);
                const toleranceValue = Number(tolerance) / 1000;
                const lowerTolerance = measurement.averageR - toleranceValue;
                const upperTolerance = measurement.averageR + toleranceValue;

                if (currentR < lowerTolerance || currentR > upperTolerance) {
                  console.log("Tolerance overload");
                  toleranceOverload = true;
                }
              }

              if (toleranceOverload) {
                newMeasurements[existingMeasurementIndex] = {
                  ...measurement,
                  rValues: []
                };
                return {
                  ...prev,
                  measurements: newMeasurements,
                  currentTarget: prev.currentTarget,
                  currentMeasurementIndex: 0,
                  waitingForR: false
                }
              } else {
                const newRValues = [...measurement.rValues, currentR];
                const averageR = newRValues.reduce((a, b) => a + b) / newRValues.length;
                
                newMeasurements[existingMeasurementIndex] = {
                  ...measurement,
                  rValues: newRValues,
                  averageR
                };
              }
            }

            if (currentMeasurementIndex + 1 < measurementCount) {
              return {
                ...prev,
                measurements: newMeasurements,
                waitingForR: false,
                currentMeasurementIndex: currentMeasurementIndex + 1
              };
            } else {
              if (prev.currentTarget !== null) {
                const next = prev.currentTarget + parseFloat(prev.stepSize);
                if (next <= parseFloat(prev.endWavelength)) {
                  setWavelength(next.toString());
                  return {
                    ...prev,
                    measurements: newMeasurements,
                    currentTarget: next,
                    waitingForR: false,
                    currentMeasurementIndex: 0
                  };
                }
              }
              setIsMeasuring(false);
              return {
                ...iterationState, 
                isActive: false,
                measurements: newMeasurements
              };
            }
          });
        };

        handleMeasurement();
      }
    }
  }, [wavelength, iterationState.isActive, iterationState.currentMeasurementIndex]);

  const startIteration = () => {
    if (!isMonochromatorConnected) return;
    
    const start = parseFloat(iterationState.startWavelength);
    const end = parseFloat(iterationState.endWavelength);
    const stepSize = parseFloat(iterationState.stepSize);
    
    if (isNaN(start) || isNaN(end) || isNaN(stepSize)) {
      console.error("Invalid input values");
      return;
    }

    setIterationState(prev => ({
      ...initialIterationState,
      isActive: true,
      currentTarget: start,
      startWavelength: prev.startWavelength,
      endWavelength: prev.endWavelength,
      stepSize: prev.stepSize,
      measurementCount: prev.measurementCount,
      measurements: [], // Reset measurements when starting new iteration
    }));
    setIsMeasuring(true);
    setWavelength(start.toString());
  };

  const stopIteration = () => {
    setIterationState(prev => ({
      ...iterationState, 
      isActive: false,
      measurements: prev.measurements // Keep measurements when stopping
    }));
    setIsMeasuring(false);
  };

  const updateIterationState = (field: keyof Omit<IterationState, 'isActive' | 'currentTarget' | 'measurements' | 'lastRValue' | 'waitingForR' | 'currentMeasurementIndex'>) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIterationState(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const updateTimeConstant = (value: string) => {
    setTimeConstant(value);
  };

  const updateTimeBetweenMeasurements = (value: string) => {
    setTimeBetweenMeasurements(value);
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Wavelength (nm)', 'Average R', 'Measurements', 'Time Constant', 'Time Multiplier'];
    const rows = iterationState.measurements.map(measurement => [
      measurement.wavelength,
      measurement.averageR.toFixed(6),
      measurement.rValues.map(v => v.toFixed(6)).join(';'),
      timeConstant,
      timeAdjustment
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wavelength_measurements_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <EquipmentContainer width="w-full">
      <div className="w-full flex gap-4">
        <div className='flex flex-col h-full'>
          <EquipmentTitle title="Photoluminescence" />
          <Card className="w-fit">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="start">Start Wavelength (nm)</Label>
                  <Input
                    id="start"
                    type="number"
                    value={iterationState.startWavelength}
                    onChange={updateIterationState('startWavelength')}
                    disabled={!isMonochromatorConnected || iterationState.isActive}
                    className="bg-[#F5F5F5] text-black"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="end">End Wavelength (nm)</Label>
                  <Input
                    id="end"
                    type="number"
                    value={iterationState.endWavelength}
                    onChange={updateIterationState('endWavelength')}
                    disabled={!isMonochromatorConnected || iterationState.isActive}
                    className="bg-[#F5F5F5] text-black"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="step">Step Size (nm)</Label>
                  <Input
                    id="step"
                    type="number"
                    value={iterationState.stepSize}
                    onChange={updateIterationState('stepSize')}
                    disabled={!isMonochromatorConnected || iterationState.isActive}
                    className="bg-[#F5F5F5] text-black"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="measurementCount">Measurements per Wavelength</Label>
                  <Input
                    id="measurementCount"
                    type="number"
                    value={iterationState.measurementCount}
                    onChange={updateIterationState('measurementCount')}
                    disabled={!isMonochromatorConnected || iterationState.isActive}
                    className="bg-[#F5F5F5] text-black"
                    min="1"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="timeConstant">Time Constant</Label>
                  <Select
                    value={timeConstant}
                    onValueChange={updateTimeConstant}
                    disabled={!isMonochromatorConnected || iterationState.isActive}
                  >
                    <SelectTrigger className="bg-[#F5F5F5] text-black">
                      <SelectValue placeholder="Select Time Constant" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_CONSTANT_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="timeAdjustment">Time Constant Multiplier</Label>
                  <Input
                    id="timeAdjustment"
                    type="number"
                    value={timeAdjustment}
                    onChange={updateTimeAdjustment}
                    className="bg-[#F5F5F5] text-black"
                    min="0.1"
                    step="0.1"
                    placeholder="6"
                    disabled={!isMonochromatorConnected || iterationState.isActive}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="timeConstant">Time Between Measurements</Label>
                  <Select
                    value={timeBetweenMeasurements}
                    onValueChange={updateTimeBetweenMeasurements}
                    disabled={!isMonochromatorConnected || iterationState.isActive}
                  >
                    <SelectTrigger className="bg-[#F5F5F5] text-black">
                      <SelectValue placeholder="Select Time Between Measurements" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_CONSTANT_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="tolerance">Tolerance</Label>
                  <Input
                    id="tolerance"
                    type="number"
                    value={tolerance}
                    onChange={updateTolerance}
                    disabled={!isMonochromatorConnected || iterationState.isActive}
                    className="bg-[#F5F5F5] text-black"
                    min="0"
                  />
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Label className="text-[#F5F5F5] font-montserrat">Current Wavelength</Label>
                  <div className="text-2xl font-semibold text-[#F5F5F5] font-montserrat">{wavelength} nm</div>
                  <div className="text-lg font-semibold text-[#F5F5F5] font-montserrat">
                    R: {rValue}
                    {iterationState.isActive && (
                      <span className="text-sm ml-2">
                        ({iterationState.currentMeasurementIndex + 1}/{iterationState.measurementCount})
                      </span>
                    )}
                  </div>
                  {iterationState.currentTarget !== null && (
                    <Label className="text-sm text-[#F5F5F5] font-montserrat">
                      Target: {iterationState.currentTarget.toFixed(2)} nm
                    </Label>
                  )}
                </div>
                <div className="flex justify-center pt-2">
                  {!iterationState.isActive ? (
                    <Button 
                      onClick={startIteration}
                      disabled={!isMonochromatorConnected}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Start Iteration
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopIteration}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Stop Iteration
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-1/2 h-full flex-1">
          <Card className="flex-1 h-full">
            <CardContent className="pt-6 h-full">
              <Tabs defaultValue="chart" className="w-full h-full">
                <TabsList className="bg-zinc-700/25">
                  <TabsTrigger value="chart" className="text-[#F5F5F5] data-[state=active]:bg-zinc-600">Chart</TabsTrigger>
                  <TabsTrigger value="data" className="text-[#F5F5F5] data-[state=active]:bg-zinc-600">Data</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                  <ChartContainer config={chartConfig}>
                    <LineChart
                      data={iterationState.measurements}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="wavelength"
                        type="number"
                        domain={['auto', 'auto']}
                        label={{ value: 'Wavelength (nm)', position: 'bottom', style: { fill: '#FFFFFF' } }}
                        tick={{ fill: '#FFFFFF' }}
                      />
                      <YAxis
                        dataKey="averageR"
                        label={{ value: 'Average R', angle: -90, position: 'left', style: { fill: '#FFFFFF' } }}
                        domain={['auto', 'auto']}
                        tick={{ fill: '#FFFFFF' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="averageR"
                        stroke="#3b82f6"
                        dot={{ fill: '#3b82f6' }}
                      />
                      <ChartTooltip
                        content={({active, payload}) => {
                          if (active && payload && payload.length > 0) {
                            const measurement = payload[0].payload;
                            return (
                              <div className="bg-zinc-900 p-2 rounded-md text-sm">
                                <div className="flex">
                                  <p className="text-[#F5F5F5] font-medium mr-1">Wavelength: </p>
                                  <p className="text-[#F5F5F5]">{measurement.wavelength} nm</p>
                                </div>
                                <div className="flex">
                                  <p className="text-[#F5F5F5] font-medium mr-1">Average R: </p>
                                  <p className="text-[#F5F5F5]">{measurement.averageR.toFixed(6)}</p>
                                </div>
                                <div className="flex">
                                  <p className="text-[#F5F5F5] font-medium mr-1">Measurements: </p>
                                  <p className="text-[#F5F5F5]">{measurement.rValues.map((v: number) => v.toFixed(6)).join(', ')}</p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </LineChart>
                  </ChartContainer>
                </TabsContent>
                <TabsContent value="data">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleExportCSV}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Save to CSV
                      </Button>
                    </div>
                    <div className="rounded-md border border-zinc-700/25">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-zinc-700/25">
                            <TableHead className="text-[#F5F5F5]">Wavelength (nm)</TableHead>
                            <TableHead className="text-[#F5F5F5]">Average R</TableHead>
                            <TableHead className="text-[#F5F5F5]">Measurements</TableHead>
                            <TableHead className="text-[#F5F5F5]">Time Constant</TableHead>
                            <TableHead className="text-[#F5F5F5]">Time Multiplier</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {iterationState.measurements.map((measurement, index) => (
                            <TableRow key={index} className="hover:bg-zinc-700/25">
                              <TableCell className="text-[#F5F5F5]">{measurement.wavelength}</TableCell>
                              <TableCell className="text-[#F5F5F5]">{measurement.averageR.toFixed(6)}</TableCell>
                              <TableCell className="text-[#F5F5F5] max-w-[200px] truncate">
                                {measurement.rValues.map(v => v.toFixed(6)).join(', ')}
                              </TableCell>
                              <TableCell className="text-[#F5F5F5]">{timeConstant}</TableCell>
                              <TableCell className="text-[#F5F5F5]">{timeAdjustment}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </EquipmentContainer>
  );
};
