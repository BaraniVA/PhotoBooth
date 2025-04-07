import React from 'react';

// Import your sticker images
import sticker1 from '../assets/stickers/image_fx (1).png';
import sticker2 from '../assets/stickers/image_fx (2).png';
import sticker3 from '../assets/stickers/image_fx.png';
import sticker4 from '../assets/stickers/image_fx (3).png';
import sticker5 from '../assets/stickers/image_fx (4).png';
import sticker6 from '../assets/stickers/image_fx (5).png';
import sticker7 from '../assets/stickers/image_fx (6).png';


// Define interface for image stickers
export interface ImageSticker {
  id: string;
  imageSrc: string;
  animation: string;
  name: string;
}

// Export image stickers array
export const IMAGE_STICKERS: ImageSticker[] = [
  { 
    id: 'sticker1',
    name: 'Sticker 1', 
    imageSrc: sticker1, 
    animation: 'bounce' 
  },
  { 
    id: 'sticker2',
    name: 'Sticker 2', 
    imageSrc: sticker2, 
    animation: 'pop' 
  },
  { 
    id: 'sticker3',
    name: 'Sticker 3', 
    imageSrc: sticker3, 
    animation: 'shine' 
  },
  { 
    id: 'sticker4',
    name: 'Sticker 4', 
    imageSrc: sticker4, 
    animation: 'bounce' 
  },
  { 
    id: 'sticker5',
    name: 'Sticker 5', 
    imageSrc: sticker5, 
    animation: 'pop' 
  },
  { 
    id: 'sticker6',
    name: 'Sticker 6', 
    imageSrc: sticker6, 
    animation: 'shine' 
  },
  { 
    id: 'sticker7',
    name: 'Sticker 7', 
    imageSrc: sticker7, 
    animation: 'shine' 
  },
  // Add more stickers as needed
];

// Create a component for displaying selectable image stickers
const ImageStickerSelector: React.FC<{
  onStickerSelect: (id: string, imageSrc: string) => void;
}> = ({ onStickerSelect }) => {
  return (
    <div>
      <h3 className="text-center text-lg font-medium text-soft-charcoal mb-2 mt-4">Image Stickers</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {IMAGE_STICKERS.map(sticker => (
          <div
            key={sticker.id}
            draggable
            onDragStart={() => onStickerSelect(sticker.id, sticker.imageSrc)}
            className={`p-1 rounded-lg bg-white shadow-kawaii button-bounce sticker-${sticker.animation} cursor-grab`}
          >
            <img 
              src={sticker.imageSrc} 
              alt={sticker.name} 
              className="w-10 h-10 object-contain" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageStickerSelector;