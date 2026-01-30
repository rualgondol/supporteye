
import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../constants';
import { SessionStatus, UserRole, Annotation } from '../types';
import { DrawingLayer } from './DrawingLayer';
import { Camera, X, MousePointer2, Square, Circle, ArrowUpRight, Type, Eraser, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';

// Serveurs STUN publics de Google pour traverser les firewalls
const rtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export const LiveSessionView: React.FC = () => {
  const { language, session, updateSessionStatus, clearAnnotations, role, addAnnotation } = useAppStore();
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const t = TRANSLATIONS[language];
  const isTechnician = role === UserRole.TECHNICIAN;

  useEffect(() => {
    const s = io(); // Se connecte au même serveur que l'URL
    setSocket(s);

    if (session?.token) {
      s.emit('join-session', session.token);
    }

    // Initialisation WebRTC
    pc.current = new RTCPeerConnection(rtcConfig);

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        s.emit('signal', { token: session?.token, data: { candidate: event.candidate } });
      }
    };

    pc.current.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
      }
    };

    // Écoute de la signalisation
    s.on('signal', async (data: any) => {
      if (data.sdp) {
        await pc.current?.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === 'offer') {
          const answer = await pc.current?.createAnswer();
          await pc.current?.setLocalDescription(answer);
          s.emit('signal', { token: session?.token, data: { sdp: pc.current?.localDescription } });
        }
      } else if (data.candidate) {
        await pc.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    // Écoute des annotations distantes (Client voit ce que Tech dessine)
    s.on('draw', (annotation: Annotation) => {
      addAnnotation(annotation);
    });

    s.on('clear-drawings', () => {
      clearAnnotations();
    });

    s.on('session-ended', () => {
      handleEnd(false);
    });

    // Flux Caméra pour le CLIENT
    if (role === UserRole.CLIENT) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
          stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));
          
          // Créer l'offre WebRTC
          pc.current?.createOffer().then(offer => {
            pc.current?.setLocalDescription(offer);
            s.emit('signal', { token: session?.token, data: { sdp: offer } });
          });
        });
    }

    return () => {
      s.disconnect();
      pc.current?.close();
    };
  }, [session?.token, role]);

  const handleEnd = (emit = true) => {
    if (emit && socket) socket.emit('end-session', session?.token);
    updateSessionStatus(SessionStatus.COMPLETED);
    clearAnnotations();
  };

  const handleDraw = (ann: Annotation) => {
    if (isTechnician && socket) {
      socket.emit('draw', { token: session?.token, annotation: ann });
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <div className="relative flex-1 bg-slate-900 overflow-hidden shadow-2xl">
        
        {/* Surface Vidéo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={role === UserRole.CLIENT}
            className="w-full h-full object-cover"
          />
          
          {!isConnected && isTechnician && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-20 text-white">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="font-medium">En attente du flux vidéo client...</p>
            </div>
          )}

          <DrawingLayer isTechnician={isTechnician} onAnnotationCreated={handleDraw} />
        </div>

        {/* Contrôles */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-50">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 pointer-events-auto">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
            <span className="text-white text-xs font-bold tracking-widest">
              {isConnected ? 'LIVE • CONNECTED' : 'SIGNALING...'}
            </span>
          </div>

          <button
            onClick={() => handleEnd()}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-xl pointer-events-auto transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Barre d'outils Technicien */}
        {isTechnician && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl flex items-center gap-2 shadow-2xl pointer-events-auto z-50">
            <ToolButton icon={<MousePointer2 size={20} />} active label={t.pointer} />
            <ToolButton icon={<Square size={20} />} label={t.rect} />
            <ToolButton icon={<Circle size={20} />} label={t.circle} />
            <div className="w-px h-8 bg-white/20 mx-1"></div>
            <button 
                onClick={() => {
                  clearAnnotations();
                  socket?.emit('clear-drawings', session?.token);
                }}
                className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <Eraser size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ToolButton: React.FC<{ icon: React.ReactNode; active?: boolean; label?: string }> = ({ icon, active, label }) => (
  <button className={`p-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`} title={label}>
    {icon}
  </button>
);
