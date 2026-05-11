import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, doc, onSnapshot, setDoc, getDoc,
  updateDoc, collection, deleteDoc, addDoc, writeBatch, arrayUnion
} from 'firebase/firestore';
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from 'firebase/auth';
import {
  getStorage, ref as storageRef, uploadString, getDownloadURL
} from 'firebase/storage';
import {
  Plus, Layers, RotateCw, RotateCcw, Trash2, Maximize2, Minimize2, X, ChevronUp,
  FolderOpen, LayoutGrid, Move, Cloud, Copy, CheckCircle,
  Users, LogOut, AlertCircle, ExternalLink, Image as ImageIcon,
  Volume2, VolumeX, ArrowUp, ArrowDown, ArrowUpToLine, Save, MousePointer2, UserCircle, UserPlus,
  Key, Edit2, Loader2, CloudUpload, RefreshCw, Link as LinkIcon, FileJson,
  Eye, Lock, Unlock, Type, Gamepad2, Timer, TimerOff, Undo2, MessageCircle,
  Camera, Crosshair, UploadCloud, Video, HelpCircle, EyeOff, Dices, UserMinus, BookOpen,
  Bold, Italic, Underline, Strikethrough, List
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyBUPWtHxkVVoXZK5V_WeCEAQjBaYjf9uwY",
  authDomain: "mak-space-yulia.firebaseapp.com",
  projectId: "mak-space-yulia",
  storageBucket: "mak-space-yulia.appspot.com",
  messagingSenderId: "324239633120",
  appId: "1:324239633120:web:b581fdd4a1ff79f92ffe85",
  measurementId: "G-ZGQQFDQL3G"
};

const appId = "mak-space-yulia-sudorgina";
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1H65cuAhJ6rUKIvhuDthQCU8OWQ2RqdGgJOqhV24AqVs/export?format=csv&gid=402059779";
const ROOT_DRIVE_FOLDER_ID = "19-ZI-4tzVgRntc34yJTPGAVzZpyKksHl";
const DRIVE_API_KEY = "AIzaSyDXSTiw-Sd2jZve2Yv7bnbVRIAYcPre3N4";

const PLATFORM_BASE_URL = "https://online-cabinet.vercel.app";
const PLATFORM_DECKS_URL = `${PLATFORM_BASE_URL}/decks.json`;

const MaxIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 20V4L12 14L22 4V20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowElementIcon = ({ color, rotation = 0, className }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.25))' }}>
    <g transform={`rotate(${rotation}, 50, 50)`}>
      <polygon points="50,10 80,85 50,70 20,85" fill={color} />
    </g>
  </svg>
);

