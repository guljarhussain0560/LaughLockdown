'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import MemeDisplay from '@/components/MemeDisplay';
import { useSocket } from '@/lib/socketContext';
import { useSmileDetection } from '@/hooks/useSmileDetection';

interface Participant {
  id: string;
  name: string;
  email: string | null;
  image: string | null;
  status: 'waiting' | 'ready' | 'playing' | 'out';
  survivalTime: number;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
}

interface SyncedGameState {
  currentMemeIndex: number;
  memeQueue: SelectedMeme[];
  startTimestamp: number;
  gameStarted: boolean;
}

interface SelectedMeme {
  id: string;
  url: string;
  type: string;
  duration: number | null;
  title: string | null;
  user: {
    name: string;
    image: string | null;
  } | null;
}

export default function MultiplayerRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const contestId = params.id as string;

  const [contest, setContest] = useState<any>(null);
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [gameState, setGameState] = useState<'lobby' | 'starting' | 'playing' | 'ended'>('lobby');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentMeme, setCurrentMeme] = useState<SelectedMeme | null>(null);
  const [memeQueue, setMemeQueue] = useState<SelectedMeme[]>([]);
  const [memeIndex, setMemeIndex] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShareMessage, setCopiedShareMessage] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Smile detection hook - integrated from solo game
  const { status: smileStatus, isModelLoaded, reset: resetSmileDetection } = useSmileDetection(
    localVideoRef,
    gameState === 'playing'
  );

  // WebRTC State
  const { socket, isConnected } = useSocket();
  const [peerConnections, setPeerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  // Handle player elimination when they smile
  useEffect(() => {
    if ((smileStatus === 'out' || smileStatus === 'no-face') && gameState === 'playing') {
      console.log('😄 Player eliminated! Reason:', smileStatus === 'no-face' ? 'No face detected' : 'Smiled');
      
      // Update local state
      setGameState('ended');
      
      // Notify server that player is out
      if (socket && session?.user?.email) {
        socket.emit('player-eliminated', {
          contestId,
          userId: session.user.email,
          survivalTime,
          reason: smileStatus === 'no-face' ? 'no-face' : 'smiled'
        });
      }

      // Save result to database
      fetch(`/api/multiplayer-contests/${contestId}/eliminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survivalTime,
          reason: smileStatus === 'no-face' ? 'no-face' : 'smiled'
        })
      }).catch(err => console.error('Failed to save elimination:', err));
    }
  }, [smileStatus, gameState, contestId, socket, session, survivalTime]);

  // Initialize camera and mic
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        console.log('✅ Local media stream initialized successfully');
      } catch (error: any) {
        console.error('❌ Media access error:', error);
        
        // Better error handling based on error type
        let errorMessage = 'Unable to access camera/microphone. ';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage += 'Please allow camera and microphone permissions in your browser settings and refresh the page.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage += 'No camera or microphone found. Please connect a device and try again.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMessage += 'Camera/microphone is already in use by another application.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage += 'Camera/microphone constraints cannot be satisfied.';
        } else {
          errorMessage += 'Please check your device settings and try again.';
        }
        
        alert(errorMessage);
        
        // Continue without media - user can still see others
        console.log('⚠️ Continuing without local media stream');
      }
    };

    initMedia();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      // Close all peer connections
      peerConnectionsRef.current.forEach(pc => pc.close());
      peerConnectionsRef.current.clear();
    };
  }, []);

  // ICE servers configuration (memoized)
  const iceServersConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  // WebRTC: Create peer connection
  const createPeerConnection = useCallback(async (remoteSocketId: string, createOffer: boolean) => {
    if (!socket) return null;

    console.log(`🔗 Creating peer connection with ${remoteSocketId}, createOffer: ${createOffer}`);
    
    const pc = new RTCPeerConnection(iceServersConfig);
    
    // Add local stream tracks ONLY if we have a local stream
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getTracks();
      console.log(`📹 Adding ${tracks.length} local tracks to peer connection`);
      
      tracks.forEach(track => {
        if (localStreamRef.current) {
          const sender = pc.addTrack(track, localStreamRef.current);
          console.log(`✅ Added ${track.kind} track (${track.label}) - Sender:`, sender);
        }
      });
    } else {
      console.warn('⚠️ No local stream available to add to peer connection');
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log(`📥 Received remote ${event.track.kind} track from: ${remoteSocketId}`);
      console.log('📥 Track details:', {
        trackId: event.track.id,
        trackLabel: event.track.label,
        trackEnabled: event.track.enabled,
        trackReadyState: event.track.readyState,
        streamsCount: event.streams.length
      });
      
      const [remoteStream] = event.streams;
      
      if (remoteStream) {
        console.log(`✅ Setting remote stream for ${remoteSocketId}:`, {
          streamId: remoteStream.id,
          videoTracks: remoteStream.getVideoTracks().length,
          audioTracks: remoteStream.getAudioTracks().length
        });
        
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.set(remoteSocketId, remoteStream);
          console.log(`📺 Remote streams updated. Total: ${newMap.size}`);
          return newMap;
        });
      } else {
        console.error('❌ No remote stream in event.streams');
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate to:', remoteSocketId);
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: remoteSocketId
        });
      }
    };

    // Handle connection state
    pc.onconnectionstatechange = () => {
      console.log(`🔌 Connection state with ${remoteSocketId}: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        console.log(`✅ Successfully connected to ${remoteSocketId}`);
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.log(`❌ Connection with ${remoteSocketId} ${pc.connectionState}`);
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE connection state with ${remoteSocketId}: ${pc.iceConnectionState}`);
    };

    // Store peer connection
    peerConnectionsRef.current.set(remoteSocketId, pc);
    setPeerConnections(new Map(peerConnectionsRef.current));

    // Create offer if initiator
    if (createOffer) {
      try {
        console.log(`📤 Creating offer for ${remoteSocketId}...`);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);
        console.log(`✅ Sending offer to: ${remoteSocketId}`);
        socket.emit('offer', { offer, to: remoteSocketId });
      } catch (error) {
        console.error('❌ Error creating offer:', error);
      }
    }

    return pc;
  }, [socket]);

  // WebRTC: Socket.io signaling
  useEffect(() => {
    if (!socket || !isConnected || !session?.user?.email) return;

    console.log('Setting up WebRTC signaling for room:', contestId);

    // Join room
    socket.emit('join-room', {
      contestId,
      userId: session.user.email
    });

    // Handle existing participants
    const handleExistingParticipants = async (participants: string[]) => {
      console.log('Existing participants:', participants);
      for (const participantId of participants) {
        await createPeerConnection(participantId, true); // Create offer
      }
    };

    // Handle new user joined
    const handleUserJoined = async ({ socketId }: { socketId: string }) => {
      console.log('New user joined:', socketId);
      // Wait for them to send offer (they initiated)
    };

    // Handle WebRTC offer
    const handleOffer = async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log('Received offer from:', from);
      let pc = peerConnectionsRef.current.get(from);
      
      if (!pc) {
        const newPc = await createPeerConnection(from, false);
        if (!newPc) {
          console.error('Failed to create peer connection');
          return;
        }
        pc = newPc;
      }
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('Sending answer to:', from);
        socket.emit('answer', { answer, to: from });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    };

    // Handle WebRTC answer
    const handleAnswer = async ({ answer, from }: { answer: RTCSessionDescriptionInit; from: string }) => {
      console.log('Received answer from:', from);
      const pc = peerConnectionsRef.current.get(from);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('Set remote description (answer) from:', from);
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      }
    };

    // Handle ICE candidate
    const handleIceCandidate = async ({ candidate, from }: { candidate: RTCIceCandidateInit; from: string }) => {
      console.log('Received ICE candidate from:', from);
      const pc = peerConnectionsRef.current.get(from);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    };

    // Handle user left
    const handleUserLeft = (socketId: string) => {
      console.log('User left:', socketId);
      const pc = peerConnectionsRef.current.get(socketId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(socketId);
        setPeerConnections(new Map(peerConnectionsRef.current));
      }
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(socketId);
        return newMap;
      });
    };

    // Handle game state sync for late joiners
    const handleSyncGameState = (state: SyncedGameState) => {
      console.log('🎮 Received game state sync (late joiner):', state);
      
      if (state.gameStarted && state.memeQueue && state.memeQueue.length > 0) {
        console.log('⏩ Late joiner - syncing to current game state');
        
        // Cache meme queue locally
        localStorage.setItem(`contest-memes-${contestId}`, JSON.stringify(state.memeQueue));
        
        // Set the meme queue
        setMemeQueue(state.memeQueue);
        
        // Set current meme index
        setMemeIndex(state.currentMemeIndex);
        
        // Set current meme
        if (state.memeQueue[state.currentMemeIndex]) {
          setCurrentMeme(state.memeQueue[state.currentMemeIndex]);
        }
        
        // Start the game immediately (skip lobby)
        setGameState('playing');
        
        // Calculate survival time based on when game started
        const elapsedTime = Math.floor((Date.now() - state.startTimestamp) / 1000);
        setSurvivalTime(elapsedTime);
        
        console.log(`✅ Synced to meme ${state.currentMemeIndex + 1}/${state.memeQueue.length}, ${elapsedTime}s elapsed`);
      }
    };

    // Handle game state change broadcast from host
    const handleGameStateChanged = ({ state }: { state: SyncedGameState }) => {
      console.log('🎮 Received game state change from host:', state);
      
      if (state.gameStarted && state.memeQueue && state.memeQueue.length > 0) {
        console.log('🚀 Game starting - syncing state from host');
        
        // Cache meme queue locally
        localStorage.setItem(`contest-memes-${contestId}`, JSON.stringify(state.memeQueue));
        
        // Set the meme queue
        setMemeQueue(state.memeQueue);
        
        // Set current meme
        if (state.memeQueue[0]) {
          setCurrentMeme(state.memeQueue[0]);
        }
        
        // Start countdown
        setGameState('starting');
        setCountdown(3);
        
        console.log(`✅ Game synchronized with ${state.memeQueue.length} memes`);
      }
    };

    socket.on('existing-participants', handleExistingParticipants);
    socket.on('user-joined', handleUserJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-left', handleUserLeft);
    socket.on('sync-game-state', handleSyncGameState);
    socket.on('game-state-changed', handleGameStateChanged);

    return () => {
      socket.off('existing-participants', handleExistingParticipants);
      socket.off('user-joined', handleUserJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('user-left', handleUserLeft);
      socket.off('sync-game-state', handleSyncGameState);
      socket.off('game-state-changed', handleGameStateChanged);
    };
  }, [socket, isConnected, contestId, session, createPeerConnection]);

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Load contest data
  const loadContestData = useCallback(async () => {
    try {
      // Fetch contest details
      const contestRes = await fetch(`/api/multiplayer-contests/${contestId}`);
      if (!contestRes.ok) {
        throw new Error('Contest not found');
      }
      
      const contestData = await contestRes.json();
      setContest(contestData.contest);
      setRoomCode(contestData.contest.roomCode || '');
      
      // Check if current user is host
      if (session?.user?.email) {
        const currentUserEmail = session.user.email;
        const isCreator = contestData.contest.creator.email === currentUserEmail;
        setIsHost(isCreator);
      }
      
      // Map participants
      const mappedParticipants: Participant[] = contestData.contest.participants
        .filter((p: any) => p.status === 'accepted' || p.status === 'playing')
        .map((p: any) => ({
          id: p.user.id,
          name: p.user.name || 'Anonymous',
          email: p.user.email,
          image: p.user.image,
          status: p.status === 'playing' ? 'playing' : 'waiting' as const,
          survivalTime: p.survivalTime || 0
        }));
      
      setParticipants(mappedParticipants);
      
      // Check if game has already started
      if (contestData.contest.status === 'active' && gameState === 'lobby') {
        setGameState('starting');
        setCountdown(3);
        
        // Try to get synced meme queue from localStorage first (set by host)
        const cachedMemes = localStorage.getItem(`contest-memes-${contestId}`);
        if (cachedMemes) {
          try {
            const queue: SelectedMeme[] = JSON.parse(cachedMemes);
            setMemeQueue(queue);
            if (queue.length > 0) {
              setCurrentMeme(queue[0]);
            }
          } catch (e) {
            console.error('Failed to parse cached memes:', e);
          }
        }
        
        // If no cached memes, fetch random ones (fallback for late joiners)
        if (memeQueue.length === 0) {
          const memesRes = await fetch('/api/memes/random?count=20');
          const memesData = await memesRes.json();
          const queue: SelectedMeme[] = memesData.memes || [];
          setMemeQueue(queue);
          if (queue.length > 0) {
            setCurrentMeme(queue[0]);
          }
        }
      }
      
    } catch (error) {
      console.error('Error loading contest:', error);
      if (loading) {
        alert('Failed to load contest. Redirecting...');
        router.push('/games');
      }
    } finally {
      setLoading(false);
    }
  }, [contestId, session, loading, gameState, router]);

  // Initial load
  useEffect(() => {
    if (session && contestId) {
      loadContestData();
    }
  }, [session, contestId, loadContestData]);

  // Poll for updates while in lobby
  useEffect(() => {
    if (gameState === 'lobby' && contestId && session) {
      // Poll every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadContestData();
      }, 2000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [gameState, contestId, session, loadContestData]);

  // Start game (Host only - generates synced meme queue)
  const handleStartGame = async () => {
    try {
      // First, fetch random memes that all participants will see
      const memesRes = await fetch('/api/memes/random?count=20');
      const memesData = await memesRes.json();
      const queue: SelectedMeme[] = memesData.memes || [];

      if (queue.length === 0) {
        alert('No memes available. Please upload some memes first.');
        return;
      }

      // Store meme queue in contest (you'd need to add this field to your schema)
      // For now, store it in localStorage with contestId as key
      localStorage.setItem(`contest-memes-${contestId}`, JSON.stringify(queue));

      // Start the contest
      const res = await fetch(`/api/multiplayer-contests/${contestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'start',
          memeQueueIds: queue.map(m => m.id) // Send meme IDs to sync
        })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to start game');
        return;
      }

      setMemeQueue(queue);
      if (queue.length > 0) {
        setCurrentMeme(queue[0]);
      }

      setGameState('starting');
      setCountdown(3);

      // Broadcast game state to all participants via Socket.io
      if (socket) {
        const gameStateData: SyncedGameState = {
          currentMemeIndex: 0,
          memeQueue: queue,
          startTimestamp: Date.now(),
          gameStarted: true
        };
        
        console.log('📢 Broadcasting game start to all participants');
        socket.emit('game-state-update', {
          contestId,
          state: gameStateData
        });
      }
    } catch (error) {
      console.error('Start game error:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  // Countdown effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      setGameState('playing');
    }
  }, [countdown]);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setSurvivalTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Google Meet Style - Host controls meme advancement, everyone syncs
  const handleNextMeme = () => {
    if (!isHost || !socket) return;
    
    const nextIndex = (memeIndex + 1) % memeQueue.length;
    
    // DON'T update local state here - let the socket event do it
    // This ensures host and participants update at the same time
    
    // Broadcast to ALL participants (server will echo back to host too)
    console.log(`📢 Host advancing to meme ${nextIndex} - Broadcasting to ALL`);
    socket.emit('next-meme', { 
      contestId, 
      memeIndex: nextIndex 
    });
  };

  const handlePreviousMeme = () => {
    if (!isHost || !socket) return;
    
    const prevIndex = memeIndex === 0 ? memeQueue.length - 1 : memeIndex - 1;
    
    // DON'T update local state here - let the socket event do it
    // This ensures host and participants update at the same time
    
    // Broadcast to ALL participants (server will echo back to host too)
    console.log(`📢 Host going to previous meme ${prevIndex} - Broadcasting to ALL`);
    socket.emit('next-meme', { 
      contestId, 
      memeIndex: prevIndex 
    });
  };

  // Listen for meme changes (EVERYONE including host listens now)
  useEffect(() => {
    if (!socket) return;
    
    const handleAdvanceMeme = ({ memeIndex: newIndex }: { memeIndex: number }) => {
      console.log(`🎬 ${isHost ? 'Host' : 'Participant'} syncing to meme ${newIndex}`);
      setMemeIndex(newIndex);
      if (memeQueue[newIndex]) {
        setCurrentMeme(memeQueue[newIndex]);
      }
    };
    
    socket.on('advance-meme', handleAdvanceMeme);
    
    return () => {
      socket.off('advance-meme', handleAdvanceMeme);
    };
  }, [socket, isHost, memeQueue]);



  // Share room details
  const handleShareRoom = async () => {
    const shareText = `🎮 Join my Don't Laugh Challenge!\n\nRoom Code: ${roomCode}\n\nJoin now at: ${window.location.origin}/multiplayer/join\n\nEnter the room code to play together! 🤣`;
    
    // Try using Web Share API (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Don't Laugh Challenge - Join My Room",
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedShareMessage(true);
        setTimeout(() => setCopiedShareMessage(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
        alert('Failed to copy share message');
      }
    }
  };

  // Calculate grid layout based on participant count
  // Always use 1 column for responsive, Google Meet-style layout
  const getGridLayout = () => {
    const count = participants.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-2';
    return 'grid-cols-2';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading room...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        
        {/* Lobby State */}
        {gameState === 'lobby' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Leave Room
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Multiplayer Lobby
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isHost 
                  ? `Waiting for players to join... (${participants.length} joined)`
                  : 'Waiting for host to start the game...'
                }
              </p>
            </div>

            {/* Status Banner */}
            {!isHost && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-400 rounded-r-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      Game will start soon
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Only the host can start the game. Get ready!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isHost && participants.length < 2 && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 dark:border-yellow-400 rounded-r-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                      Need more players
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Share the room code to invite at least one more player to start the game.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Participants */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Participants ({participants.length})
                  </h2>
                  <div className="space-y-3">
                    {participants.map(participant => {
                      const isHostParticipant = contest?.creator?.email === participant.email;
                      return (
                        <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full ${isHostParticipant ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'} flex items-center justify-center text-white font-bold relative`}>
                              {participant.name[0]}
                              {isHostParticipant && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                {participant.name}
                                {isHostParticipant && (
                                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded">
                                    HOST
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {participant.status === 'ready' ? '✓ Ready' : 'Waiting...'}
                              </div>
                            </div>
                          </div>
                          {participant.email === session?.user?.email && (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Game Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Game Info
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>• Random memes will be shown to all players</p>
                    <p>• Try not to smile or laugh!</p>
                    <p>• AI detects when you smile</p>
                    <p>• Last person standing wins</p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Room Code */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    Room Code
                  </h3>
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                      <div className="font-mono text-center text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-widest">
                        {roomCode || 'LOADING'}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(roomCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {copiedCode ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleShareRoom}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {copiedShareMessage ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span className="hidden sm:inline">Share</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    Copy code or share with friends to join
                  </p>
                </div>

                {/* Start Button or Waiting Status */}
                {isHost ? (
                  <button
                    onClick={handleStartGame}
                    disabled={participants.length < 2}
                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {participants.length < 2 ? 'Waiting for Players...' : 'Start Game'}
                  </button>
                ) : (
                  <div className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">
                        Waiting for host to start...
                      </span>
                    </div>
                  </div>
                )}

                {/* Host Info */}
                {!isHost && contest?.creator && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {contest.creator.name?.[0] || 'H'}
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">HOST</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {contest.creator.name || 'Host'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Game Rules */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    How to Play
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>• Everyone views the same memes</p>
                    <p>• Don&apos;t smile or laugh!</p>
                    <p>• Last person standing wins</p>
                    <p>• AI detects smiles in real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Playing State */}
        {(gameState === 'starting' || gameState === 'playing') && (
          <div className="h-screen flex flex-col">
            {/* Countdown Overlay */}
            {countdown !== null && countdown > 0 && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-8xl font-black text-white mb-4">
                    {countdown}
                  </div>
                  <p className="text-2xl text-white">Get Ready!</p>
                </div>
              </div>
            )}

            {/* Game Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    Multiplayer Challenge
                  </h1>
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                    {participants.filter(p => p.status === 'playing').length} Playing
                  </div>
                  {isHost && (
                    <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Host
                    </div>
                  )}
                  {/* AI Status Indicator */}
                  {isModelLoaded ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">
                        AI Active
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        Loading AI...
                      </span>
                    </div>
                  )}
                  {/* Smile Status Indicator */}
                  {smileStatus !== 'neutral' && smileStatus !== 'out' && (
                    <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold animate-pulse">
                      {smileStatus === 'smiling' ? '😄 Smiling!' : '⚠️ No Face'}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {Math.floor(survivalTime / 60)}:{(survivalTime % 60).toString().padStart(2, '0')}
                  </div>
                  {isHost && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to end the game for all players?')) {
                          router.push('/games');
                        }
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      End Game
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Game Layout - Google Meet Style */}
            <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 max-w-7xl mx-auto w-full overflow-hidden">
              {/* Left Side - Meme Display (Main Content) */}
              <div className="flex-1 min-w-0 h-[50vh] lg:h-auto flex flex-col">
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                  {currentMeme && (
                    <MemeDisplay 
                      currentMeme={{
                        ...currentMeme,
                        user: currentMeme.user 
                          ? { ...currentMeme.user, id: '', username: null }
                          : { id: '', name: null, username: null, image: null }
                      }} 
                      isPlaying={gameState === 'playing'} 
                    />
                  )}
                </div>
                
                {/* Host Meme Controls - Google Meet Style Presentation Controls */}
                {isHost && (
                  <div className="flex items-center justify-between mt-4 p-4 bg-gray-800 dark:bg-gray-900 rounded-lg shadow-lg">
                    <button
                      onClick={handlePreviousMeme}
                      className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-semibold"
                      title="Previous Meme"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    
                    <div className="px-4 py-2 bg-gray-700 dark:bg-gray-800 rounded-lg text-white font-semibold">
                      {memeIndex + 1} / {memeQueue.length}
                    </div>
                    
                    <button
                      onClick={handleNextMeme}
                      className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-semibold"
                      title="Next Meme"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {/* Participant Info - Non-host sees who's controlling */}
                {!isHost && (
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <p className="text-sm text-blue-300 text-center flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Host is controlling the presentation
                    </p>
                  </div>
                )}
                
                {/* Audio/Video Controls */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-colors ${
                      isMuted 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    } text-white shadow-lg`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-colors ${
                      isVideoOff 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    } text-white shadow-lg`}
                    title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                  >
                    {isVideoOff ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="px-4 py-2 bg-gray-700 rounded-full text-white text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Live
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side - Participants Grid (Scrollable) */}
              <div className="w-full lg:w-80 xl:w-96 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                  <div className={`grid ${getGridLayout()} gap-3 auto-rows-max pb-2`}>
                    {/* Local User Video - Google Meet Style */}
                    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-md border-2 border-blue-500">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover mirror"
                        style={{ transform: 'scaleX(-1)' }}
                        onLoadedMetadata={(e) => {
                          console.log('✅ Local video metadata loaded');
                          const video = e.target as HTMLVideoElement;
                          video.play().catch(err => console.error('Local video play error:', err));
                        }}
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 text-white text-xs rounded flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span>You</span>
                        {isMuted && (
                          <svg className="w-3 h-3 text-red-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        )}
                      </div>
                      {isVideoOff && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-2xl font-bold text-white">
                                {session?.user?.name?.[0] || 'Y'}
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs">Camera Off</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Remote Participants Videos - Google Meet Style */}
                    {Array.from(remoteStreams.entries()).map(([socketId, stream]) => {
                      console.log(`🎥 Rendering video for ${socketId}:`, {
                        streamId: stream.id,
                        videoTracks: stream.getVideoTracks().length,
                        audioTracks: stream.getAudioTracks().length,
                        active: stream.active
                      });
                      
                      return (
                        <div key={socketId} className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-md border-2 border-green-500">
                          <video
                            autoPlay
                            playsInline
                            muted={false}
                            ref={(video) => {
                              if (video) {
                                if (video.srcObject !== stream) {
                                  console.log(`📺 Setting srcObject for ${socketId}`);
                                  video.srcObject = stream;
                                  // Force play after setting srcObject
                                  video.play().catch(err => console.error('Video play error:', err));
                                } else {
                                  console.log(`✅ Video already set for ${socketId}`);
                                }
                              }
                            }}
                            className="w-full h-full object-cover"
                            onLoadedMetadata={(e) => {
                              console.log(`✅ Video metadata loaded for ${socketId}`);
                              const video = e.target as HTMLVideoElement;
                              video.play().catch(err => console.error('Video play error:', err));
                            }}
                          />
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 text-white text-xs rounded flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span>Participant</span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <div className="px-2 py-1 bg-green-500/90 text-white text-[10px] font-semibold rounded">
                              LIVE
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Show placeholders for expected participants if not connected yet */}
                    {participants.length > remoteStreams.size + 1 && 
                      Array.from({ length: Math.max(0, participants.length - remoteStreams.size - 1) }).map((_, idx) => (
                        <div key={`placeholder-${idx}`} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-700">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-gray-400 text-xs">Connecting...</p>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
