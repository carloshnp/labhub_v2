import React from 'react';
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EquipmentToolbox } from './EquipmentToolbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EquipmentDisplayProps {
  command_name: string;
  command_value: string | number;
  className?: string;
  onValueChange?: (value: string | number) => void;
  onGetValue?: () => Promise<void>;
  onSetValue?: (value: string | number) => Promise<void>;
  isConnected?: boolean;
  readOnly?: boolean;
  useDropdown?: boolean;
  dropdownOptions?: string[];
}

export const EquipmentDisplay: React.FC<EquipmentDisplayProps> = ({
  command_name,
  command_value,
  className = "",
  onValueChange,
  onGetValue,
  onSetValue,
  isConnected = false,
  readOnly = false,
  useDropdown = false,
  dropdownOptions = [],
}) => {
  const triggerClassName = `w-36 h-28 m-4 rounded-[10px] bg-zinc-700/25 ${
    !readOnly && isConnected ? "hover:ease-in-out hover:duration-200 hover:bg-zinc-700/50 cursor-pointer" : "cursor-default"
  } flex flex-col justify-center items-center focus:outline-none ${className}`;

  if (readOnly || !isConnected) {
    return (
      <div className={triggerClassName}>
        <Label className="text-[#F5F5F5] text-center font-montserrat text-base font-normal">
          {command_name}
        </Label>
        <Label className="text-[#F5F5F5] text-center font-montserrat text-3xl font-normal mt-1">
          {command_value}
        </Label>
      </div>
    );
  }

  if (useDropdown) {
    return (
      <div className={triggerClassName}>
        <Label className="text-[#F5F5F5] text-center font-montserrat text-base font-normal">
          {command_name}
        </Label>
        <Select
          disabled={!isConnected || readOnly}
          value={command_value.toString()}
          onValueChange={(value) => {
            onValueChange?.(value);
            onSetValue?.(value);
          }}
        >
          <SelectTrigger className="w-fit bg-transparent border-none text-[#F5F5F5] text-center font-montserrat text-3xl font-normal mt-1 focus:outline-none outline-none">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {dropdownOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger className={triggerClassName}>
        <Label className="text-[#F5F5F5] text-center font-montserrat text-base font-normal">
          {command_name}
        </Label>
        <Label className="text-[#F5F5F5] text-center font-montserrat text-3xl font-normal mt-1">
          {command_value}
        </Label>
      </PopoverTrigger>
      <PopoverContent className="w-36">
        <EquipmentToolbox
          value={command_value}
          onValueChange={onValueChange}
          onGetValue={onGetValue}
          onSetValue={onSetValue}
        />
      </PopoverContent>
    </Popover>
  );
};