const FigureIcon = ({ gender, color, viewMode = 'side', rotation = 0, name = '', isMenu = false, isLaying = false, className }) => {
  const isMale = gender === 'male';

  if (isMenu) {
    return (
      <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}>
        <circle cx="50" cy="26" r="15" fill="#D4A364" />
        {isMale ? (
          <path d="M 32,42 L 68,42 L 60,85 L 40,85 Z" fill={color} />
        ) : (
          <path d="M 50,40 L 75,85 L 25,85 Z" fill={color} />
        )}
      </svg>
    );
  }

  const isSide = viewMode === 'side' && !isLaying;
  const rot = ((rotation % 360) + 360) % 360;

  let dir = 'up';
  if (rot >= 45 && rot < 135) dir = 'right';
  else if (rot >= 135 && rot <= 225) dir = 'down';
  else if (rot > 225 && rot < 315) dir = 'left';

  const hexColor = color.replace('#', '');
  const gradientId = `grad-${hexColor}-${gender}`;
  const shadowStyle = isLaying ? 'drop-shadow(0px 1px 3px rgba(0,0,0,0.4))' : 'drop-shadow(0px 6px 12px rgba(0,0,0,0.3))';

  const drawEyes = (cx1, cy1, cx2, cy2, r) => {
    if (isLaying) {
      return (
        <g>
          <path d={`M ${cx1-2},${cy1} Q ${cx1},${cy1+2} ${cx1+2},${cy1}`} stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d={`M ${cx2-2},${cy2} Q ${cx2},${cy2+2} ${cx2+2},${cy2}`} stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      );
    }
    return (
      <g>
        <circle cx={cx1} cy={cy1} r={r} fill="#222" />
        <circle cx={cx2} cy={cy2} r={r} fill="#222" />
      </g>
    );
  };

  const drawProfileEye = (cx, cy, r) => {
    if (isLaying) {
      return <path d={`M ${cx-2},${cy} Q ${cx},${cy+2} ${cx+2},${cy}`} stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
    }
    return <circle cx={cx} cy={cy} r={r} fill="#222" />;
  };

  return (
    <svg viewBox="0 0 100 100" className={className} style={{ overflow: 'visible', filter: shadowStyle }}>
      <defs>
        <radialGradient id="woodHead" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FCE3C5" />
          <stop offset="100%" stopColor="#C99454" />
        </radialGradient>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {isSide ? (
        <g>
          <g transform={`rotate(${rot}, 50, 24)`} opacity="0.6">
            <line x1="50" y1="24" x2="50" y2="-36" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
            <polygon points="50,-42 47,-34 53,-34" fill={color} />
          </g>
          
          <ellipse cx="50" cy="85" rx="25" ry="8" fill="rgba(0,0,0,0.2)" />
          {(dir === 'left' || dir === 'right') && (
            <g transform={dir === 'left' ? "scale(-1, 1) translate(-100, 0)" : ""}>
              {isMale ? (
                <>
                  <rect x="38" y="38" width="24" height="47" rx="4" fill={color} />
                  <rect x="38" y="38" width="24" height="47" rx="4" fill={`url(#${gradientId})`} />
                </>
              ) : (
                <>
                  <path d="M 50,35 L 70,85 L 30,85 Z" fill={color} />
                  <path d="M 50,35 L 70,85 L 30,85 Z" fill={`url(#${gradientId})`} />
                </>
              )}
              <circle cx="50" cy="24" r="14" fill="url(#woodHead)" />
              <polygon points="62,23 68,26 62,28" fill="#B3783A" />
              {drawProfileEye(56, 22, 1.8)}
            </g>
          )}

          {dir === 'down' && (
            <g>
              {isMale ? (
                <>
                  <path d="M 32,38 L 68,38 L 60,85 L 40,85 Z" fill={color} />
                  <path d="M 32,38 L 68,38 L 60,85 L 40,85 Z" fill={`url(#${gradientId})`} />
                </>
              ) : (
                <>
                  <path d="M 50,35 L 75,85 L 25,85 Z" fill={color} />
                  <path d="M 50,35 L 75,85 L 25,85 Z" fill={`url(#${gradientId})`} />
                </>
              )}
              <circle cx="50" cy="24" r="14" fill="url(#woodHead)" />
              <polygon points="50,26 47,30 53,30" fill="#A67C52" />
              {drawEyes(44, 24, 56, 24, 1.5)}
            </g>
          )}

          {dir === 'up' && (
            <g>
              {isMale ? (
                <>
                  <path d="M 32,38 L 68,38 L 60,85 L 40,85 Z" fill={color} />
                  <path d="M 32,38 L 68,38 L 60,85 L 40,85 Z" fill={`url(#${gradientId})`} />
                </>
              ) : (
                <>
                  <path d="M 50,35 L 75,85 L 25,85 Z" fill={color} />
                  <path d="M 50,35 L 75,85 L 25,85 Z" fill={`url(#${gradientId})`} />
                </>
              )}
              <circle cx="50" cy="24" r="14" fill="url(#woodHead)" />
            </g>
          )}

          {name && (
            <text
              x="50" y="65" textAnchor="middle" fontSize={dir === 'left' || dir === 'right' ? "7" : "10"}
              fontWeight="900" fill="rgba(255,255,255,0.95)" style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
              textLength={name.length > 4 ? (dir === 'left' || dir === 'right' ? "18" : "28") : undefined} lengthAdjust="spacingAndGlyphs"
            >
              {name}
            </text>
          )}
        </g>
      ) : (
        <g>
          <g transform={`rotate(${rot}, 50, 50)`}>
            <circle cx="50" cy="50" r="30" fill="rgba(0,0,0,0.15)" />
            {isMale ? (
              <>
                <rect x="25" y="30" width="50" height="40" rx="6" fill={color} />
                <rect x="25" y="30" width="50" height="40" rx="6" fill={`url(#${gradientId})`} />
              </>
            ) : (
              <>
                <circle cx="50" cy="50" r="28" fill={color} />
                <circle cx="50" cy="50" r="28" fill={`url(#${gradientId})`} />
              </>
            )}
            <circle cx="50" cy="50" r="14" fill="url(#woodHead)" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
            <polygon points="50,45 47,49 53,49" fill="#B3783A" />
            {drawEyes(45, 52, 55, 52, 1.8)}
          </g>

          {name && (
            <text
              x="50" y="85" textAnchor="middle" fontSize="10" fontWeight="900" fill="rgba(255,255,255,0.95)"
              style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }} textLength={name.length > 5 ? "35" : undefined} lengthAdjust="spacingAndGlyphs"
            >
              {name}
            </text>
          )}
        </g>
      )}
    </svg>
  );
};

const loadPlatformDecks = async () => {
  try {
    const res = await fetch(PLATFORM_DECKS_URL + '?t=' + Date.now());
    if (!res.ok) return [];
    const decksConfig = await res.json();
    return decksConfig.map(deck => {
      const base = deck.folder ? `${PLATFORM_BASE_URL}/${deck.folder}` : PLATFORM_BASE_URL;
      return {
        id: `platform_${deck.id}`,
        name: deck.name,
        isPlatformDeck: true,
        backImage: `${base}/${deck.back}`,
        cards: deck.cards.map(card => `${base}/${encodeURIComponent(card)}`)
      };
    });
  } catch (e) {
    console.error('Ошибка загрузки колод платформы:', e);
    return [];
  }
};

const COLORS = {
  plum: '#8B3252',
  forest: '#2D4A3E',
  terra: '#D26027', 
  ink: '#1C1020',
  haze: '#F2EFF5'
};

const TABLE_BACKGROUNDS = [
  { id: 'milky', name: 'Молочный', type: 'css', value: 'none', bgSize: 'auto', bgColor: '#FDFAF6', opacity: 1 },
  { id: 'forest', name: 'Зеленый', type: 'css', value: 'none', bgSize: 'auto', bgColor: '#2D4A3E', opacity: 1 },
  { id: 'plum', name: 'Сливовый', type: 'css', value: 'none', bgSize: 'auto', bgColor: '#8B3252', opacity: 1 },
  { id: 'purple', name: 'Фиолетовый', type: 'css', value: 'none', bgSize: 'auto', bgColor: '#4A148C', opacity: 1 },
  { id: 'terra', name: 'Терракотовый', type: 'css', value: 'none', bgSize: 'auto', bgColor: '#D26027', opacity: 1 } 
];

if (typeof window !== 'undefined' && !document.getElementById('tailwind-script')) {
  const configScript = document.createElement('script');
  configScript.innerHTML = `window.tailwind = { theme: { extend: { colors: { plum: '${COLORS.plum}', forest: '${COLORS.forest}', terra: '${COLORS.terra}', haze: '${COLORS.haze}', ink: '${COLORS.ink}' }}}}`;
  document.head.appendChild(configScript);
  const tailwindScript = document.createElement('script');
  tailwindScript.id = 'tailwind-script';
  tailwindScript.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(tailwindScript);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const myCursorColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

const extractDriveFileId = (url) => {
  if (!url) return null;
  let m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  return null;
};

const convertDriveLink = (url) => {
  if (!url || url.trim() === '') return null;
  url = url.trim();
  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) return url;
  const id = extractDriveFileId(url);
  if (!id) return url;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
};

const extractDriveFolderId = (url) => {
  if (!url) return null;
  let m = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  return null;
};

const loadDriveFolderFiles = async (folderId, apiKey) => {
  const q = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType)&key=${apiKey}&orderBy=name&includeItemsFromAllDrives=true&supportsAllDrives=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  const data = await res.json();
  return data.files || [];
};

const loadBaseDecks = async (notifyCb) => {
  try {
    const q = `'${ROOT_DRIVE_FOLDER_ID}' in parents and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType)&key=${DRIVE_API_KEY}&orderBy=name&includeItemsFromAllDrives=true&supportsAllDrives=true`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const allItems = data.files || [];
    
    const folders = allItems.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
    const images = allItems.filter(f => f.mimeType.includes('image/'));
    const loadedDecks = [];
    
    if (folders.length > 0) {
      for (const folder of folders) {
        const files = await loadDriveFolderFiles(folder.id, DRIVE_API_KEY);
        let backImage = null;
        const cards = [];
        for (const file of files) {
          const fileUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`;
          if (file.name.toLowerCase().includes('рубашка')) backImage = fileUrl;
          else cards.push(fileUrl);
        }
        if (cards.length > 0) {
          loadedDecks.push({ id: folder.id, name: folder.name, cards, backImage, isBaseDeck: true });
        }
      }
    } else if (images.length > 0) {
      let backImage = null;
      const cards = [];
      for (const file of images) {
        const fileUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`;
        if (file.name.toLowerCase().includes('рубашка')) backImage = fileUrl;
        else cards.push(fileUrl);
      }
      if (cards.length > 0) {
        loadedDecks.push({ id: ROOT_DRIVE_FOLDER_ID, name: "Базовая колода", cards, backImage, isBaseDeck: true });
      }
    }
    return loadedDecks;
  } catch (error) {
    return [];
  }
};

let globalAudioCtx = null;
const playSound = (type, isMuted) => {
  if (isMuted) return;
  if (typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return;
  }
  try {
    if (!globalAudioCtx) globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
    const osc = globalAudioCtx.createOscillator();
    const gain = globalAudioCtx.createGain();
    osc.connect(gain); gain.connect(globalAudioCtx.destination);
    if (type === 'drop') {
      osc.frequency.setValueAtTime(200, globalAudioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, globalAudioCtx.currentTime);
      osc.start(); osc.stop(globalAudioCtx.currentTime + 0.1);
    } else if (type === 'flip') {
      osc.frequency.setValueAtTime(400, globalAudioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, globalAudioCtx.currentTime);
      osc.start(); osc.stop(globalAudioCtx.currentTime + 0.05);
    } else if (type === 'dice') {
      osc.frequency.setValueAtTime(150, globalAudioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, globalAudioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, globalAudioCtx.currentTime);
      osc.start(); osc.stop(globalAudioCtx.currentTime + 0.2);
    }
  } catch (e) {}
};

const compressImage = (base64Str, maxWidth = 800, maxHeight = 800) => {
  if (base64Str.startsWith('http')) return Promise.resolve(base64Str);
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width; let height = img.height;
      if (width > height) {
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      } else {
        if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve(base64Str);
  });
};

const uploadImageToStorage = async (base64Str, path) => {
  if (base64Str.startsWith('http')) return base64Str;
  const imgRef = storageRef(storage, path);
  await uploadString(imgRef, base64Str, 'data_url');
  return await getDownloadURL(imgRef);
};

const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus(); el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
};

const renderDiceFace = (value, dotColor) => {
  const dots = {
    1: ['col-start-2 row-start-2'],
    2: ['col-start-1 row-start-1', 'col-start-3 row-start-3'],
    3: ['col-start-1 row-start-1', 'col-start-2 row-start-2', 'col-start-3 row-start-3'],
    4: ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-1 row-start-3', 'col-start-3 row-start-3'],
    5: ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-2 row-start-2', 'col-start-1 row-start-3', 'col-start-3 row-start-3'],
    6: ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-1 row-start-2', 'col-start-3 row-start-2', 'col-start-1 row-start-3', 'col-start-3 row-start-3']
  };
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-0.5 md:gap-1 w-6 h-6 md:w-8 md:h-8">
      {dots[value]?.map((pos, i) => (
        <div key={i} className={`rounded-full shadow-sm w-full h-full ${pos}`} style={{ backgroundColor: dotColor }}></div>
      ))}
    </div>
  );
};

function UndoTimer({ expiresAt }) {
  const [sec, setSec] = useState(10);
  useEffect(() => {
    const id = setInterval(() => {
      const left = Math.ceil((expiresAt - Date.now()) / 1000);
      setSec(Math.max(0, left));
    }, 200);
    return () => clearInterval(id);
  }, [expiresAt]);
  return <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 400 }}>{sec}с</span>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const roomIdRef = useRef('');
  const [inRoom, setInRoom] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isClientMode, setIsClientMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLaserMode, setIsLaserMode] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  
  const [platformName, setPlatformName] = useState("ОНЛАЙН КАБИНЕТ");
  
  // Состояния для собственной видеосвязи (WebRTC)
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const processedCandidates = useRef(new Set());
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoCallReady, setIsVideoCallReady] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  
  // Логика перемещения и изменения размера окна видеосвязи
  const videoDragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const videoResizeRef = useRef({ isResizing: false, startX: 0, startY: 0, startW: 320, startH: 420 });
  const [videoPos, setVideoPos] = useState({ x: 20, y: 20 });
  const [videoDim, setVideoDim] = useState({ w: 320, h: 420 });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVideoPos({ 
         x: Math.max(20, window.innerWidth - 340), 
         y: Math.max(20, window.innerHeight - 440) 
      });
    }
  }, []);

  const handleVideoPointerDown = (e) => {
    videoDragRef.current.isDragging = true;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    videoDragRef.current.startX = cx;
    videoDragRef.current.startY = cy;
    videoDragRef.current.initialX = videoPos.x;
    videoDragRef.current.initialY = videoPos.y;
  };

  const handleVideoResizePointerDown = (e) => {
    e.stopPropagation();
    videoResizeRef.current.isResizing = true;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    videoResizeRef.current.startX = cx;
    videoResizeRef.current.startY = cy;
    videoResizeRef.current.startW = videoDim.w;
    videoResizeRef.current.startH = videoDim.h;
  };

  useEffect(() => {
    const handleMove = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;

      if (videoDragRef.current.isDragging) {
        const dx = cx - videoDragRef.current.startX;
        const dy = cy - videoDragRef.current.startY;
        setVideoPos({
          x: videoDragRef.current.initialX + dx,
          y: videoDragRef.current.initialY + dy
        });
      } else if (videoResizeRef.current.isResizing) {
        const dx = cx - videoResizeRef.current.startX;
        const dy = cy - videoResizeRef.current.startY;
        setVideoDim({
          w: Math.max(240, videoResizeRef.current.startW + dx),
          h: Math.max(300, videoResizeRef.current.startH + dy)
        });
      }
    };
    const handleUp = () => { 
      videoDragRef.current.isDragging = false; 
      videoResizeRef.current.isResizing = false;
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchmove', handleUp);
    };
  }, [videoPos, videoDim]);

  const [isDicePanelOpen, setIsDicePanelOpen] = useState(false);
  const [isFiguresPanelOpen, setIsFiguresPanelOpen] = useState(false);

  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [savedNotes, setSavedNotes] = useState([]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteTitleInput, setNoteTitleInput] = useState('');
  const [isUploadingNoteImage, setIsUploadingNoteImage] = useState(false);
  const notebookEditorRef = useRef(null);

  const [figureColor, setFigureColor] = useState('#8B3252'); 
  const [figureName, setFigureName] = useState('');
  const [figureViewMode, setFigureViewMode] = useState('side');
  
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [clientNameInput, setClientNameInput] = useState('');
  const [userName, setUserName] = useState('');
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  
  const [cardsOnTable, setCardsOnTable] = useState([]);
  const [localDecks, setLocalDecks] = useState([]);
  const [cloudDecks, setCloudDecks] = useState([]);
  const [savedSessions, setSavedSessions] = useState([]);
  const [baseDecks, setBaseDecks] = useState([]);
  const [platformDecks, setPlatformDecks] = useState([]);
  
  const [isPlatformDecksLoading, setIsPlatformDecksLoading] = useState(false);
  const [isBaseDecksLoading, setIsBaseDecksLoading] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [activeDeckData, setActiveDeckData] = useState(null);
  
  const [dice, setDice] = useState({ value: 1, timestamp: 0 });
  const [visualDice, setVisualDice] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevDiceTime = useRef(0);
  
  const [diceType, setDiceType] = useState(6);
  const [diceD10, setDiceD10] = useState({ value: 1, timestamp: 0 });
  const [visualDiceD10, setVisualDiceD10] = useState(1);
  const [isAnimatingD10, setIsAnimatingD10] = useState(false);
  const prevDiceTimeD10 = useRef(0);
  
  const [cursors, setCursors] = useState({});
  const lastCursorSync = useRef(0);
  const scrollContainerRef = useRef(null);
  const boardRef = useRef(null);
  
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isLibraryFullscreen, setIsLibraryFullscreen] = useState(false);
  const [isLibraryDeckFlipped, setIsLibraryDeckFlipped] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [tableBg, setTableBg] = useState(TABLE_BACKGROUNDS[0]);
  const [previewCard, setPreviewCard] = useState(null);
  const [notification, setNotification] = useState("");
  const [isNamingDeck, setIsNamingDeck] = useState(false);
  const [tempDeckName, setTempDeckName] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState('platform');
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(null);
  const [timerDisplay, setTimerDisplay] = useState('');
  const [timerIsWarning, setTimerIsWarning] = useState(false);
  const timerIntervalRef = useRef(null);
  const [undoStack, setUndoStack] = useState(null);
  
  const [customDialog, setCustomDialog] = useState(null);

  const usedImages = new Set(cardsOnTable.filter(c => c.type === 'card').map(c => c.img));

  const notifyTimeoutRef = useRef(null);
  const notify = (text, time = 4000) => {
    setNotification(text);
    if (notifyTimeoutRef.current) clearTimeout(notifyTimeoutRef.current);
    notifyTimeoutRef.current = setTimeout(() => setNotification(""), time);
  };

  const askPrompt = (title, placeholder = '') => {
    return new Promise((resolve) => {
      setCustomDialog({
        type: 'prompt',
        title,
        placeholder,
        onOk: (val) => resolve(val),
        onCancel: () => resolve(null)
      });
    });
  };

  const askConfirm = (title) => {
    return new Promise((resolve) => {
      setCustomDialog({
        type: 'confirm',
        title,
        onOk: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  };

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
    ],
    iceCandidatePoolSize: 10
  };

  const startNativeCall = async () => {
    try {
      setIsVideoActive(true);
      setCallStatus('Диагностика оборудования...');
      processedCandidates.current.clear();
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCam = devices.some(d => d.kind === 'videoinput');
      if (!hasCam) throw new Error("Камера не найдена на этом устройстве");

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(rtcConfig);
      pcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
           remoteVideoRef.current.srcObject = event.streams[0];
           remoteVideoRef.current.play().catch(e => console.error("Play error:", e));
        }
        setCallStatus(''); 
      };

      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        if (state === 'failed') notify("Ошибка соединения: Сеть блокирует P2P поток. Проверьте VPN или брандмауэр.");
        if (state === 'disconnected') setCallStatus('Попытка восстановления связи...');
      };

      const callDoc = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_webrtc');
      await setDoc(callDoc, { offerCandidates: [], answerCandidates: [] });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { isVideoCallReady: true }, { merge: true });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          updateDoc(callDoc, { offerCandidates: arrayUnion(event.candidate.toJSON()) });
        }
      };

      const offer = await pc.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      await updateDoc(callDoc, { offer: { type: offer.type, sdp: offer.sdp } });
      
      setCallStatus('Ожидание подключения клиента...');

      onSnapshot(callDoc, async (snap) => {
        const data = snap.data();
        if (!data) return;

        if (data.answer && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        }

        if (pc.currentRemoteDescription && data.answerCandidates) {
          data.answerCandidates.forEach(c => {
            const candString = JSON.stringify(c);
            if (!processedCandidates.current.has(candString)) {
               pc.addIceCandidate(new RTCIceCandidate(c)).catch(()=>{});
               processedCandidates.current.add(candString);
            }
          });
        }
      });
    } catch (err) {
      setCallStatus('');
      setIsVideoActive(false);
      notify("Ошибка запуска: " + (err.message || "Нет доступа к камере"), 8000);
      console.error("WebRTC Error:", err);
    }
  };

  const joinNativeCall = async () => {
    try {
      setIsVideoActive(true);
      setCallStatus('Подключение к мастеру...');
      processedCandidates.current.clear();
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(rtcConfig);
      pcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
           remoteVideoRef.current.srcObject = event.streams[0];
           remoteVideoRef.current.play().catch(e => console.error("Play error:", e));
        }
        setCallStatus('');
      };

      const callDoc = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_webrtc');
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          updateDoc(callDoc, { answerCandidates: arrayUnion(event.candidate.toJSON()) });
        }
      };

      const callData = (await getDoc(callDoc)).data();
      if (!callData?.offer) {
        setCallStatus('Ожидание начала звонка...');
        return;
      }

      setCallStatus('Настройка потока...');
      await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await updateDoc(callDoc, { answer: { type: answer.type, sdp: answer.sdp } });

      onSnapshot(callDoc, (snap) => {
        const data = snap.data();
        if (!data) return;

        if (pc.currentRemoteDescription && data.offerCandidates) {
          data.offerCandidates.forEach(c => {
            const candString = JSON.stringify(c);
            if (!processedCandidates.current.has(candString)) {
               pc.addIceCandidate(new RTCIceCandidate(c)).catch(()=>{});
               processedCandidates.current.add(candString);
            }
          });
        }
      });
    } catch (err) {
      setCallStatus('');
      setIsVideoActive(false);
      notify("Ошибка входа: " + (err.message || "Проблема с камерой"), 8000);
      console.error("WebRTC Error:", err);
    }
  };

  const endNativeCall = async () => {
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current?.srcObject) remoteVideoRef.current.srcObject = null;
    setIsVideoActive(false);
    setCallStatus('');
    if (!isClientMode) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { isVideoCallReady: false }, { merge: true });
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_webrtc'));
    }
  };

  useEffect(() => {
     if (isVideoActive && isClientMode && roomId) {
       const callDoc = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_webrtc');
       const unsub = onSnapshot(callDoc, (docSnap) => {
          if (!docSnap.exists() && isVideoActive) {
             endNativeCall();
             notify('Психолог завершил звонок', 5000);
          }
       });
       return () => unsub();
     }
  }, [isVideoActive, isClientMode, roomId]);

  useEffect(() => {
    const init = async () => {
      try {
        await signInAnonymously(auth);
        onAuthStateChanged(auth, (u) => {
          setUser(u);
          if (u) setIsDbConnected(true);
          setAppLoading(false);
        });
      } catch (e) {
        console.error("Auth init error:", e);
        setAppLoading(false);
      }
      
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setRoomId(roomParam);
        roomIdRef.current = roomParam;
        setIsClientMode(true);
        window._isClientMode = true; 
      }
    };
    init();
  }, []);

  const handleLogin = async () => {
    if (!emailInput || !passwordInput) return notify("Введите Email и Пароль");
    const inputEmail = emailInput.trim().toLowerCase();
    const inputPwd = passwordInput.trim();
    const enterRoomAsPsy = (name) => {
      if (!roomId) {
        const newRoomId = `session_${Math.random().toString(36).substr(2, 6)}`;
        setRoomId(newRoomId);
        roomIdRef.current = newRoomId;
      } else {
        roomIdRef.current = roomId;
      }
      setUserName(name + " (Мастер)");
      setIsClientMode(false); window._isClientMode = false; setIsAuthorized(true); setInRoom(true); setShowKeyPrompt(false);
      notify(`Привет, ${name}! Базовые колоды загружаются...`);
    };
    
    if ((inputEmail === "yulia" || inputEmail === "юлия") && inputPwd === "owner777") {
      enterRoomAsPsy("Юлия");
      return;
    }
    
    setIsCheckingKey(true);
    try {
      let csvText = '';
      try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        csvText = await response.text();
      } catch (directErr) {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(GOOGLE_SHEET_CSV_URL)}`;
        const proxyResponse = await fetch(proxyUrl);
        if (!proxyResponse.ok) throw new Error(`Proxy HTTP ${proxyResponse.status}`);
        csvText = await proxyResponse.text();
      }
      const rows = csvText.split('\n').map(row => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
          if (row[i] === '"') { inQuotes = !inQuotes; }
          else if (row[i] === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
          else { current += row[i]; }
        }
        result.push(current.trim());
        return result;
      });
      let found = null; let valid = false;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].length >= 6 &&
          rows[i][0].trim().toLowerCase() === inputEmail &&
          rows[i][1].trim() === inputPwd) {
          found = rows[i][2].trim();
          let dateStr = rows[i][5].trim();
          if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          const expiry = new Date(dateStr).getTime();
          if (expiry && Date.now() < (expiry + 86400000)) {
            valid = true;
          }
          break;
        }
      }
      
      setIsCheckingKey(false);
      if (found && valid) { enterRoomAsPsy(found); } 
      else { notify(found ? "Подписка истекла" : "Неверный Email или Пароль"); }
    } catch (e) {
      setIsCheckingKey(false);
      notify("Ошибка связи с таблицей.");
    }
  };

  const clearTable = async () => {
    const unlocked = cardsOnTable.filter(c => !c.isLocked);
    if (unlocked.length === 0) return notify("Нет незакреплённых объектов на столе");
    if (undoStack?.timeoutId) clearTimeout(undoStack.timeoutId);
    const timeoutId = setTimeout(async () => {
      try {
        const batch = writeBatch(db);
        unlocked.forEach(card => { batch.delete(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, card.id)); });
        await batch.commit();
      } catch (e) {}
      setUndoStack(null);
    }, 10000);
    setUndoStack({ cards: unlocked, expiresAt: Date.now() + 10000, timeoutId });
  };

  const addElement = async (type, data) => {
    if (!isAuthorized || !roomId) return;
    playSound('drop', isMuted);
    const id = `elem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const maxZ = cardsOnTable.reduce((m, c) => Math.max(m, c.zIndex || 0), 0);
    const isField = type === 'field';
    
    let width = isField ? 800 : (type === 'figure' ? 80 : (type === 'arrow' ? 60 : (type === 'token' ? 45 : (type === 'text' || type === 'private-text' ? 200 : 160))));
    let height = isField ? 600 : (type === 'figure' ? 80 : (type === 'arrow' ? 60 : (type === 'token' ? 45 : (type === 'text' || type === 'private-text' ? 100 : 240))));
    
    let spawnX = 200;
    let spawnY = 150;
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      spawnX = container.scrollLeft + (container.clientWidth / 2) - (width / 2);
      spawnY = container.scrollTop + (container.clientHeight / 2) - (height / 2);
    }
    
    const elem = {
      id, type, ...data,
      x: spawnX, y: spawnY,
      width, height,
      rotation: (type === 'figure' || type === 'arrow') ? 180 : 0,
      isFlipped: !['token', 'text', 'private-text', 'figure', 'arrow', 'field'].includes(type),
      zIndex: isField ? 0 : maxZ + 1,
      isLocked: false
    };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, id), elem);
  };

  const toggleLibrary = () => {
    const newState = !isLibraryOpen;
    setIsLibraryOpen(newState);
    if (!isClientMode && isDbConnected && roomId) {
      setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_library_state'), { isOpen: newState }, { merge: true });
    }
  };

  const handleMouseMove = (e) => {
    if (!isAuthorized || !isDbConnected || !user || !roomId) return;
    const now = Date.now();
    if (now - lastCursorSync.current > 100) {
      lastCursorSync.current = now;
      const board = boardRef.current;
      if (!board) return;
      const rect = board.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const x = cx - rect.left;
      const y = cy - rect.top;
      setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}_cursors`, user.uid), {
        x, y, color: myCursorColor, timestamp: now, name: userName, isLaser: isLaserMode
      }).catch(() => {});
    }
  };

  if (appLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4" style={{ backgroundColor: COLORS.ink }}>
      <Loader2 className="animate-spin" color={COLORS.plum} size={48} />
      <span className="font-black uppercase text-xs opacity-50 tracking-widest">Загрузка кабинета...</span>
    </div>
  );

  if (!inRoom) return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden" style={{ backgroundColor: COLORS.ink, color: COLORS.haze }}>
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 space-y-8 relative z-10 text-center pb-12">
        <div className="relative" style={{ color: COLORS.ink }}>
          <h1 className="text-3xl font-black uppercase italic mb-2 leading-none">ОНЛАЙН КАБИНЕТ</h1>
          <p className="font-bold text-[10px] tracking-[0.3em] uppercase" style={{ color: COLORS.forest }}>Платформа для сессий</p>
        </div>
        
        <div className="space-y-4">
          {!isClientMode ? (
            !showKeyPrompt ? (
              <button onClick={() => setShowKeyPrompt(true)} style={{ backgroundColor: COLORS.plum, color: 'white' }} className="w-full font-black py-5 rounded-2xl text-xs uppercase tracking-widest shadow-lg flex flex-col items-center gap-2">
                <Key size={24} /> ВОЙТИ КАК ПСИХОЛОГ
              </button>
            ) : (
              <div className="space-y-3">
                <input type="text" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="Email" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center" style={{ borderColor: COLORS.plum }} />
                <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Пароль" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center" style={{ borderColor: COLORS.plum }} />
                <button onClick={handleLogin} disabled={isCheckingKey} style={{ backgroundColor: COLORS.forest, color: 'white' }} className="w-full font-black py-3 rounded-2xl text-xs uppercase tracking-widest">
                  {isCheckingKey ? "Проверка..." : "Войти"}
                </button>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <input type="text" value={clientNameInput} onChange={e => setClientNameInput(e.target.value)} placeholder="Ваше Имя" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center" style={{ borderColor: COLORS.forest }} />
              <button onClick={() => { if(clientNameInput.trim()){ setUserName(clientNameInput.trim()); setIsAuthorized(true); setInRoom(true); } }} style={{ backgroundColor: COLORS.forest, color: 'white' }} className="w-full font-black py-4 rounded-2xl text-xs uppercase tracking-widest">Войти в кабинет</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans select-none relative" style={{ backgroundColor: COLORS.haze }}>
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] text-white px-8 py-3 rounded-full shadow-2xl text-sm font-bold flex items-center gap-2 border" style={{ backgroundColor: COLORS.ink, borderColor: `${COLORS.plum}33` }}>
          <CheckCircle size={16} color={COLORS.terra} /> {notification}
        </div>
      )}

      {/* ШАПКА */}
      <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-3 bg-white/90 backdrop-blur-md border-b z-30 shadow-sm gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundImage: `linear-gradient(to bottom right, ${COLORS.plum}, ${COLORS.forest})` }}>
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black uppercase" style={{ color: COLORS.ink }}>{platformName}</h1>
            <span className="text-[8px] font-bold tracking-widest uppercase opacity-50">СЕССИЯ: {roomId}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isClientMode ? (
            <button onClick={() => setIsVideoModalOpen(true)} className="p-2.5 rounded-xl transition-all hover:bg-forest/10 text-forest border border-forest/20" title="Видеосвязь">
              <Video size={18} />
            </button>
          ) : (
            isVideoCallReady && (
              <button onClick={joinNativeCall} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black text-white shadow-lg bg-forest uppercase animate-pulse">
                <Video size={14} /> Видеосвязь
              </button>
            )
          )}
          
          {!isClientMode && (
            <>
              <button onClick={() => addElement('private-text', { text: "" })} className="p-2.5 rounded-xl text-purple-600 border border-purple-200 hover:bg-purple-50">
                <Type size={18} />
              </button>
              <button onClick={() => addElement('text', { text: "" })} className="p-2.5 rounded-xl text-terra border border-yellow-300 bg-yellow-50 hover:bg-yellow-100">
                <Type size={18} />
              </button>
              <button onClick={clearTable} className="p-2.5 rounded-xl text-terra hover:bg-terra/10 border border-terra/20">
                <Trash2 size={18} />
              </button>
            </>
          )}

          <button onClick={() => window.location.reload()} className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 border border-gray-200">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ХОЛСТ */}
      <main className="flex-1 relative overflow-hidden">
        <div ref={scrollContainerRef} className="absolute inset-0 overflow-auto custom-scrollbar">
          <div ref={boardRef} className="relative min-w-[3000px] min-h-[3000px] bg-transparent" onMouseMove={handleMouseMove} onTouchMove={handleMouseMove}>
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: tableBg.bgColor, backgroundImage: tableBg.value === 'none' ? 'none' : `url('${tableBg.value}')`, backgroundSize: tableBg.bgSize }}></div>
            
            {cardsOnTable
              .filter(elem => !undoStack?.cards.some(c => c.id === elem.id))
              .filter(elem => !(isClientMode && elem.type === 'private-text')) 
              .map((elem) => (
                <DraggableElement key={elem.id} element={elem} globalFigureView={figureViewMode} isClientMode={isClientMode} isMuted={isMuted} isLaserMode={isLaserMode} playSound={playSound} maxZIndex={Math.max(0, ...cardsOnTable.map(c => c.zIndex || 0))} onUpdate={(d) => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, elem.id), d)} onRemove={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, elem.id))} onPreview={() => elem.type === 'card' && setPreviewCard(elem)} currentUser={user} currentUserName={userName} onNotify={notify} boardRef={boardRef} />
              ))}
            
            {Object.entries(cursors).map(([id, cur]) => (
              <div key={id} className="absolute pointer-events-none z-[2000] flex flex-col items-center" style={{ left: cur.x, top: cur.y, transition: 'all 0.1s linear' }}>
                <MousePointer2 size={20} fill={cur.color} color="white" />
                <span className="text-[8px] font-bold text-white px-1 rounded" style={{ backgroundColor: cur.color }}>{cur.name}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ОКНО ВИДЕОСВЯЗИ */}
      {isVideoActive && (
        <div 
           className="fixed z-[200] bg-ink rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
           style={{ left: videoPos.x, top: videoPos.y, width: videoDim.w, height: videoDim.h, touchAction: 'none' }}
        >
          {/* Заголовок для перемещения */}
          <div 
             onMouseDown={handleVideoPointerDown}
             onTouchStart={handleVideoPointerDown}
             className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/60 to-transparent z-[60] cursor-move flex items-center justify-between px-6"
          >
            <span className="text-white text-[10px] font-black uppercase tracking-widest opacity-80">Видеосвязь</span>
            <button 
               onMouseDown={e => e.stopPropagation()} 
               onTouchStart={e => e.stopPropagation()} 
               onClick={endNativeCall} 
               className="bg-red-500/80 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors"
            >
               <X size={14} />
            </button>
          </div>
          
          <div className="flex-1 bg-black relative">
             {callStatus && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/90 z-40 text-center px-4">
                  <Loader2 className="animate-spin text-plum mb-3" size={32} />
                  <span className="text-white text-[10px] font-black tracking-widest uppercase opacity-80">{callStatus}</span>
               </div>
             )}
             <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
          
          <div className="absolute bottom-4 left-4 w-24 h-32 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-white/10 z-50">
             <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
          </div>

          {/* Хэндл для изменения размера */}
          <div 
             onMouseDown={handleVideoResizePointerDown}
             onTouchStart={handleVideoResizePointerDown}
             className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-[70] flex items-center justify-center text-white/40 hover:text-white"
          >
            <Maximize2 size={16} className="rotate-90" />
          </div>
        </div>
      )}

      {/* МОДАЛКА НАСТРОЙКИ ВИДЕО */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center backdrop-blur-md p-4 bg-ink/80">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative text-center">
            <button onClick={() => setIsVideoModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-800"><X size={20} /></button>
            <h2 className="text-xl font-black uppercase mb-4">Видеосвязь</h2>
            <p className="text-xs text-gray-500 mb-6">Запустите встроенный звонок. Окно можно перемещать и растягивать.</p>
            <button onClick={() => { setIsVideoModalOpen(false); startNativeCall(); }} className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest shadow-md bg-forest flex items-center justify-center gap-2">
              <Video size={18} /> Запустить звонок
            </button>
          </div>
        </div>
      )}

      {/* БИБЛИОТЕКА */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${isLibraryOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}`}>
        <div className="bg-white/95 backdrop-blur-2xl rounded-t-[2.5rem] shadow-2xl h-80 flex flex-col border-t">
          <button onClick={toggleLibrary} className="w-full flex flex-col items-center py-2 h-12 hover:bg-gray-50 rounded-t-[2.5rem]">
            <div className="w-10 h-1 bg-gray-200 rounded-full mb-1"></div>
            <span className="text-[10px] font-black uppercase text-plum flex items-center gap-2"><Layers size={14}/> Библиотека Мастера</span>
          </button>
          <div className="flex flex-1 p-6 overflow-hidden gap-6">
            {!isClientMode && (
              <div className="w-64 border-r pr-6 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                 <button onClick={() => setActiveTab('platform')} className={`w-full py-2 text-[10px] font-bold rounded-lg ${activeTab === 'platform' ? 'bg-plum text-white' : 'hover:bg-gray-100'}`}>БАЗОВЫЕ</button>
                 {platformDecks.map(deck => (
                   <button key={deck.id} onClick={() => selectDeck(deck)} className={`p-2 text-[10px] text-left rounded-lg transition-all ${selectedDeckId === deck.id ? 'bg-plum/10 text-plum font-bold' : 'hover:bg-gray-50'}`}>{deck.name}</button>
                 ))}
              </div>
            )}
            <div className="flex-1 overflow-x-auto flex gap-4 content-start items-start pb-4 custom-scrollbar">
              {activeDeckData?.cards.map((img, idx) => (
                <button key={idx} onClick={() => { addElement('card', { img, backImg: activeDeckData.backImage }); toggleLibrary(); }} className="flex-shrink-0 h-40 w-28 bg-white rounded-xl shadow-sm border overflow-hidden hover:scale-105 transition-transform">
                  <img src={img} className="w-full h-full object-contain" alt="" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .rich-text:empty:before { content: attr(data-placeholder); color: rgba(0,0,0,0.3); }
      `}</style>
    </div>
  );
}

function DraggableElement({ element, onUpdate, onRemove, onPreview, maxZIndex, playSound, isMuted, isClientMode, currentUser, currentUserName, onNotify, boardRef, globalFigureView, isLaserMode }) {
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleDragStart = (e) => {
    if (element.isLocked) return;
    setIsDragging(true);
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: cx - element.x, y: cy - element.y };
    onUpdate({ zIndex: maxZIndex + 1 });
  };

  useEffect(() => {
    const move = (e) => {
      if (!isDragging) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      onUpdate({ x: cx - startPos.current.x, y: cy - startPos.current.y });
    };
    const end = () => { if(isDragging) { setIsDragging(false); playSound('drop', isMuted); } };
    if (isDragging) {
      window.addEventListener('mousemove', move); window.addEventListener('mouseup', end);
      window.addEventListener('touchmove', move); window.addEventListener('touchend', end);
    }
    return () => {
      window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', move); window.removeEventListener('touchend', end);
    };
  }, [isDragging]);

  return (
    <div 
      className="absolute group transition-shadow"
      style={{ left: element.x, top: element.y, zIndex: element.zIndex, width: element.width, height: element.height }}
    >
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-lg shadow-xl border z-20">
         <button onClick={() => onUpdate({ isFlipped: !element.isFlipped })} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><RotateCw size={14}/></button>
         <button onClick={onRemove} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={14}/></button>
      </div>

      <div 
        onMouseDown={handleDragStart} 
        onTouchStart={handleDragStart}
        className={`w-full h-full rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border shadow-md transition-transform ${element.isFlipped ? 'rotate-y-180' : ''}`}
        style={{ backgroundColor: element.type === 'private-text' ? '#F3E8FF' : (element.type === 'text' ? '#FFF9C4' : 'white') }}
      >
        {element.type === 'card' ? (
          <img src={element.isFlipped ? element.backImg || 'https://via.placeholder.com/150' : element.img} className="w-full h-full object-contain pointer-events-none" alt="" />
        ) : (
          <div className="p-4 text-xs font-bold leading-relaxed">{element.text || "Заметка..."}</div>
        )}
      </div>
    </div>
  );
}
