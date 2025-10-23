import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        try {
          // Use Web Speech API for transcription (built-in, no API key needed)
          const recognition = new (window as any).webkitSpeechRecognition() || new (window as any).SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'fr-FR'; // French by default, can be made configurable

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            setIsProcessing(false);
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            toast({
              title: "Erreur de reconnaissance vocale",
              description: "Impossible de transcrire l'audio. Réessayez.",
              variant: "destructive"
            });
            setIsProcessing(false);
          };

          // Note: Web Speech API works directly with microphone stream
          // The above is a simplified example. For production, consider using
          // a proper speech-to-text service (ElevenLabs, Google, etc.)
          
          // Fallback: Just notify that audio was captured
          toast({
            title: "Audio capturé",
            description: "L'audio a été enregistré. Intégration complète nécessaire.",
          });
          setIsProcessing(false);
          
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: "Erreur",
            description: "La transcription a échoué. Assurez-vous que votre navigateur supporte la reconnaissance vocale.",
            variant: "destructive"
          });
          setIsProcessing(false);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Enregistrement...",
        description: "Parlez maintenant. Cliquez à nouveau pour arrêter.",
      });

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone. Vérifiez les permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      variant={isRecording ? "destructive" : "ghost"}
      size="icon"
      onClick={toggleRecording}
      disabled={disabled || isProcessing}
      className={cn(
        "transition-all",
        isRecording && "animate-pulse"
      )}
      title={isRecording ? "Arrêter l'enregistrement" : "Enregistrer un message vocal"}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};
