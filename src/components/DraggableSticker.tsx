import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { LucideIcon, RotateCcw, Trash2 } from 'lucide-react'; // Import trash icon

interface DraggableStickerProps {
  id: string;
  type: string;
  color: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  containerWidth: number;
  containerHeight: number;
  icon? : LucideIcon;
  animation: string;
  isImage?: boolean;
  imageSrc?: string;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onRotationChange: (id: string, rotation: number) => void;
  onScaleChange: (id: string, scale: number) => void;
  onDelete: (id: string) => void;
  isGlobal?: boolean;
}

const DraggableSticker: React.FC<DraggableStickerProps> = ({
  id,
  color,
  position,
  rotation,
  scale,
  containerWidth,
  containerHeight,
  icon: Icon,
  animation,
  isImage,
  imageSrc,
  onPositionChange,
  onRotationChange,
  onScaleChange,
  onDelete,
  isGlobal,
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Add a ref to the outer container
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    setIsMobile(checkMobile());
  }, []);

  // Convert percentage to absolute pixel position
  const getPixelPosition = () => {
    return {
      x: isGlobal 
        ? (position.x / 100) * containerWidth 
        : (position.x / 100) * containerWidth,
      y: isGlobal 
        ? (position.y / 100) * containerHeight 
        : (position.y / 100) * containerHeight
    };
  };

  // Base size for stickers
  const baseSize = 40;
  const size = baseSize * scale;
  
  // Current position in pixels
  const pixelPosition = getPixelPosition();

  // Handle outside clicks to deselect sticker
  useEffect(() => {
    const handleUnselectStickers = () => {
      setIsSelected(false);
    };
    
    document.addEventListener('unselectStickers', handleUnselectStickers);
    
    return () => {
      document.removeEventListener('unselectStickers', handleUnselectStickers);
    };
  }, []);

  // Handle key presses for deleting with Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSelected && (e.key === 'Delete' || e.key === 'Backspace')) {
        onDelete(id);
      }
    };

    if (isSelected) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelected, id, onDelete]);

  return (
    <div ref={containerRef} className="relative" style={{ position: 'absolute', left: 0, top: 0, width: containerWidth, height: containerHeight }}>
      <Rnd
        position={{ x: pixelPosition.x, y: pixelPosition.y }}
        size={{ width: size, height: size }}
        maxWidth={containerWidth * 0.8} // Limit max size to prevent oversized stickers
        maxHeight={containerHeight * 0.8}
        onDragStart={() => {
          setIsSelected(true);
        }}
        onDragStop={(_, d) => {
          if (isRotating) return;
          
          // Convert from pixels back to percentage
          const newX = (d.x / containerWidth) * 100;
          const newY = (d.y / containerHeight) * 100;
          
          onPositionChange(id, { x: newX, y: newY });
        }}
        dragHandleClassName="sticker-drag-handle"
        
        resizeHandleStyles={{
          bottomRight: {
            width: '18px',
            height: '18px',
            right: '-9px',
            bottom: '-9px',
            background: 'white',
            borderRadius: '50%',
            border: '2px solid #FF90B3',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            cursor: 'nwse-resize',
            zIndex: 20,
            display: isSelected ? 'block' : 'none',
          },
          bottomLeft: {
            width: '18px',
            height: '18px',
            left: '-9px',
            bottom: '-9px',
            background: 'white',
            borderRadius: '50%',
            border: '2px solid #FF90B3',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            cursor: 'nesw-resize',
            zIndex: 20,
            display: isSelected ? 'block' : 'none',
          },
          topRight: {
            width: '18px',
            height: '18px',
            right: '-9px',
            top: '-9px',
            background: 'white',
            borderRadius: '50%',
            border: '2px solid #FF90B3',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            cursor: 'nesw-resize',
            zIndex: 20,
            display: isSelected ? 'block' : 'none',
          },
          topLeft: {
            width: '18px',
            height: '18px',
            left: '-9px',
            top: '-9px',
            background: 'white',
            borderRadius: '50%',
            border: '2px solid #FF90B3',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            cursor: 'nwse-resize',
            zIndex: 20,
            display: isSelected ? 'block' : 'none',
          },
        }}
        
        enableResizing={{
          bottomRight: isSelected,
          bottomLeft: isSelected,
          topRight: isSelected,
          topLeft: isSelected,
          top: false,
          right: false,
          bottom: false,
          left: false,
        }}
        
        onResizeStart={() => {
          setIsSelected(true);
        }}
        
        onResizeStop={(_, _direction, ref, _delta, position) => {
          // Calculate new scale based on size
          const newScale = ref.offsetWidth / baseSize;
          onScaleChange(id, newScale);
          
          // Also update position since resizing might move the element
          const newX = (position.x / containerWidth) * 100;
          const newY = (position.y / containerHeight) * 100;
          onPositionChange(id, { x: newX, y: newY });
        }}
        
        style={{
          zIndex: isSelected || isHovered ? 100 : 10,
        }}
        
        className="sticker"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation(); // Prevent click from reaching document body
          setIsSelected(true);
        }}
        bounds="parent"
      >
        <div 
          className="sticker-drag-handle w-full h-full flex items-center justify-center cursor-grab"
          style={{ 
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <div className={`flex items-center justify-center ${isSelected || isHovered ? '' : `sticker-${animation}`}`}>
          {isImage ? (
              <img 
                src={imageSrc} 
                alt="sticker" 
                className="w-full h-full object-contain" 
                draggable={false}
              />
            ) : (
              Icon && <Icon size={size * 0.8} color={color} />
            )}
          </div>
          
          {/* Highlight outline when selected or hovered */}
          <div 
            className={`absolute inset-0 rounded-md pointer-events-none ${
              isSelected ? 'outline outline-2 outline-offset-2 outline-cute-pink' : 
              isHovered ? 'outline outline-2 outline-dashed outline-offset-2 outline-cute-pink' : ''
            }`}
          />
          
          {/* Desktop delete instructions */}
          {isSelected && !isMobile && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-sm border border-gray-200 delete-instruction">
              Press Delete to remove
            </div>
          )}
        </div>
      </Rnd>

      {/* Mobile Controls - Positioned OUTSIDE the Rnd component */}
      {isSelected && (
        <>
          {/* Rotation control - works on both desktop and mobile */}
          <div
            className="absolute cursor-pointer rotation-handle"
            style={{ 
              top: pixelPosition.y - 40,
              left: pixelPosition.x + size/2 - 20,
              zIndex: 1000
            }}
            onMouseDown={handleRotationStart}
            onTouchStart={handleRotationStart}
          >
            <div className="w-10 h-10 bg-white rounded-full border-2 border-cute-pink flex items-center justify-center shadow-md">
              <RotateCcw size={20} className="text-cute-pink" />
            </div>
            <div className="w-2 h-10 bg-cute-pink absolute -bottom-9 left-1/2 transform -translate-x-1/2"></div>
          </div>
          
          {/* Mobile delete button */}
          {isMobile && (
            <div 
              className="absolute bg-red-500 text-white p-2.5 rounded-full z-50 shadow-lg"
              style={{
                top: pixelPosition.y - 16,
                left: pixelPosition.x + size - 8,
                zIndex: 1000
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(id);
              }}
            >
              <Trash2 size={18} />
            </div>
          )}
        </>
      )}
    </div>
  );
  
  // Add this function to handle both mouse and touch events
  function handleRotationStart(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);
    
    const stickerEl = containerRef.current;
    if (!stickerEl) return;
    
    const rect = stickerEl.getBoundingClientRect();
    const centerX = pixelPosition.x + size/2;
    const centerY = pixelPosition.y + size/2;
    
    const handleRotateMove = (moveEvent: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      
      if ('touches' in moveEvent) {
        clientX = moveEvent.touches[0].clientX;
        clientY = moveEvent.touches[0].clientY;
      } else {
        clientX = moveEvent.clientX;
        clientY = moveEvent.clientY;
      }
      
      const dx = clientX - rect.left - centerX;
      const dy = clientY - rect.top - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      onRotationChange(id, angle);
    };
    
    const handleRotateEnd = () => {
      document.removeEventListener('mousemove', handleRotateMove);
      document.removeEventListener('touchmove', handleRotateMove as EventListenerOrEventListenerObject);
      document.removeEventListener('mouseup', handleRotateEnd);
      document.removeEventListener('touchend', handleRotateEnd);
      setIsRotating(false);
    };
    
    document.addEventListener('mousemove', handleRotateMove);
    document.addEventListener('touchmove', handleRotateMove as EventListenerOrEventListenerObject);
    document.addEventListener('mouseup', handleRotateEnd);
    document.addEventListener('touchend', handleRotateEnd);
  }
};

export default DraggableSticker;