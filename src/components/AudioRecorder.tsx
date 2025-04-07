import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause } from 'lucide-react';

interface AudioRecorderProps {
  photoIndex: number;
  onAudioSaved: (photoIndex: number, audioBlob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ photoIndex, onAudioSaved }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        onAudioSaved(photoIndex, audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  return (
    <div className="audio-recorder absolute bottom-5 left-5 action-button">
      {audioURL ? (
        <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-kawaii">
          <button 
            onClick={togglePlayback} 
            className="p-2 rounded-full bg-cute-pink text-white"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <audio 
            ref={audioRef} 
            src={audioURL} 
            onEnded={() => setIsPlaying(false)} 
            className="hidden"
          />
          <div className="text-xs bg-white px-2 py-1 rounded-full">Audio Caption</div>
        </div>
      ) : (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-cute-pink"} text-white flex items-center gap-1`}
        >
          {isRecording ? (
            <>
              <Square size={16} />
              <span className="text-xs">Stop</span>
            </>
          ) : (
            <>
              <Mic size={16} />
              <span className="text-xs">Record</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default AudioRecorder;