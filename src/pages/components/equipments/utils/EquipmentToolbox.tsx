import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface EquipmentToolboxProps {
  value: string | number;
  onValueChange?: (value: string | number) => void;
  onGetValue?: () => Promise<void>;
  onSetValue?: (value: string | number) => Promise<void>;
}

export const EquipmentToolbox: React.FC<EquipmentToolboxProps> = ({
  value,
  onValueChange,
  onGetValue,
  onSetValue
}) => {
  const [inputValue, setInputValue] = useState(value.toString())
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numValue = Number(inputValue)
    const finalValue = isNaN(numValue) ? inputValue : numValue
    
    if (onValueChange) {
      onValueChange(finalValue)
    }
    
    if (onSetValue) {
      setIsLoading(true)
      try {
        await onSetValue(finalValue)
      } catch (error) {
        console.error('Error setting value:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleGet = async () => {
    if (onGetValue) {
      setIsLoading(true)
      try {
        await onGetValue()
      } catch (error) {
        console.error('Error getting value:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="w-fit">
      <div className="grid gap-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="col-span-2 h-8"
            disabled={isLoading}
          />
          <div className="flex gap-1">
            <Button 
              type="submit" 
              size="sm"
              disabled={isLoading}
              className="flex-1"
            >
              Set
            </Button>
            <Button 
              type="button" 
              size="sm"
              onClick={handleGet}
              disabled={isLoading}
              className="flex-1"
            >
              Get
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}