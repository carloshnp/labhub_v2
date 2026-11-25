import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface ConnectionToggleProps {
  onToggle: (isConnected: boolean) => Promise<boolean> | boolean;
  defaultConnected?: boolean;
}

export const ConnectionToggle: React.FC<ConnectionToggleProps> = ({
  onToggle,
  defaultConnected = false,
}) => {
  const [isConnected, setIsConnected] = useState(defaultConnected);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newConnectionState = !isConnected;
      const success = await onToggle(newConnectionState);
      if (success) {
        setIsConnected(newConnectionState);
      }
    } catch (error) {
      console.error("Connection toggle failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between w-full mb-4">
      <span className="text-white font-montserrat text-sm font-normal">
        Connection {isLoading ? "(connecting...)" : ""}
      </span>
      <Switch
        checked={isConnected}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        className={`w-[39px] h-[10px] rounded-[10px] relative p-[2px] ${
          isLoading ? "opacity-50 cursor-not-allowed" : "bg-[#D9D9D9]"
        }`}
      >
        <div
          className={`w-[15px] h-[6px] rounded-[10px] absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 ease-in-out ${
            isConnected
              ? "bg-green-500 translate-x-[20px]"
              : "bg-[#E51E1E] translate-x-0"
          }`}
        />
      </Switch>
    </div>
  );
};
