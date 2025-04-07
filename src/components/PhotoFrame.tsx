import React from 'react';
import './PhotoFrame.css';

import customFrameImage from '../assets/frames/download.jpeg';
import customFrameImage1 from '../assets/frames/space.jpeg';
import customFrameImage2 from '../assets/frames/forest.jpeg';
import customFrameImage3 from '../assets/frames/pattern.jpeg';
import customFrameImage4 from '../assets/frames/Floral Symphony.jpeg';
import customFrameImage5 from '../assets/frames/glass.jpeg';
export interface BackgroundStyle {
  id: string;
  name: string;
  thumbnail: string;
  backgroundStyle: string;
  className: string;
}

export const BACKGROUND_STYLES: BackgroundStyle[] = [
  {
    id: 'classic-stripes',
    name: 'Pink Stripes',
    thumbnail: '🎀',
    backgroundStyle: `repeating-linear-gradient(
      45deg,
      #FFD6E8 0px,
      #FFD6E8 10px,
      #FFF6F6 10px,
      #FFF6F6 20px
    )`,
    className: ''
  },
  {
    id: 'blue-stripes',
    name: 'Blue Stripes',
    thumbnail: '💙',
    backgroundStyle: `repeating-linear-gradient(
      45deg,
      #D6E8FF 0px,
      #D6E8FF 10px,
      #F6FBFF 10px,
      #F6FBFF 20px
    )`,
    className: ''
  },
  {
    id: 'pastel-rainbow',
    name: 'Rainbow',
    thumbnail: '🌈',
    backgroundStyle: `linear-gradient(
      to right,
      #FFD6E8,
      #FFEFCF,
      #E5FFD6,
      #D6FFEC,
      #D6F1FF,
      #E6D6FF,
      #FFD6F1
    )`,
    className: ''
  },
  {
    id: 'checkerboard',
    name: 'Checkerboard',
    thumbnail: '🏁',
    backgroundStyle: `repeating-conic-gradient(
  rgb(0, 0, 0) 90deg,
  rgb(255, 255, 255) 90deg 180deg, 
  rgb(0, 0, 0) 180deg 270deg,
  rgb(255, 255, 255) 270deg
    ) 
    10px 10px / 20px 20px`,
    className: ''
  },
  {
    id: 'stars',
    name: 'Stars',
    thumbnail: '⭐',
    backgroundStyle: '#f6f2ca',
    className: 'bg-stars-pattern'
  },
  {
    id: 'hearts',
    name: 'Hearts',
    thumbnail: '🖤',
    backgroundStyle: '#000000',
    className: 'bg-hearts-pattern'
  },
  {
    id: 'pastel-lavender',
    name: 'Lavender',
    thumbnail: '💜',
    backgroundStyle: '#E6E6FA',
    className: ''
  },
  {
    id: 'kawaii-grid',
    name: 'Grid',
    thumbnail: '📏',
    backgroundStyle: 'white',
    className: 'bg-kawaii-grid'
  },
  {
    id: 'custom-photoframe',
    name: 'My Frame',
    thumbnail: '🌃',
    backgroundStyle: `url(${customFrameImage}) no-repeat center/cover`,
    className: ''
  },
  {
    id: 'custom-photoframe',
    name: 'My Frame',
    thumbnail: '🪐',
    backgroundStyle: `url(${customFrameImage1}) no-repeat center/cover`,
    className: ''
  },
  {
    id: 'custom-photoframe',
    name: 'My Frame',
    thumbnail: '🌲',
    backgroundStyle: `url(${customFrameImage2}) no-repeat center/cover`,
    className: ''
  },
  {
    id: 'custom-photoframe',
    name: 'My Frame',
    thumbnail: '🖼️',
    backgroundStyle: `url(${customFrameImage3}) no-repeat center/cover`,
    className: ''
  },
  {
    id: 'custom-photoframe',
    name: 'My Frame',
    thumbnail: '💮',
    backgroundStyle: `url(${customFrameImage4}) no-repeat center/cover`,
    className: ''
  },
  {
    id: 'custom-photoframe',
    name: 'My Frame',
    thumbnail: '💎',
    backgroundStyle: `url(${customFrameImage5}) no-repeat center/cover`,
    className: ''
  },
];

interface PhotoFrameProps {
  backgroundStyle: BackgroundStyle;
  children: React.ReactNode;
  className?: string;
  isIndividualPhoto?: boolean; 
  preservedBackground?: boolean;
}

const PhotoFrame: React.FC<PhotoFrameProps> = ({ 
  backgroundStyle, 
  children, 
  className = '',
  isIndividualPhoto = false,
  preservedBackground = false 
}) => {  
  return (
    <div 
      className={`photo-frame ${className}`}
      style={{ 
        // Only apply background to strip container, not individual photos
        background: (!isIndividualPhoto || preservedBackground) ? backgroundStyle.backgroundStyle: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '0',
        // Add subtle border to individual photos to define their space
        padding: isIndividualPhoto ? '0.5rem' : '1rem'
      }}
    >
      {children}
    </div>
  );
};

export default PhotoFrame;

// Also exporting Frame interface and FRAMES array for backward compatibility
export interface Frame extends BackgroundStyle {
  borderStyle: string;
}

export const FRAMES: Frame[] = BACKGROUND_STYLES.map(style => ({
  ...style,
  borderStyle: 'none', // For backward compatibility
}));