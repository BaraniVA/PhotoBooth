import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { RotateCcw } from 'lucide-react';

interface DraggableStickerProps {
  id: string;
  type: string;
  color: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  containerWidth: number;
  containerHeight: number;
  icon: React.ElementType;
  animation: string;
  isImage?: boolean;
  imageSrc?: string;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onRotationChange: (id: string, rotation: number) => void;
  onScaleChange: (id: string, scale: number) => void;
  onDelete: (id: string) => void;
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
  
  onPositionChange,
  onRotationChange,
  onScaleChange,
  onDelete,
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // Convert percentage to absolute pixel position
  const getPixelPosition = () => {
    return {
      x: (position.x / 100) * containerWidth,
      y: (position.y / 100) * containerHeight,
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
    <Rnd
      position={{ x: pixelPosition.x, y: pixelPosition.y }}
      size={{ width: size, height: size }}
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
      onClick={(e) => {
        e.stopPropagation(); // Prevent click from reaching document body
        setIsSelected(true);
      }}
      bounds="parent"
    >
      <div 
        className="sticker-drag-handle w-full h-full flex items-center justify-center cursor-grab"
        style={{ 
          transform: `rotate(${rotation}deg)`,
          // Important: Don't apply animation classes directly here
        }}
      >
        {/* Apply animation to the icon only, not the wrapper */}
        <div className={`flex items-center justify-center ${isSelected || isHovered ? '' : `sticker-${animation}`}`}>
          <Icon size={size * 0.8} color={color} />
        </div>
        
        {/* Rotation handle - only show when selected */}
        {isSelected && (
          <div
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 cursor-pointer rotation-handle"
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsRotating(true);
              
              const stickerEl = e.currentTarget.parentElement?.parentElement;
              if (!stickerEl) return;
              
              const rect = stickerEl.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              
              const handleRotateMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - centerX;
                const dy = moveEvent.clientY - centerY;
                const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                onRotationChange(id, angle);
              };
              
              const handleRotateEnd = () => {
                document.removeEventListener('mousemove', handleRotateMove);
                document.removeEventListener('mouseup', handleRotateEnd);
                setIsRotating(false);
              };
              
              document.addEventListener('mousemove', handleRotateMove);
              document.addEventListener('mouseup', handleRotateEnd);
            }}
          >
            <div className="w-10 h-10 bg-white rounded-full border-2 border-cute-pink flex items-center justify-center shadow-md hover:bg-pink-50 transition-all">
              <RotateCcw size={20} className="text-cute-pink" />
            </div>
            <div className="w-2 h-10 bg-cute-pink absolute -bottom-9 left-1/2 transform -translate-x-1/2"></div>
          </div>
        )}
        
        {/* Highlight outline when selected or hovered */}
        <div 
          className={`absolute inset-0 rounded-md pointer-events-none ${
            isSelected ? 'outline outline-2 outline-offset-2 outline-cute-pink' : 
            isHovered ? 'outline outline-2 outline-dashed outline-offset-2 outline-cute-pink' : ''
          }`}
        />
        
        {/* Delete instructions tooltip - only show when selected */}
        {isSelected && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-sm border border-gray-200 delete-instruction">
            Press Delete to remove
          </div>
        )}
      </div>
    </Rnd>
  );
};

export default DraggableSticker;