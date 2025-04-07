import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, Share2, Sparkles, Heart, Star, Cat, Music, Crown, Rainbow, Cloud, Sun, Moon, Coffee, Flower, Cake, Gift, Router as Butterfly, GraduationCap, Scroll, PartyPopper, Calendar } from 'lucide-react';
import { Rnd } from 'react-rnd';
import DraggableSticker from './DraggableSticker';
import PhotoFrame, { BACKGROUND_STYLES } from './PhotoFrame'; // Import new frames and background styles component
import './DraggableSticker.css';
import './PhotoFrame.css'; 
import domtoimage from 'dom-to-image'

interface Sticker {
  id: string;
  type: string;
  photoIndex: number;
  position: { x: number; y: number };
  color: string;
  rotation: number;
  scale: number;
}

interface Caption {
  id: string;
  text: string;
  photoIndex: number;
  position: { x: number; y: number };
  fontSize: number;
  color: string;
  fontFamily: string;
  rotation: number;
}

const COUNTDOWN_TIME = 3;
const PHOTOS_TO_TAKE = 3;
const FILTERS = [
  { name: 'Normal', class: '' },
  { name: 'Grayscale', class: 'grayscale' },
  { name: 'Sepia', class: 'sepia' },
  { name: 'Bright', class: 'brightness-125' },
  { name: 'Vintage', class: 'sepia brightness-75 contrast-125' },
  { name: 'Cool', class: 'hue-rotate-60 brightness-110' },
  { name: 'Warm', class: 'hue-rotate-330 brightness-110' },
  { name: 'Dreamy', class: 'brightness-110 contrast-75 saturate-150' },
  { name: 'Dramatic', class: 'contrast-125 saturate-150 brightness-75' },
  { name: 'Pastel', class: 'brightness-110 saturate-75' },
  { name: 'Fairy', class: 'brightness-125 contrast-75 hue-rotate-30' },
];

const STICKERS = [
  { type: 'heart', icon: Heart, color: '#FF90B3', animation: 'bounce' },
  { type: 'star', icon: Star, color: '#FFD700', animation: 'spin' },
  { type: 'sparkle', icon: Sparkles, color: '#AEE9F5', animation: 'pulse' },
  { type: 'cat', icon: Cat, color: '#444444', animation: 'wiggle' },
  { type: 'music', icon: Music, color: '#9B59B6', animation: 'bounce' },
  { type: 'crown', icon: Crown, color: '#F1C40F', animation: 'shine' },
  { type: 'rainbow', icon: Rainbow, color: '#E74C3C', animation: 'rainbow' },
  { type: 'cloud', icon: Cloud, color: '#3498DB', animation: 'float' },
  { type: 'sun', icon: Sun, color: '#F39C12', animation: 'spin' },
  { type: 'moon', icon: Moon, color: '#34495E', animation: 'glow' },
  { type: 'coffee', icon: Coffee, color: '#795548', animation: 'shake' },
  { type: 'flower', icon: Flower, color: '#FF69B4', animation: 'sway' },
  { type: 'cake', icon: Cake, color: '#FF9999', animation: 'pop' },
  { type: 'gift', icon: Gift, color: '#9B59B6', animation: 'bounce' },
  { type: 'butterfly', icon: Butterfly, color: '#FF90B3', animation: 'flutter' },
  { type: 'graduation-cap', icon: GraduationCap, color: '#000000', animation: 'float' },
  { type: 'diploma', icon: Scroll, color: '#8B4513', animation: 'shine' },
  { type: 'confetti', icon: PartyPopper, color: '#FFD700', animation: 'pop' },
  { type: 'year', icon: Calendar, color: '#3498DB', animation: 'pulse' },
];



const FONTS = [
  { name: 'Quicksand', class: 'font-quicksand' },
  { name: 'Comic', class: 'font-comic' },
  { name: 'Cute', class: 'font-cute' },
];

const TEXT_COLORS = [
  '#FF90B3',
  '#FFD700',
  '#AEE9F5',
  '#444444',
  '#9B59B6',
  '#E74C3C',
  '#3498DB',
  '#F39C12',
  '#FF69B4',
  '#9B59B6',
];

const PhotoBooth: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [selectedTextColor, setSelectedTextColor] = useState(TEXT_COLORS[0]);
  const [selectedFontSize, setSelectedFontSize] = useState(24);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDraggingSticker, setIsDraggingSticker] = useState<string | null>(null);
  const [photoContainerDimensions, setPhotoContainerDimensions] = useState<{[key: number]: {width: number, height: number}}>({});
  const [selectedBackground, setSelectedBackground] = useState(BACKGROUND_STYLES[0]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoStripRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const playShutterSound = async () => {
    const audio = new Audio('https://www.soundjay.com/mechanical/camera-shutter-click-01.mp3');
    await audio.play();
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      await playShutterSound();
      
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const photoData = canvasRef.current.toDataURL('image/jpeg');
        setPhotos(prev => [...prev, photoData]);
      }
    }
  };

  const startPhotoSequence = async () => {
    setIsCapturing(true);
    setPhotos([]);
    setStickers([]);
    setCaptions([]);
    
    for (let i = 0; i < PHOTOS_TO_TAKE; i++) {
      for (let j = COUNTDOWN_TIME; j > 0; j--) {
        setCountdown(j);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      await capturePhoto();
      
      if (i < PHOTOS_TO_TAKE - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    setIsCapturing(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleStickerDragStart = (type: string, color: string) => {
    setIsDraggingSticker(`${type}-${color}`);
  };

  const handlePhotoDrop = (photoIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    if (isDraggingSticker) {
      const [type, color] = isDraggingSticker.split('-');
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        type,
        photoIndex,
        position: { x, y },
        color,
        rotation: 0,
        scale: 1,
      };
      setStickers(prev => [...prev, newSticker]);
    }
    setIsDraggingSticker(null);
  };

  const addCaption = (photoIndex: number) => {
    const newCaption: Caption = {
      id: `caption-${Date.now()}`,
      text: 'Double click to edit',
      photoIndex,
      position: { x: 50, y: 50 },
      fontSize: selectedFontSize,
      color: selectedTextColor,
      fontFamily: selectedFont.class,
      rotation: 0,
    };
    setCaptions(prev => [...prev, newCaption]);
  };

  const updateCaptionText = (id: string, text: string) => {
    setCaptions(prev =>
      prev.map(caption =>
        caption.id === id ? { ...caption, text } : caption
      )
    );
  };

  const updateStickerRotation = (stickerId: string, rotation: number) => {
    setStickers(prev =>
      prev.map(sticker =>
        sticker.id === stickerId ? { ...sticker, rotation } : sticker
      )
    );
  };

  const updateStickerScale = (stickerId: string, scale: number) => {
    setStickers(prev =>
      prev.map(sticker =>
        sticker.id === stickerId ? { ...sticker, scale: Math.max(0.5, Math.min(2, scale)) } : sticker
      )
    );
  };

  const updateStickerPosition = (stickerId: string, position: { x: number, y: number }, photoIndex: number) => {
    const container = photoRefs.current[photoIndex];
    if (!container) return;
    
    // Convert absolute position to percentage
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    const xPercent = (position.x / containerWidth) * 100;
    const yPercent = (position.y / containerHeight) * 100;
    
    setStickers(prev =>
      prev.map(sticker =>
        sticker.id === stickerId ? { ...sticker, position: { x: xPercent, y: yPercent } } : sticker
      )
    );
  };


const capturePhotoStrip = async () => {
  if (!photoStripRef.current) return null;
  
  try {
    // Hide UI elements temporarily for capture
    const buttonsToHide = photoStripRef.current.querySelectorAll('.action-button, button');
    buttonsToHide.forEach(btn => (btn as HTMLElement).style.display = 'none');

    if (selectedBackground.id === 'checkerboard') {
      photoStripRef.current.setAttribute('data-bg-checkerboard', 'true');
    }

    const images = photoStripRef.current.querySelectorAll('img');
    const originalFilters: string[] = [];

    // Store original styles and apply selected filter directly
    images.forEach(img => {
      const imgElement = img as HTMLElement;
      originalFilters.push(imgElement.style.filter);
      
      // Convert CSS class-based filters to inline filter styles
      if (selectedFilter) {
        switch (selectedFilter) {
          case 'grayscale':
            imgElement.style.filter = 'grayscale(100%)';
            break;
          case 'sepia':
            imgElement.style.filter = 'sepia(100%)';
            break;
          case 'brightness-125':
            imgElement.style.filter = 'brightness(1.25)';
            break;
          case 'sepia brightness-75 contrast-125':
            imgElement.style.filter = 'sepia(100%) brightness(0.75) contrast(1.25)';
            break;
          case 'hue-rotate-60 brightness-110':
            imgElement.style.filter = 'hue-rotate(60deg) brightness(1.1)';
            break;
          case 'hue-rotate-330 brightness-110':
            imgElement.style.filter = 'hue-rotate(330deg) brightness(1.1)';
            break;
          case 'brightness-110 contrast-75 saturate-150':
            imgElement.style.filter = 'brightness(1.1) contrast(0.75) saturate(1.5)';
            break;
          case 'contrast-125 saturate-150 brightness-75':
            imgElement.style.filter = 'contrast(1.25) saturate(1.5) brightness(0.75)';
            break; 
          case 'brightness-110 saturate-75':
            imgElement.style.filter = 'brightness(1.1) saturate(0.75)';
            break;
          case 'brightness-125 contrast-75 hue-rotate-30':
            imgElement.style.filter = 'brightness(1.25) contrast(0.75) hue-rotate(30deg)';
            break;
          default:
            break;
        }
      }
    });
    
    // Use dom-to-image instead of html2canvas
    const dataUrl = await domtoimage.toJpeg(photoStripRef.current, {
      quality: 0.95,
      bgcolor: 'white',
      style: {
        'background-repeat': 'repeat',
        'background-size': '20px 20px',
        'transform': 'none',
        'zoom': '1'
      }
    });

    images.forEach((img, index) => {
      (img as HTMLElement).style.filter = originalFilters[index];
    });

        // Remove special attribute
    if (selectedBackground.id === 'checkerboard') {
      photoStripRef.current.removeAttribute('data-bg-checkerboard');
    }
    
    // Restore UI elements
    buttonsToHide.forEach(btn => (btn as HTMLElement).style.display = '');
    
    return dataUrl;
  } catch (error) {
    console.error('Error capturing photo strip:', error);
    return null;
  }
};

  const downloadStrip = async () => {
    const stripImage = await capturePhotoStrip();
    if (stripImage) {
      const link = document.createElement('a');
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      link.download = `kawaii-photobooth-${formattedDate}.jpg`;
      link.href = stripImage;
      link.click();
    }
  };

  const shareStrip = async () => {
    try {
      const stripImage = await capturePhotoStrip();
      if (stripImage && navigator.share) {
        const blob = await (await fetch(stripImage)).blob();
        await navigator.share({
          files: [new File([blob], 'kawaii-photobooth-strip.jpg', { type: 'image/jpeg' })],
          title: 'My Kawaii Photobooth Strip ✨',
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  useEffect(() => {
    // This will update dimensions when photos change
    const updateDimensions = () => {
      const newDimensions: {[key: number]: {width: number, height: number}} = {};
      
      Object.entries(photoRefs.current).forEach(([key, container]) => {
        const index = Number(key);
        if (container) {
          newDimensions[index] = {
            width: container.offsetWidth,
            height: container.offsetHeight
          };
        }
      });
      
      setPhotoContainerDimensions(newDimensions);
    };
    
    updateDimensions();
    
    // Also update on window resize
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [photos.length]);

  // Add this useEffect to unselect stickers when clicking outside

  useEffect(() => {
    const handleOutsideClick = () => {
      // This will propagate to all stickers and unselect them
      document.dispatchEvent(new CustomEvent('unselectStickers'));
    };

    document.body.addEventListener('click', handleOutsideClick);
    
    return () => {
      document.body.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // Add this useEffect to handle outside clicks and unselect stickers
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      // Check if the click was on a sticker
      const stickerElement = (e.target as Element).closest('.sticker');
      if (!stickerElement) {
        // If not clicking on a sticker, unselect all stickers
        document.dispatchEvent(new CustomEvent('unselectStickers'));
      }
    };

    document.addEventListener('click', handleOutsideClick);
    
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-cute-pink text-center mb-8 flex items-center justify-center gap-2">
        <Sparkles className="sparkle" size={32} />
        Kawaii Photobooth
        <Sparkles className="sparkle" size={32} />
      </h1>

      {showConfetti && <div className="confetti-overlay" />}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-kawaii bg-white">
            {isCapturing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                <span className="text-6xl text-white countdown-animation">
                  {countdown}
                </span>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full ${selectedFilter}`}
            />
          </div>

          <canvas ref={canvasRef} className="hidden" width="640" height="480" />

          <div className="flex justify-center space-x-4">
            <button
              onClick={startPhotoSequence}
              disabled={isCapturing}
              className="button-bounce bg-cute-pink text-white px-6 py-3 rounded-full font-semibold shadow-kawaii flex items-center space-x-2 disabled:opacity-50 hover:bg-pastel-pink transition-colors"
            >
              <Camera size={20} />
              <span>Take Photos</span>
            </button>
          </div>

          {photos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-center text-lg font-medium text-soft-charcoal mb-2">Filters</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {FILTERS.map(filter => (
                  <button
                    key={filter.name}
                    onClick={() => setSelectedFilter(filter.class)}
                    className={`px-4 py-2 rounded-full font-medium ${
                      selectedFilter === filter.class
                        ? 'bg-cute-pink text-white'
                        : 'bg-soft-cream text-soft-charcoal'
                    } button-bounce transition-all hover:scale-105`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>


              {/* Add Background Selection UI */}
              <div className="mt-4">
                <h3 className="text-center text-lg font-medium text-soft-charcoal mb-2">Background Style</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {BACKGROUND_STYLES.map(bg => (
                    <div
                      key={bg.id}
                      onClick={() => setSelectedBackground(bg)}
                      className={`bg-selector p-1 w-10 h-10 flex items-center justify-center rounded-lg 
                        ${selectedBackground.id === bg.id ? 'selected-bg' : ''}
                        bg-white shadow-kawaii
                        button-bounce transition-all`}
                      title={bg.name}
                    >
                      <span className="text-xl">{bg.thumbnail}</span>
                    </div>
                  ))}
                </div>
              </div>


              <h3 className="text-center text-lg font-medium text-soft-charcoal mb-2">Stickers</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {STICKERS.map(sticker => (
                  <div
                    key={sticker.type}
                    draggable
                    onDragStart={() => handleStickerDragStart(sticker.type, sticker.color)}
                    className={`p-2 rounded-full bg-white shadow-kawaii button-bounce sticker-${sticker.animation} cursor-grab`}
                  >
                    <sticker.icon size={24} color={sticker.color} />
                  </div>
                ))}
              </div>
              
              <h3 className="text-center text-lg font-medium text-soft-charcoal mb-2">Fonts</h3>
              <div className="space-y-2">
                <div className="flex gap-2 justify-center">
                  {FONTS.map(font => (
                    <button
                      key={font.name}
                      onClick={() => setSelectedFont(font)}
                      className={`px-4 py-2 rounded-full ${
                        selectedFont === font
                          ? 'bg-cute-pink text-white'
                          : 'bg-soft-cream text-soft-charcoal'
                      } ${font.class}`}
                    >
                      Aa
                    </button>
                  ))}
                </div>
                
                <h3 className="text-center text-lg font-medium text-soft-charcoal mb-2">Font Colors</h3>
                <div className="flex gap-2 justify-center">
                  {TEXT_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedTextColor(color)}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-kawaii"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                <h3 className="text-center text-lg font-medium text-soft-charcoal mb-2">Font Size</h3>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={selectedFontSize}
                  onChange={(e) => setSelectedFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        <div ref={photoStripRef} className="photo-strip p-4 rounded-2xl shadow-kawaii" 
             style={{ background: selectedBackground.backgroundStyle }}>
          <div className="space-y-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                ref={el => photoRefs.current[index] = el}
                className="relative rounded-lg overflow-hidden"
                style={{ position: 'relative' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handlePhotoDrop(index, e)}
              >
                {/* Wrap the image with the PhotoFrame component */}
                <PhotoFrame backgroundStyle={selectedBackground} isIndividualPhoto={true} data-photo-frame>
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className={`w-full ${selectedFilter}`}
                  />
                </div>
                </PhotoFrame>
                
                {stickers
                  .filter(sticker => sticker.photoIndex === index)
                  .map(sticker => {
                    const containerWidth = photoContainerDimensions[index]?.width || 640;
                    const containerHeight = photoContainerDimensions[index]?.height || 480;
                    
                    const stickerIcon = STICKERS.find(s => s.type === sticker.type)?.icon || Heart;
                    const animation = STICKERS.find(s => s.type === sticker.type)?.animation || 'bounce';
                    
                    return (
                      <DraggableSticker
                        key={sticker.id}
                        id={sticker.id}
                        type={sticker.type}
                        color={sticker.color}
                        position={sticker.position}
                        rotation={sticker.rotation}
                        scale={sticker.scale}
                        containerWidth={containerWidth}
                        containerHeight={containerHeight}
                        icon={stickerIcon}
                        animation={animation}
                        onPositionChange={(id, position) => {
                          updateStickerPosition(id, 
                            { 
                              x: position.x * containerWidth / 100, 
                              y: position.y * containerHeight / 100 
                            }, 
                            index
                          );
                        }}
                        onRotationChange={(id, rotation) => {
                          updateStickerRotation(id, rotation);
                        }}
                        onScaleChange={(id, scale) => {
                          updateStickerScale(id, scale);
                        }}
                        onDelete={(id) => {
                          setStickers(prev => prev.filter(s => s.id !== id));
                        }}
                      />
                    );
                  })}
                {captions
                  .filter(caption => caption.photoIndex === index)
                  .map(caption => (
                    <Rnd
                      key={caption.id}
                      default={{
                        x: (caption.position.x / 100) * 640,
                        y: (caption.position.y / 100) * 480,
                        width: 'auto',
                        height: 'auto',
                      }}
                    >
                      <div
                        contentEditable
                        className={`p-2 rounded text-soft-charcoal focus:outline-none ${caption.fontFamily}`}
                        style={{
                          color: caption.color,
                          fontSize: `${caption.fontSize}px`,
                          transform: `rotate(${caption.rotation}deg)`,
                          whiteSpace: 'nowrap',
                        }}
                        onBlur={(e) => updateCaptionText(caption.id, e.currentTarget.textContent || '')}
                        suppressContentEditableWarning
                      >
                        {caption.text}
                      </div>
                    </Rnd>
                  ))}
                <button
                  onClick={() => addCaption(index)}
                  className="absolute bottom-5 right-5 button-bounce bg-icy-blue text-soft-charcoal px-3 py-1 rounded-full font-medium shadow-kawaii hover:bg-opacity-80 transition-colors text-sm action-button "
                >
                  Add Text
                </button>
              </div>
            ))}
          </div>

          {photos.length === PHOTOS_TO_TAKE && (
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={downloadStrip}
                className="button-bounce bg-cute-pink text-white px-6 py-3 rounded-full font-semibold shadow-kawaii flex items-center space-x-2 hover:bg-opacity-90 transition-colors action-button"
              >
                <Download size={20} />
              </button>
              <button
                onClick={shareStrip}
                className="button-bounce bg-icy-blue text-soft-charcoal px-6 py-3 rounded-full font-semibold shadow-kawaii flex items-center space-x-2 hover:bg-opacity-90 transition-colors action-button"
              >
                <Share2 size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoBooth;