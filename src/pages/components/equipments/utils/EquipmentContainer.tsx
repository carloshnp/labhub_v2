import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EquipmentContainerProps {
  children: ReactNode;
  width?: string;
  className?: string;
}

export const EquipmentContainer: React.FC<EquipmentContainerProps> = ({
  children,
  width = 'w-64',
  className,
}) => {
  return (
    <div
      className={cn(
        `${width} m-4 p-4 rounded-xl flex flex-col items-center bg-zinc-800 focus:outline-none`,
        className
      )}
    >
      {children}
    </div>
  );
};
