import React, { useState, useRef, useEffect, ReactNode, ReactElement } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Interface for SlideGroupItem props
interface SlideGroupItemProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

// Interface for SlideGroup props
interface SlideGroupProps {
  children: ReactNode;
  showArrows?: boolean;
  activeSelection?: boolean;
  align?: 'start' | 'center' | 'end';
}

// The SlideGroupItem component that wraps each item
const SlideGroupItem: React.FC<SlideGroupItemProps> = ({ 
  children, 
  active = false, 
  onClick 
}) => {
  return (
    <div
      className={`flex-shrink-0 transition-all duration-300 cursor-pointer p-1 `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// The main SlideGroup component
const SlideGroup: React.FC<SlideGroupProps> = ({ 
  children, 
  showArrows = true, 
  activeSelection = false,
  align = 'start',
}) => {
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if scrolling is needed and update arrow visibility
  const checkForScrolling = (): void => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    // Show left arrow if we're not at the beginning
    setShowLeftArrow(scrollLeft > 10);
    
    // Show right arrow if we're not at the end
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Initialize and add resize observer
  useEffect(() => {
    if (scrollRef.current) {
      checkForScrolling();
      
      // Add scroll event listener
      scrollRef.current.addEventListener('scroll', checkForScrolling);
      
      // Add resize observer to check when window/container size changes
      const resizeObserver = new ResizeObserver(() => {
        checkForScrolling();
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      
      // Cleanup
      return () => {
        if (scrollRef.current) {
          scrollRef.current.removeEventListener('scroll', checkForScrolling);
        }
        resizeObserver.disconnect();
      };
    }
  }, []);
  
  // Check for scrolling after children render or change
  useEffect(() => {
    checkForScrolling();
  }, [children]);

  // Handle scroll buttons
  const scroll = (direction: 'left' | 'right'): void => {
    if (!scrollRef.current) return;
    
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
    
    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  // Handle item click for active selection
  const handleItemClick = (index: number): void => {
    if (activeSelection) {
      setActiveIndex(index);
    }
  };

  // Wrap children with SlideGroupItem and add active state if needed
  const wrappedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      // TypeScript type guard to check if child is a SlideGroupItem
      const isSlideGroupItem = (
        child: ReactElement
      ): child is ReactElement<SlideGroupItemProps> =>
        (child.type as any) === SlideGroupItem;

      // If the child is already a SlideGroupItem, just add props
      if (isSlideGroupItem(child)) {
        return React.cloneElement(child, {
          active: activeSelection && index === activeIndex,
          onClick: () => handleItemClick(index)
        });
      }
      
      // Otherwise wrap it in a SlideGroupItem
      return (
        <SlideGroupItem
          active={activeSelection && index === activeIndex}
          onClick={() => handleItemClick(index)}
        >
          {child}
        </SlideGroupItem>
      );
    }
    return child;
  });

  return (
    <div className={`relative`} ref={containerRef}>
      {/* Left navigation arrow */}
      {showArrows && showLeftArrow && (
        <div 
          className="absolute left-[-5px] top-0 z-10 h-full flex items-center"
          onClick={() => scroll('left')}
        >
          <div className="btn-primary shadow-md rounded-md p-1 cursor-pointer">
            <ChevronLeft size={24}/>
          </div>
        </div>
      )}
      
      {/* Scrollable container */}
      <div 
        className={`flex overflow-x-auto scrollbar-hide scroll-smooth ${align === 'center' ? 'justify-center' : ''} ${align === 'end' ? 'justify-end' : ''}`}
        ref={scrollRef}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {wrappedChildren}
      </div>
      
      {/* Right navigation arrow */}
      {showArrows && showRightArrow && (
        <div 
          className="absolute right-[-5px] top-0 z-10 h-full flex items-center"
          onClick={() => scroll('right')}
        >
          <div className="btn-primary shadow-md rounded-md p-1 cursor-pointer">
            <ChevronRight size={24}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideGroup;