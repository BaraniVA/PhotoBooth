import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, Share2, Sparkles, Heart, Star, Cat, Music, Crown, Rainbow, Cloud, Sun, Moon, Coffee, Flower, Cake, Gift, Router as Butterfly, Scroll, PartyPopper, Calendar } from 'lucide-react';
import { Rnd } from 'react-rnd';
import DraggableSticker from './DraggableSticker';
import PhotoFrame, { BACKGROUND_STYLES } from './PhotoFrame'; // Import new frames and background styles component
import './DraggableSticker.css';
import './PhotoFrame.css'; 
import domtoimage from 'dom-to-image'
import ImageStickerSelector, { IMAGE_STICKERS } from './ImageStickers';


interface Sticker {
  id: string;
  type: string;
  photoIndex: number | null;
  position: { x: number; y: number };
  color: string;
  rotation: number;
  scale: number;
  isImage?: boolean;
  imageSrc?: string;
  isGlobal?: boolean; 
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
const PHOTOS_TO_TAKE = 4;
const FILTERS = [
  { name: 'Normal', class: '' },
  { name: 'Grayscale', class: 'grayscale' },
  { name: 'Sepia', class: 'sepia' },
  { name: 'Bright', class: 'brightness-125' },
  { name: 'Vintage', class: 'sepia brightness-75 contrast-125' },
  { name: 'Cool', class: 'hue-rotate-20 brightness-110' },
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
  const [selectedStickerForPlacement, setSelectedStickerForPlacement] = useState<{
    type: string;
    color: string;
    isImage: boolean;
    imageSrc?: string;
  } | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

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
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas to match video's actual dimensions
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoData = canvas.toDataURL('image/jpeg');
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

  const handlePhotoDrop = (photoIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drop event with sticker:', isDraggingSticker); // Add debug logging
    
    if (isDraggingSticker) {
      if (isDraggingSticker.startsWith('image-')) {
        // Handle image sticker
        const type = isDraggingSticker.split('-')[1];
        const imgSrc = sessionStorage.getItem('draggedStickerSrc') || '';
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
  
        const newSticker: Sticker = {
          id: `sticker-${Date.now()}`,
          type,
          photoIndex,
          position: { x, y },
          color: '',
          rotation: 0,
          scale: 1,
          isImage: true,
          imageSrc: imgSrc // Make sure this property name matches your interface
        };
        setStickers(prev => [...prev, newSticker]);
      } else {
        // Handle regular icon sticker
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
          isImage: false // Explicitly set to false
        };
        setStickers(prev => [...prev, newSticker]);
      }
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
        sticker.id === stickerId ? { ...sticker, scale: Math.max(0.5, Math.min(15, scale)) } : sticker
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
    // Save current background
    const originalBackground = photoStripRef.current.style.background;
    
    // For custom image backgrounds, set explicit inline styles
    if (selectedBackground.id === 'custom-photoframe') {
      photoStripRef.current.style.backgroundRepeat = 'no-repeat';
      photoStripRef.current.style.backgroundSize = 'contain';
      photoStripRef.current.style.backgroundPosition = 'center';
      photoStripRef.current.style.backgroundColor = 'white'; 
    }
    
    // Hide UI elements you don't want in the captured image
    const buttonsToHide = document.querySelectorAll('.hide-for-capture');
    buttonsToHide.forEach(btn => (btn as HTMLElement).style.display = 'none');
    
    const dataUrl = await domtoimage.toJpeg(photoStripRef.current, {
      quality: 0.95,
      width: photoStripRef.current.offsetWidth,
      height: photoStripRef.current.offsetHeight,
      style: {
        'background-repeat': 'no-repeat',
        'background-size': 'cover',
        'background-position': 'center',
      }
    });
    
    // Restore original background
    photoStripRef.current.style.background = originalBackground;
    
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

  const handleStripDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingSticker || !photoStripRef.current) return;
  
    const stripRect = photoStripRef.current.getBoundingClientRect();
    const dropX = e.clientX - stripRect.left;
    const dropY = e.clientY - stripRect.top;
    
    // Convert to percentage of the strip dimensions
    const xPercent = (dropX / stripRect.width) * 100;
    const yPercent = (dropY / stripRect.height) * 100;
    
    // Create a global sticker that exists on the background
    if (isDraggingSticker.startsWith('image-')) {
      // Handle image sticker
      const type = isDraggingSticker.split('-')[1];
      const imgSrc = sessionStorage.getItem('draggedStickerSrc') || '';
      
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        type,
        photoIndex: null, // Null indicates it's on the background
        position: { x: xPercent, y: yPercent },
        color: '',
        rotation: 0,
        scale: 1,
        isImage: true,
        imageSrc: imgSrc,
        isGlobal: true
      };
      setStickers(prev => [...prev, newSticker]);
    } else {
      // Handle icon sticker
      const [type, color] = isDraggingSticker.split('-');
      
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        type,
        photoIndex: null, // Null indicates it's on the background
        position: { x: xPercent, y: yPercent },
        color,
        rotation: 0,
        scale: 1,
        isGlobal: true
      };
      setStickers(prev => [...prev, newSticker]);
    }
    
    setIsDraggingSticker(null);
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

  // Detect mobile device on component mount
  useEffect(() => {
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    setIsMobileDevice(checkMobile());
  }, []);

  // Add these new handlers for mobile-friendly sticker placement
  const handleStickerClick = (type: string, color: string) => {
    if (isMobileDevice) {
      setSelectedStickerForPlacement({
        type,
        color,
        isImage: false
      });
    }
  };

  const handleImageStickerClick = (id: string, imageSrc: string) => {
    if (isMobileDevice) {
      setSelectedStickerForPlacement({
        type: id,
        color: '',
        isImage: true,
        imageSrc
      });
    }
  };

  const handlePhotoClick = (photoIndex: number, e: React.MouseEvent) => {
    if (selectedStickerForPlacement) {
      e.preventDefault();
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      if (selectedStickerForPlacement.isImage) {
        const newSticker: Sticker = {
          id: `sticker-${Date.now()}`,
          type: selectedStickerForPlacement.type,
          photoIndex,
          position: { x, y },
          color: '',
          rotation: 0,
          scale: 1,
          isImage: true,
          imageSrc: selectedStickerForPlacement.imageSrc
        };
        setStickers(prev => [...prev, newSticker]);
      } else {
        const newSticker: Sticker = {
          id: `sticker-${Date.now()}`,
          type: selectedStickerForPlacement.type,
          photoIndex,
          position: { x, y },
          color: selectedStickerForPlacement.color,
          rotation: 0,
          scale: 1,
          isImage: false
        };
        setStickers(prev => [...prev, newSticker]);
      }
      
      // Clear selection after placing
      setSelectedStickerForPlacement(null);
    }
  };

  const cancelStickerSelection = () => {
    setSelectedStickerForPlacement(null);
  };

  // Existing handlers - update to support both desktop and mobile
  const handleStickerDragStart = (type: string, color: string) => {
    if (!isMobileDevice) {
      console.log('Starting drag for icon:', type, color);
      setIsDraggingSticker(`${type}-${color}`);
    }
  };

  const handleImageStickerDragStart = (id: string, imageSrc: string) => {
    if (!isMobileDevice) {
      console.log('Starting drag for image:', id, imageSrc);
      setIsDraggingSticker(`image-${id}`);
      sessionStorage.setItem('draggedStickerSrc', imageSrc);
    }
  };

  return (
    <div className="container mx-auto px-2 py-4 max-w-full overflow-hidden">
      <h1 className="text-4xl font-bold text-cute-pink text-center mb-4 md:mb-8 flex items-center justify-center gap-1 md:gap-2">
        <Sparkles className="sparkle" size={32} />
        Kawaii Photobooth
        <Sparkles className="sparkle" size={32} />
      </h1>

      {showConfetti && <div className="confetti-overlay" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
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
              <div className="flex flex-wrap gap-2 justify-center px-1 max-w-full overflow-x-auto pb-2">
                {STICKERS.map(sticker => (
                  <div
                    key={sticker.type}
                    draggable={!isMobileDevice}
                    onClick={() => handleStickerClick(sticker.type, sticker.color)}
                    onDragStart={() => handleStickerDragStart(sticker.type, sticker.color)}
                    className={`p-2 rounded-full bg-white shadow-kawaii button-bounce sticker-${sticker.animation} cursor-grab
                      ${selectedStickerForPlacement && !selectedStickerForPlacement.isImage && 
                        selectedStickerForPlacement.type === sticker.type ? 'ring-2 ring-cute-pink ring-offset-2' : ''}`}
                  >
                    <sticker.icon size={24} color={sticker.color} />
                  </div>
                ))}
              </div>

              {/* Use an updated version of your ImageStickerSelector */}
              <ImageStickerSelector 
                onStickerSelect={handleImageStickerDragStart} 
                onStickerClick={handleImageStickerClick}
                selectedStickerId={selectedStickerForPlacement?.isImage ? selectedStickerForPlacement.type : null}
              />

              {/* Add a cancel button when a sticker is selected */}
              {selectedStickerForPlacement && (
                <div className="text-center mt-2">
                  <button 
                    onClick={cancelStickerSelection}
                    className="bg-gray-200 px-4 py-2 rounded-full text-sm"
                  >
                    Cancel Selection
                  </button>
                  <p className="text-sm text-gray-600 mt-1">
                    Tap on a photo to place the selected sticker
                  </p>
                  {isMobileDevice && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tap on any placed sticker to select it, then tap the trash icon to delete.
                    </p>
                  )}
                </div>
              )}
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
             style={{ background: selectedBackground.backgroundStyle }}
             onDragOver={(e) => e.preventDefault()}
             onDrop={(e) => handleStripDrop(e)}
             >
          <div className="space-y-4">
          {photos.map((photo, index) => (
              <div
                key={index}
                ref={el => photoRefs.current[index] = el}
                className="relative overflow-hidden mb-4"
                style={{ 
                  position: 'relative',
                  height: 'auto',  
                  maxHeight: '240px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onClick={(e) => handlePhotoClick(index, e)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handlePhotoDrop(index, e)}
              >
                {/* Wrap the image with the PhotoFrame component */}
                <PhotoFrame backgroundStyle={selectedBackground} isIndividualPhoto={true} data-photo-frame>
                  <div className="overflow-hidden flex justify-center">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className={`w-auto max-w-full h-auto max-h-full ${selectedFilter}`}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </PhotoFrame>
                
                {stickers
                  .filter(sticker => sticker.photoIndex === index)
                  .map(sticker => {
                    const containerWidth = photoContainerDimensions[index]?.width || 640;
                    const containerHeight = photoContainerDimensions[index]?.height || 480;
                    
                    const stickerIcon = !sticker.isImage ? STICKERS.find(s => s.type === sticker.type)?.icon || Heart : undefined;

                    const animation = sticker.isImage ? IMAGE_STICKERS.find(s => s.id === sticker.type)?.animation || 'bounce' : STICKERS.find(s => s.type === sticker.type)?.animation || 'bounce';
                    
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
                        isImage={sticker.isImage}
                        imageSrc={sticker.imageSrc}
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
                  className="absolute bottom-5 right-5 button-bounce bg-icy-blue text-soft-charcoal px-3 py-1 rounded-full font-medium shadow-kawaii hover:bg-opacity-80 transition-colors text-sm action-button hide-for-capture"
                >
                  Add Text
                </button>
              </div>
            ))}
          </div>

          {/* Render global stickers (not associated with any specific photo) */}
          {stickers
            .filter(sticker => sticker.photoIndex === null)
            .map(sticker => {
              // Use the photostrip dimensions for global stickers
              const stripWidth = photoStripRef.current?.offsetWidth || 800;
              const stripHeight = photoStripRef.current?.offsetHeight || 1200;
              
              const stickerIcon = !sticker.isImage ? STICKERS.find(s => s.type === sticker.type)?.icon || Heart : undefined;
              const animation = sticker.isImage ? IMAGE_STICKERS.find(s => s.id === sticker.type)?.animation || 'bounce' : STICKERS.find(s => s.type === sticker.type)?.animation || 'bounce';
              
              return (
                <DraggableSticker
                  key={sticker.id}
                  id={sticker.id}
                  type={sticker.type}
                  color={sticker.color}
                  position={sticker.position}
                  rotation={sticker.rotation}
                  scale={sticker.scale}
                  containerWidth={stripWidth}
                  containerHeight={stripHeight}
                  icon={stickerIcon}
                  animation={animation}
                  isImage={sticker.isImage}
                  imageSrc={sticker.imageSrc}
                  onPositionChange={(id, position) => {
                    setStickers(prev =>
                      prev.map(s =>
                        s.id === id ? { ...s, position } : s
                      )
                    );
                  }}
                  onRotationChange={updateStickerRotation}
                  onScaleChange={updateStickerScale}
                  onDelete={(id) => {
                    setStickers(prev => prev.filter(s => s.id !== id));
                  }}
                />
              );
            })}

          {photos.length === PHOTOS_TO_TAKE && (
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={downloadStrip}
                className="button-bounce bg-cute-pink text-white px-6 py-3 rounded-full font-semibold shadow-kawaii flex items-center space-x-2 hover:bg-opacity-90 transition-colors action-button hide-for-capture"
              >
                <Download size={20} />
              </button>
              <button
                onClick={shareStrip}
                className="button-bounce bg-icy-blue text-soft-charcoal px-6 py-3 rounded-full font-semibold shadow-kawaii flex items-center space-x-2 hover:bg-opacity-90 transition-colors action-button hide-for-capture"
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