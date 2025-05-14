
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ScrollableMenuProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
  showScrollbar?: boolean;
}

const ScrollableMenu: React.FC<ScrollableMenuProps> = ({ 
  children, 
  maxHeight = "350px",
  className = "",
  showScrollbar = true
}) => {
  return (
    <ScrollArea 
      className={cn(`h-full max-h-[${maxHeight}]`, showScrollbar ? 'pr-2' : '', className)}
    >
      <div className={cn("py-2", showScrollbar ? 'pr-3' : '')}>
        {children}
      </div>
    </ScrollArea>
  );
};

export default ScrollableMenu;
