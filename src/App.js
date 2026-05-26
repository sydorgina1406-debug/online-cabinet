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
  Plus, Layers, RotateCw, RotateCcw, Trash2, Maximize2, Minimize2, X, ChevronUp, ChevronDown,
  FolderOpen, LayoutGrid, Move, Cloud, Copy, CheckCircle,
  Users, LogOut, AlertCircle, ExternalLink, Image as ImageIcon,
  Volume2, VolumeX, ArrowUp, ArrowDown, ArrowUpToLine, Save, MousePointer2, UserCircle, UserPlus,
  Key, Edit2, Loader2, CloudUpload, RefreshCw, Link as LinkIcon, FileJson,
  Eye, Lock, Unlock, Type, Gamepad2, Timer, TimerOff, Undo2, MessageCircle,
  Camera, Crosshair, UploadCloud, Video, HelpCircle, EyeOff, Dices, UserMinus, BookOpen,
  Bold, Italic, Underline, Strikethrough, List, MonitorPlay
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
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const ArrowElementIcon = ({ color, rotation = 0, className }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.25))' }}>
    <g transform={`rotate(${rotation}, 50, 50)`}>
      <path d="M 50,10 L 80,85 L 50,70 L 20,85 Z" fill={color} stroke="white" strokeWidth="2" strokeLinejoin="round" />
    </g>
  </svg>
);

const FigureIcon = ({ gender, color, viewMode = 'side', rotation = 0, name = '', isMenu = false, isLaying = false, className }) => {
  const isMale = gender === 'male';

  if (isMenu) {
    return (
      <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}>
        <circle cx="50" cy="20" r="15" fill="#C99454" />
        {isMale ? (
          <rect x="25" y="40" width="50" height="55" rx="8" fill={color} />
        ) : (
          <path d="M 50,35 L 85,95 L 15,95 Z" fill={color} />
        )}
      </svg>
    );
  }

  const isSide = viewMode === 'side';
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
        <>
          <path d={`M ${cx1-3},${cy1} Q ${cx1},${cy1+3} ${cx1+3},${cy1}`} stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d={`M ${cx2-3},${cy2} Q ${cx2},${cy2+3} ${cx2+3},${cy2}`} stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
    }
    return (
      <>
        <circle cx={cx1} cy={cy1} r={r} fill="#222" />
        <circle cx={cx2} cy={cy2} r={r} fill="#222" />
      </>
    );
  };

  const drawProfileEye = (cx, cy, r) => {
    if (isLaying) {
      return <path d={`M ${cx-3},${cy} Q ${cx},${cy+3} ${cx+3},${cy}`} stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />;
    }
    return <circle cx={cx} cy={cy} r={r} fill="#222" />;
  };

  return (
    <svg viewBox="0 0 100 100" className={className} style={{ overflow: 'visible', filter: shadowStyle }}>
      <defs>
        <radialGradient id="woodHead" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#E6B981" />
          <stop offset="70%" stopColor="#C99454" />
          <stop offset="100%" stopColor="#A67C52" />
        </radialGradient>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
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
  let m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
  if (m) return m[1];
  m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
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
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn('Clipboard API failed, trying fallback', e);
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  } catch (e) {
    console.error('Fallback clipboard failed', e);
    return false;
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
    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2 md:p-3">
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [psychologistName, setPsychologistName] = useState('');

  const [platformName, setPlatformName] = useState("ОНЛАЙН КАБИНЕТ");

  // Video and WebRTC specific states
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const processedCandidates = useRef(new Set());
  const callSnapshotUnsubRef = useRef(null);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoCallReady, setIsVideoCallReady] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  
  // External Video Link specific states
  const [videoMode, setVideoMode] = useState(null); // 'native' | 'external' | null
  const [externalVideoLink, setExternalVideoLink] = useState('');
  const [savedVideoLink, setSavedVideoLink] = useState('');
  const [tempLinkInput, setTempLinkInput] = useState('');
  const [saveLinkPermanently, setSaveLinkPermanently] = useState(false);
  const [hasClickedJoinExternal, setHasClickedJoinExternal] = useState(false);

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
          w: Math.max(80, videoResizeRef.current.startW + dx),
          h: Math.max(110, videoResizeRef.current.startH + dy)
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

  const [diceD12, setDiceD12] = useState({ value: 1, timestamp: 0 });
  const [visualDiceD12, setVisualDiceD12] = useState(1);
  const [isAnimatingD12, setIsAnimatingD12] = useState(false);
  const prevDiceTimeD12 = useRef(0);

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

  const askPrompt = (title, defaultValue = '', placeholder = '') => {
    return new Promise((resolve) => {
      setCustomDialog({
        type: 'prompt',
        title,
        defaultValue,
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
    ]
  };

  const startNativeCall = async () => {
    try {
      setIsVideoActive(true);
      setCallStatus('Подготовка...');
      processedCandidates.current.clear();

      await new Promise(resolve => setTimeout(resolve, 100));

      setCallStatus('Доступ к камере...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
         localVideoRef.current.srcObject = stream;
         localVideoRef.current.play().catch(()=>{});
      }

      const pc = new RTCPeerConnection(rtcConfig);
      pcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        console.log('[PSY] ontrack получен:', event.streams);
        if (remoteVideoRef.current) {
           remoteVideoRef.current.srcObject = event.streams[0];
           remoteVideoRef.current.play().catch(err => console.warn('play err', err));
        }
        setCallStatus('');
      };

      pc.onconnectionstatechange = () => {
        console.log('[PSY] connectionState:', pc.connectionState);
        if (pc.connectionState === 'connected') setCallStatus('');
        else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') setCallStatus('Связь прервана...');
      };

      pc.oniceconnectionstatechange = () => {
        console.log('[PSY] iceConnectionState:', pc.iceConnectionState);
      };

      const callDoc = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_webrtc');
      await setDoc(callDoc, { offerCandidates: [], answerCandidates: [], createdAt: Date.now() });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[PSY] отправляю ICE кандидата');
          updateDoc(callDoc, { offerCandidates: arrayUnion(event.candidate.toJSON()) }).catch(e => console.error('ice send err', e));
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await updateDoc(callDoc, { offer: { type: offer.type, sdp: offer.sdp } });

      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { isVideoCallReady: true }, { merge: true });

      setCallStatus('Ожидание клиента...');

      if (callSnapshotUnsubRef.current) callSnapshotUnsubRef.current();

      let answerSet = false;

      callSnapshotUnsubRef.current = onSnapshot(callDoc, async (snap) => {
        const data = snap.data();
        if (!data) return;

        if (data.answer && !answerSet && pc.signalingState !== 'closed') {
          try {
            console.log('[PSY] получен answer, ставлю remoteDescription');
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            answerSet = true;
          } catch(e) { 
            console.error("[PSY] setRemoteDescription error", e); 
          }
        }

        if (pc.remoteDescription && data.answerCandidates) {
          for (const c of data.answerCandidates) {
            const candKey = JSON.stringify(c);
            if (!processedCandidates.current.has(candKey)) {
              processedCandidates.current.add(candKey);
              try {
                await pc.addIceCandidate(new RTCIceCandidate(c));
                console.log('[PSY] добавил answer кандидата');
              } catch(e) {
                console.warn('[PSY] addIceCandidate err', e);
              }
            }
          }
        }
      });
    } catch (err) {
      setCallStatus('');
      setIsVideoActive(false);
      notify("Ошибка видеосвязи: " + err.message, 8000);
      console.error("WebRTC Error:", err);
    }
  };

  const joinNativeCall = async () => {
    try {
      setIsVideoActive(true);
      setCallStatus('Подготовка...');
      processedCandidates.current.clear();

      await new Promise(resolve => setTimeout(resolve, 100));

      setCallStatus('Доступ к камере...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
         localVideoRef.current.srcObject = stream;
         localVideoRef.current.play().catch(()=>{});
      }

      const pc = new RTCPeerConnection(rtcConfig);
      pcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        console.log('[CLIENT] ontrack получен:', event.streams);
        if (remoteVideoRef.current) {
           remoteVideoRef.current.srcObject = event.streams[0];
           remoteVideoRef.current.play().catch(err => console.warn('play err', err));
        }
        setCallStatus('');
      };

      pc.onconnectionstatechange = () => {
        console.log('[CLIENT] connectionState:', pc.connectionState);
        if (pc.connectionState === 'connected') setCallStatus('');
        else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') setCallStatus('Связь прервана...');
      };

      pc.oniceconnectionstatechange = () => {
        console.log('[CLIENT] iceConnectionState:', pc.iceConnectionState);
      };

      const callDoc = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_webrtc');

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[CLIENT] отправляю ICE кандидата');
          updateDoc(callDoc, { answerCandidates: arrayUnion(event.candidate.toJSON()) }).catch(e => console.error('ice send err', e));
        }
      };

      setCallStatus('Ожидание сигнала от психолога...');

      let offerHandled = false;
      if (callSnapshotUnsubRef.current) callSnapshotUnsubRef.current();

      callSnapshotUnsubRef.current = onSnapshot(callDoc, async (snap) => {
        const data = snap.data();
        if (!data) return;

        if (data.offer && !offerHandled && pc.signalingState === 'stable') {
          offerHandled = true;
          try {
            console.log('[CLIENT] получен offer, ставлю remoteDescription');
            setCallStatus('Соединение...');
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await updateDoc(callDoc, { answer: { type: answer.type, sdp: answer.sdp } });
            console.log('[CLIENT] answer отправлен');
          } catch(e) {
            console.error('[CLIENT] обработка offer ошибка:', e);
            offerHandled = false;
          }
        }

        if (pc.remoteDescription && data.offerCandidates) {
          for (const c of data.offerCandidates) {
            const candKey = JSON.stringify(c);
            if (!processedCandidates.current.has(candKey)) {
              processedCandidates.current.add(candKey);
              try {
                await pc.addIceCandidate(new RTCIceCandidate(c));
                console.log('[CLIENT] добавил offer кандидата');
              } catch(e) {
                console.warn('[CLIENT] addIceCandidate err', e);
              }
            }
          }
        }
      });
    } catch (err) {
      setCallStatus('');
      setIsVideoActive(false);
      notify("Ошибка видеосвязи: " + err.message, 8000);
      console.error("WebRTC Error:", err);
    }
  };

  const endNativeCall = async () => {
    if (callSnapshotUnsubRef.current) {
      callSnapshotUnsubRef.current();
      callSnapshotUnsubRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
      remoteVideoRef.current.srcObject = null;
    }
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
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (!sessionTimer?.running) {
      setTimerDisplay('');
      setTimerIsWarning(false);
      return;
    }
    const tick = () => {
      const elapsed = Date.now() - sessionTimer.startedAt;
      const remaining = sessionTimer.duration - elapsed;
      if (remaining <= 0) {
        setTimerDisplay('00:00');
        setTimerIsWarning(true);
        clearInterval(timerIntervalRef.current);
        return;
      }
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimerDisplay(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      setTimerIsWarning(remaining < 5 * 60 * 1000);
    };
    tick();
    timerIntervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerIntervalRef.current);
  }, [sessionTimer]);

  const startTimer = async (minutes = 90) => {
    const data = { startedAt: Date.now(), duration: minutes * 60 * 1000, running: true };
    setSessionTimer(data);
    if (isDbConnected && roomId) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_timer_state'), data);
    }
    notify(`Таймер запущен: ${minutes} минут ⏱`);
  };

  const stopTimer = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setSessionTimer(null);
    setTimerDisplay('');
    setTimerIsWarning(false);
    if (isDbConnected && roomId) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_timer_state'));
    }
  };

  const detectVideoService = (url) => {
    if (!url) return null;
    const u = url.toLowerCase();
    if (u.includes('zoom.us')) return 'Zoom';
    if (u.includes('telemost.yandex') || u.includes('telemost.360')) return 'Телемост';
    if (u.includes('meet.google')) return 'Google Meet';
    if (u.includes('whereby.com')) return 'Whereby';
    if (u.includes('teams.microsoft') || u.includes('teams.live')) return 'Teams';
    if (u.includes('skype.com')) return 'Skype';
    return 'Видеосвязь';
  };

  const launchExternalVideo = async (linkToUse) => {
    const link = linkToUse?.trim();
    if (!link) return notify("Введите ссылку");
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return notify("Ссылка должна начинаться с https://");
    }
    try {
      const service = detectVideoService(link);
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_external_video'), {
        link, service, createdAt: Date.now()
      });
      if (saveLinkPermanently && user) {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'video'), {
          savedLink: link
        }, { merge: true });
        setSavedVideoLink(link);
      }
      setVideoMode('external');
      setIsVideoModalOpen(false);
      setTempLinkInput('');
      setSaveLinkPermanently(false);
      window.open(link, '_blank', 'noopener,noreferrer');
      notify(`Видеосвязь запущена (${service}) ✓`);
    } catch (e) {
      notify("Ошибка: " + e.message);
    }
  };

  const endExternalVideo = async () => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_external_video'));
      setVideoMode(null);
      setExternalVideoLink('');
      setHasClickedJoinExternal(false);
      notify("Внешняя видеосвязь завершена");
    } catch(e) { 
      notify("Ошибка: " + e.message); 
    }
  };

  const joinExternalVideo = () => {
    if (!externalVideoLink) return;
    setVideoMode('external');
    setHasClickedJoinExternal(true);
    window.open(externalVideoLink, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (dice.timestamp > prevDiceTime.current) {
      if (prevDiceTime.current !== 0) {
        playSound('dice', isMuted);
        setIsAnimating(true);
        const interval = setInterval(() => setVisualDice(Math.floor(Math.random() * 6) + 1), 80);
        const timeout = setTimeout(() => {
          clearInterval(interval);
          setVisualDice(dice.value);
          setIsAnimating(false);
        }, 600);
        prevDiceTime.current = dice.timestamp;
        return () => { clearInterval(interval); clearTimeout(timeout); };
      } else {
        setVisualDice(dice.value);
        prevDiceTime.current = dice.timestamp;
      }
    }
  }, [dice.timestamp, dice.value, isMuted]);

  useEffect(() => {
    if (diceD10.timestamp > prevDiceTimeD10.current) {
      if (prevDiceTimeD10.current !== 0) {
        playSound('dice', isMuted);
        setIsAnimatingD10(true);
        const interval = setInterval(() => setVisualDiceD10(Math.floor(Math.random() * 10) + 1), 80);
        const timeout = setTimeout(() => {
          clearInterval(interval);
          setVisualDiceD10(diceD10.value);
          setIsAnimatingD10(false);
        }, 600);
        prevDiceTimeD10.current = diceD10.timestamp;
        return () => { clearInterval(interval); clearTimeout(timeout); };
      } else {
        setVisualDiceD10(diceD10.value);
        prevDiceTimeD10.current = diceD10.timestamp;
      }
    }
  }, [diceD10.timestamp, diceD10.value, isMuted]);

  useEffect(() => {
    if (diceD12.timestamp > prevDiceTimeD12.current) {
      if (prevDiceTimeD12.current !== 0) {
        playSound('dice', isMuted);
        setIsAnimatingD12(true);
        const interval = setInterval(() => setVisualDiceD12(Math.floor(Math.random() * 12) + 1), 80);
        const timeout = setTimeout(() => {
          clearInterval(interval);
          setVisualDiceD12(diceD12.value);
          setIsAnimatingD12(false);
        }, 600);
        prevDiceTimeD12.current = diceD12.timestamp;
        return () => { clearInterval(interval); clearTimeout(timeout); };
      } else {
        setVisualDiceD12(diceD12.value);
        prevDiceTimeD12.current = diceD12.timestamp;
      }
    }
  }, [diceD12.timestamp, diceD12.value, isMuted]);

  useEffect(() => {
    const init = async () => {
      try { await signInAnonymously(auth); } catch (e) {}
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u) setIsDbConnected(true);
        setAppLoading(false);
      });
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

  useEffect(() => {
    if (inRoom && !isClientMode) {
      setIsPlatformDecksLoading(true);
      loadPlatformDecks().then(decks => {
        setPlatformDecks(decks);
        setIsPlatformDecksLoading(false);
      });
      setIsBaseDecksLoading(true);
      loadBaseDecks((msg) => notify(msg, 6000)).then(decks => {
        setBaseDecks(decks);
        setIsBaseDecksLoading(false);
      });
    }
  }, [inRoom, isClientMode]);

  useEffect(() => {
    if (!user || !isDbConnected || isClientMode) return;
    const unsubDecks = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), (s) => {
      setCloudDecks(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubSessions = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_sessions'), (s) => {
      setSavedSessions(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt));
    });
    const unsubNotes = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_notes'), (s) => {
      setSavedNotes(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt));
    });
    return () => { unsubDecks(); unsubSessions(); unsubNotes(); };
  }, [user, isDbConnected, isClientMode]);

  useEffect(() => {
    if (!user || !isAuthorized || !roomId) return;
    const tUnsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`), (snap) => {
      const cards = [];
      snap.docs.forEach(d => {
        if (d.id === '_dice_state') setDice({ value: d.data().value, timestamp: d.data().timestamp });
        else if (d.id === '_dice_d10_state') setDiceD10({ value: d.data().value, timestamp: d.data().timestamp });
        else if (d.id === '_dice_d12_state') setDiceD12({ value: d.data().value, timestamp: d.data().timestamp });
        else if (d.id === '_dice_type') setDiceType(d.data().type || 6);
        else if (d.id === '_settings') {
          if (d.data().platformName) setPlatformName(d.data().platformName);
          if (d.data().tableBg && typeof d.data().tableBg === 'object') setTableBg(d.data().tableBg);
          if (d.data().figureViewMode) setFigureViewMode(d.data().figureViewMode);
          if (d.data().isVideoCallReady !== undefined) setIsVideoCallReady(d.data().isVideoCallReady);
          if (d.data().psychologistName) setPsychologistName(d.data().psychologistName);
        }
        else if (d.id === '_library_state') {
          const libraryData = d.data();
          if (libraryData.isOpen !== undefined && !window._isClientMode) setIsLibraryOpen(libraryData.isOpen);
          if (libraryData.isFullscreen !== undefined && !window._isClientMode) setIsLibraryFullscreen(libraryData.isFullscreen);
          if (libraryData.isFlipped !== undefined) setIsLibraryDeckFlipped(libraryData.isFlipped);
        }
        else if (d.id === '_active_deck') { setActiveDeckData(d.data()); }
        else if (d.id === '_timer_state') { setSessionTimer(d.data()); }
        else if (!d.id.startsWith('_')) cards.push({ id: d.id, ...d.data() });
      });
      setCardsOnTable(cards);
    });
    const cUnsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', `room_${roomId}_cursors`), (s) => {
      const cur = {}; const now = Date.now();
      s.docs.forEach(d => { if (d.id !== user.uid && now - d.data().timestamp < 10000) cur[d.id] = d.data(); });
      setCursors(cur);
    });
    return () => { tUnsub(); cUnsub(); };
  }, [user, isAuthorized, roomId, isDbConnected, isClientMode]);

  useEffect(() => {
    if (!user || !isAuthorized || isClientMode) return;
    const loadSaved = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'video'));
        if (docSnap.exists() && docSnap.data().savedLink) {
          setSavedVideoLink(docSnap.data().savedLink);
        }
      } catch(e) {}
    };
    loadSaved();
  }, [user, isAuthorized, isClientMode]);
  
  useEffect(() => {
    if (!user || !isAuthorized || !roomId) return;
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_external_video'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setExternalVideoLink(data.link || '');
      } else {
        setExternalVideoLink('');
        if (videoMode === 'external') {
          setVideoMode(null);
          setHasClickedJoinExternal(false);
        }
      }
    });
    return () => unsub();
  }, [user, isAuthorized, roomId, videoMode]);

  const handleMouseMove = (e) => {
    if (!isAuthorized || !isDbConnected || !user || !roomId) return;
    const now = Date.now();
    if (now - lastCursorSync.current > 100) {
      lastCursorSync.current = now;
      const board = boardRef.current;
      if (!board) return;
      const rect = board.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}_cursors`, user.uid), {
        x, y, color: myCursorColor, timestamp: now, name: userName, isLaser: isLaserMode
      }).catch(() => {});
    }
  };

  const editPlatformName = async () => {
    const newName = await askPrompt("Название вашего кабинета:", platformName);
    if (newName && newName.trim() !== "") {
      const val = newName.trim();
      setPlatformName(val);
      if (isDbConnected && user && roomId) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { platformName: val }, { merge: true });
      }
    }
  };

  const updateGlobalFigureView = async (mode) => {
    if (!isDbConnected || !roomId) return;
    setFigureViewMode(mode);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { figureViewMode: mode }, { merge: true });
  };

  const syncLibraryUI = async (updates) => {
    if (isClientMode || !isDbConnected || !roomId) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_library_state'), updates, { merge: true });
  };

  const toggleLibrary = () => {
    const newState = !isLibraryOpen;
    setIsLibraryOpen(newState);
    syncLibraryUI({ isOpen: newState });
  };

  const toggleFullscreen = () => {
    const newState = !isLibraryFullscreen;
    setIsLibraryFullscreen(newState);
    syncLibraryUI({ isFullscreen: newState });
  };

  const toggleDeckFlip = () => {
    const newState = !isLibraryDeckFlipped;
    setIsLibraryDeckFlipped(newState);
    syncLibraryUI({ isFlipped: newState });
  };

  const selectDeck = async (deck) => {
    if (isClientMode) return;
    setSelectedDeckId(deck.id);
    setActiveDeckData(deck);
    const currentRoomId = roomIdRef.current || roomId;
    if (!currentRoomId) {
      notify("Ошибка: сессия не найдена. Перезайдите.");
      return;
    }
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${currentRoomId}`, '_active_deck'), {
        id: deck.id, name: deck.name, cards: deck.cards || [], backImage: deck.backImage || null
      });
      syncLibraryUI({ isFlipped: false });
      notify(`Колода "${deck.name}" активирована ✓`);
    } catch(e) {
      notify("Ошибка синхронизации: " + e.message);
    }
  };

  const handleLogin = async () => {
    if (!emailInput || !passwordInput) return notify("Введите Email и Пароль");
    const inputEmail = emailInput.trim().toLowerCase();
    const inputPwd = passwordInput.trim();
    const enterRoomAsPsy = async (name) => {
      let currentRoomId = roomId;
      if (!roomId) {
        currentRoomId = `session_${Math.random().toString(36).substr(2, 6)}`;
        setRoomId(currentRoomId);
        roomIdRef.current = currentRoomId;
      } else {
        roomIdRef.current = roomId;
      }
      setUserName(name + " (Мастер)");
      setIsClientMode(false); window._isClientMode = false; setIsAuthorized(true); setInRoom(true); setShowKeyPrompt(false);
      
      try {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', `room_${currentRoomId}`, '_settings'),
          { psychologistName: name },
          { merge: true }
        );
      } catch (e) {
        console.error('Не удалось сохранить имя психолога:', e);
      }
      
      notify(`Здравствуйте, ${name}. Кабинет готов.`);
    };

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
      if (found && valid) { 
        enterRoomAsPsy(found); 
      } else { 
        notify(found ? "Подписка истекла (Проверьте формат даты в таблице)" : "Неверный Email или Пароль"); 
      }
    } catch (e) {
      setIsCheckingKey(false);
      notify("Ошибка связи с таблицей. Включите прокси или убедитесь что таблица опубликована в интернете.");
    }
  };

  const handleClientLogin = () => {
    if (!clientNameInput.trim()) return notify("Укажите ваше имя");
    setUserName(clientNameInput.trim());
    setIsAuthorized(true);
    setInRoom(true);
    window._isClientMode = true;
  };

  const shareLinkToClient = async () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    const success = await copyToClipboard(url);
    if (success !== false) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
      notify('Ссылка скопирована!');
    } else {
      notify('Не удалось скопировать. Скопируйте ссылку вручную из адресной строки.');
    }
  };

  const saveCurrentSession = async () => {
    const name = await askPrompt("Введите название для сохранения текущего стола (например: Сессия с Анной):");
    if (!name || !name.trim()) return;
    notify("Сохраняю сессию...");
    try {
      const elementsToSave = cardsOnTable.filter(c => c.id !== '_settings' && c.id !== '_dice_state' && c.id !== '_dice_type' && c.id !== '_library_state' && !c.id.startsWith('_'));
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_sessions'), {
        name: name.trim(),
        elements: elementsToSave,
        createdAt: Date.now()
      });
      notify("Сессия успешно сохранена! Ищите ее во вкладке СЕССИИ в библиотеке.");
    } catch (e) {
      notify("Ошибка сохранения сессии: " + e.message);
    }
  };

  const loadSavedSession = async (session) => {
    const ok = await askConfirm(`Вы уверены, что хотите загрузить "${session.name}"? Текущий стол будет ОЧИЩЕН.`);
    if (!ok) return;
    notify("Загружаю сессию...");
    try {
      const batch = writeBatch(db);
      const currentElements = cardsOnTable.filter(c => !c.id.startsWith('_'));
      currentElements.forEach(el => {
        batch.delete(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, el.id));
      });
      session.elements.forEach(el => {
        const newId = `elem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        batch.set(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, newId), { ...el, id: newId });
      });
      await batch.commit();
      notify("Сессия загружена на стол! ✓");
      if (isLibraryOpen) toggleLibrary();
    } catch (e) {
      notify("Ошибка загрузки сессии: " + e.message);
    }
  };

  const handleNoteImageUpload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setIsUploadingNoteImage(true);
    notify("Загрузка картинки...", 4000);
    try {
      const data = await new Promise(r => { const rd = new FileReader(); rd.onload = ev => r(ev.target.result); rd.readAsDataURL(f); });
      const comp = await compressImage(data, 800, 800);
      const url = await uploadImageToStorage(comp, `notes_images/${user?.uid || 'anon'}/${Date.now()}.jpg`);
      if (notebookEditorRef.current) {
        notebookEditorRef.current.focus();
        document.execCommand('insertImage', false, url);
      }
      notify("Картинка добавлена!");
    } catch (err) {
      notify("Ошибка загрузки: " + err.message);
    } finally {
      setIsUploadingNoteImage(false);
      e.target.value = '';
    }
  };

  const takeScreenshot = async () => {
    if (!boardRef.current) return;

    const elements = cardsOnTable.filter(c => !c.id.startsWith('_'));
    if (elements.length === 0) {
      return notify("Стол пуст, нечего сохранять");
    }

    notify("Создаю скриншот, подождите...", 8000);

    try {
      const PADDING = 60;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      elements.forEach(el => {
        const x = el.x || 0;
        const y = el.y || 0;
        const w = el.width || 160;
        const h = el.height || 240;
        const cx = x + w / 2;
        const cy = y + h / 2;
        const half = Math.sqrt(w * w + h * h) / 2;
        minX = Math.min(minX, cx - half);
        minY = Math.min(minY, cy - half);
        maxX = Math.max(maxX, cx + half);
        maxY = Math.max(maxY, cy + half);
      });
      minX = Math.max(0, minX - PADDING);
      minY = Math.max(0, minY - PADDING);
      maxX += PADDING;
      maxY += PADDING;
      const W = Math.ceil(maxX - minX);
      const H = Math.ceil(maxY - minY);
      
      const SCALE = 2;
      const canvas = document.createElement('canvas');
      canvas.width = W * SCALE;
      canvas.height = H * SCALE;
      const ctx = canvas.getContext('2d');
      ctx.scale(SCALE, SCALE);
      
      ctx.fillStyle = tableBg?.bgColor || '#FDFAF6';
      ctx.fillRect(0, 0, W, H);
      
      const loadImageSafe = async (url) => {
        if (!url) return null;
        
        const tryLoad = (src) => new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Load failed'));
          img.src = src;
        });

        const proxies = [
          url,
          `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
          `https://corsproxy.io/?${encodeURIComponent(url)}`
        ];

        for (const proxyUrl of proxies) {
          try {
            const img = await tryLoad(proxyUrl);
            if (img && img.naturalWidth > 0) return img;
          } catch (e) {
            // Переходим к следующему прокси
          }
        }
        
        // Последний fallback: получение base64 через JSON
        try {
          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.contents) {
              return await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = data.contents;
              });
            }
          }
        } catch (e) {}

        return null;
      };
      
      const roundRectPath = (cx, cy, cw, ch, r) => {
        ctx.beginPath();
        ctx.moveTo(cx + r, cy);
        ctx.arcTo(cx + cw, cy, cx + cw, cy + ch, r);
        ctx.arcTo(cx + cw, cy + ch, cx, cy + ch, r);
        ctx.arcTo(cx, cy + ch, cx, cy, r);
        ctx.arcTo(cx, cy, cx + cw, cy, r);
        ctx.closePath();
      };
      
      const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      
      const imageCache = {};
      const sources = new Set();
      sorted.forEach(el => {
        if (el.img) sources.add(el.img);
        if (el.backImg) sources.add(el.backImg);
      });
      await Promise.all(Array.from(sources).map(async src => {
        imageCache[src] = await loadImageSafe(src);
      }));
      
      for (const el of sorted) {
        const x = (el.x || 0) - minX;
        const y = (el.y || 0) - minY;
        const ew = el.width || 160;
        const eh = el.height || 240;
        
        const rot = el.type === 'figure' ? 0 : (el.rotation || 0);

        ctx.save();
        ctx.translate(x + ew / 2, y + eh / 2);
        ctx.rotate(rot * Math.PI / 180);
        ctx.translate(-ew / 2, -eh / 2);

        try {
          if (el.type === 'card') {
            const imgSrc = el.isFlipped ? el.backImg : el.img;
            const img = imgSrc ? imageCache[imgSrc] : null;

            ctx.save();
            roundRectPath(0, 0, ew, eh, 14);
            ctx.fillStyle = el.isFlipped ? '#2D4A3E' : 'white';
            ctx.fill();
            ctx.clip();

            if (img && img.naturalWidth > 0) {
              const imgR = img.naturalWidth / img.naturalHeight;
              const boxR = ew / eh;
              let dw, dh, dx, dy;
              if (imgR > boxR) {
                dw = ew; dh = ew / imgR; dx = 0; dy = (eh - dh) / 2;
              } else {
                dh = eh; dw = eh * imgR; dx = (ew - dw) / 2; dy = 0;
              }
              ctx.drawImage(img, dx, dy, dw, dh);
            } else {
              const grad = ctx.createLinearGradient(0, 0, ew, eh);
              grad.addColorStop(0, el.isFlipped ? '#2D4A3E' : '#E2E8F0');
              grad.addColorStop(1, el.isFlipped ? '#1C1020' : '#CBD5E1');
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, ew, eh);
              ctx.fillStyle = el.isFlipped ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
              ctx.font = 'bold 11px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(el.isFlipped ? 'MAK SPACE' : 'Недоступно', ew / 2, eh / 2);
            }
            ctx.restore();

            roundRectPath(0, 0, ew, eh, 14);
            ctx.strokeStyle = 'rgba(0,0,0,0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();

          } else if (el.type === 'field') {
            const img = el.img ? imageCache[el.img] : null;
            if (img && img.naturalWidth > 0) {
              const imgR = img.naturalWidth / img.naturalHeight;
              const boxR = ew / eh;
              let dw, dh, dx, dy;
              if (imgR > boxR) {
                dw = ew; dh = ew / imgR; dx = 0; dy = (eh - dh) / 2;
              } else {
                dh = eh; dw = eh * imgR; dx = (ew - dw) / 2; dy = 0;
              }
              ctx.drawImage(img, dx, dy, dw, dh);
            }
          } else if (el.type === 'token') {
            ctx.beginPath();
            ctx.arc(ew / 2, eh / 2, ew / 2 - 1, 0, Math.PI * 2);
            ctx.fillStyle = el.color || '#8B3252';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.85)';
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (el.type === 'arrow') {
            const sx = ew / 100;
            const sy = eh / 100;
            ctx.fillStyle = el.color || '#8B3252';
            ctx.beginPath();
            ctx.moveTo(50 * sx, 10 * sy);
            ctx.lineTo(80 * sx, 85 * sy);
            ctx.lineTo(50 * sx, 70 * sy);
            ctx.lineTo(20 * sx, 85 * sy);
            ctx.closePath();
            ctx.fill();
          } else if (el.type === 'figure') {
            const color = el.color || '#8B3252';
            const isMale = el.gender === 'male';

            if (figureViewMode === 'top') {
              const fRot = el.rotation || 0;
              ctx.save();
              ctx.translate(ew / 2, eh / 2);
              ctx.rotate(fRot * Math.PI / 180);
              ctx.translate(-ew / 2, -eh / 2);

              ctx.fillStyle = 'rgba(0,0,0,0.15)';
              ctx.beginPath(); ctx.arc(ew * 0.5, eh * 0.5, ew * 0.3, 0, Math.PI * 2); ctx.fill();

              ctx.fillStyle = color;
              if (isMale) {
                roundRectPath(ew * 0.25, eh * 0.3, ew * 0.5, eh * 0.4, 6);
                ctx.fill();
              } else {
                ctx.beginPath(); ctx.arc(ew * 0.5, eh * 0.5, ew * 0.28, 0, Math.PI * 2); ctx.fill();
              }
              
              ctx.fillStyle = '#C99454';
              ctx.beginPath(); ctx.arc(ew * 0.5, eh * 0.5, ew * 0.14, 0, Math.PI * 2); ctx.fill();
              ctx.strokeStyle = 'rgba(0,0,0,0.1)';
              ctx.lineWidth = 1;
              ctx.stroke();

              ctx.fillStyle = '#222';
              ctx.beginPath(); ctx.arc(ew * 0.45, eh * 0.52, 1.8, 0, Math.PI * 2); ctx.fill();
              ctx.beginPath(); ctx.arc(ew * 0.55, eh * 0.52, 1.8, 0, Math.PI * 2); ctx.fill();
              ctx.restore();

              if (el.name) {
                ctx.font = `900 10px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                ctx.lineWidth = 2;
                ctx.strokeText(String(el.name), ew / 2, eh * 0.85);
                ctx.fillStyle = 'white';
                ctx.fillText(String(el.name), ew / 2, eh * 0.85);
              }
            } else {
              const rotAngle = ((el.rotation % 360) + 360) % 360;
              let dir = 'up';
              if (rotAngle >= 45 && rotAngle < 135) dir = 'right';
              else if (rotAngle >= 135 && rotAngle <= 225) dir = 'down';
              else if (rotAngle > 225 && rotAngle < 315) dir = 'left';

              if (dir === 'left' || dir === 'right') {
                ctx.save();
                if (dir === 'left') {
                  ctx.translate(ew, 0);
                  ctx.scale(-1, 1);
                }
                
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.beginPath();
                ctx.ellipse(ew * 0.5, eh * 0.85, ew * 0.25, eh * 0.08, 0, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.fillStyle = color;
                if (isMale) {
                  roundRectPath(ew * 0.38, eh * 0.38, ew * 0.24, eh * 0.47, 4);
                  ctx.fill();
                } else {
                  ctx.beginPath();
                  ctx.moveTo(ew * 0.5, eh * 0.35);
                  ctx.lineTo(ew * 0.7, eh * 0.85);
                  ctx.lineTo(ew * 0.3, eh * 0.85);
                  ctx.closePath();
                  ctx.fill();
                }
                
                ctx.fillStyle = '#C99454';
                ctx.beginPath();
                ctx.arc(ew * 0.5, eh * 0.24, ew * 0.14, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#B3783A';
                ctx.beginPath();
                ctx.moveTo(ew * 0.62, eh * 0.23);
                ctx.lineTo(ew * 0.68, eh * 0.26);
                ctx.lineTo(ew * 0.62, eh * 0.28);
                ctx.closePath();
                ctx.fill();
                
                if (el.isLaying) {
                  ctx.strokeStyle = '#333';
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  ctx.moveTo(ew * 0.53, eh * 0.22);
                  ctx.quadraticCurveTo(ew * 0.56, eh * 0.25, ew * 0.59, eh * 0.22);
                  ctx.stroke();
                } else {
                  ctx.fillStyle = '#222';
                  ctx.beginPath();
                  ctx.arc(ew * 0.56, eh * 0.22, 1.8, 0, Math.PI * 2);
                  ctx.fill();
                }
                ctx.restore();
              } else if (dir === 'down') {
                ctx.fillStyle = color;
                if (isMale) {
                  ctx.beginPath();
                  ctx.moveTo(ew * 0.32, eh * 0.38);
                  ctx.lineTo(ew * 0.68, eh * 0.38);
                  ctx.lineTo(ew * 0.60, eh * 0.85);
                  ctx.lineTo(ew * 0.40, eh * 0.85);
                  ctx.closePath();
                  ctx.fill();
                } else {
                  ctx.beginPath();
                  ctx.moveTo(ew * 0.5, eh * 0.35);
                  ctx.lineTo(ew * 0.75, eh * 0.85);
                  ctx.lineTo(ew * 0.25, eh * 0.85);
                  ctx.closePath();
                  ctx.fill();
                }
                
                ctx.fillStyle = '#C99454';
                ctx.beginPath();
                ctx.arc(ew * 0.5, eh * 0.24, ew * 0.14, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#A67C52';
                ctx.beginPath();
                ctx.moveTo(ew * 0.5, eh * 0.26);
                ctx.lineTo(ew * 0.47, eh * 0.30);
                ctx.lineTo(ew * 0.53, eh * 0.30);
                ctx.closePath();
                ctx.fill();
                
                if (el.isLaying) {
                  ctx.strokeStyle = '#333';
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  ctx.moveTo(ew * 0.41, eh * 0.24);
                  ctx.quadraticCurveTo(ew * 0.44, eh * 0.27, ew * 0.47, eh * 0.24);
                  ctx.moveTo(ew * 0.53, eh * 0.24);
                  ctx.quadraticCurveTo(ew * 0.56, eh * 0.27, ew * 0.59, eh * 0.24);
                  ctx.stroke();
                } else {
                  ctx.fillStyle = '#222';
                  ctx.beginPath();
                  ctx.arc(ew * 0.44, eh * 0.24, 1.5, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.beginPath();
                  ctx.arc(ew * 0.56, eh * 0.24, 1.5, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else {
                ctx.fillStyle = color;
                if (isMale) {
                  ctx.beginPath();
                  ctx.moveTo(ew * 0.32, eh * 0.38);
                  ctx.lineTo(ew * 0.68, eh * 0.38);
                  ctx.lineTo(ew * 0.60, eh * 0.85);
                  ctx.lineTo(ew * 0.40, eh * 0.85);
                  ctx.closePath();
                  ctx.fill();
                } else {
                  ctx.beginPath();
                  ctx.moveTo(ew * 0.5, 0.35);
                  ctx.lineTo(ew * 0.75, eh * 0.85);
                  ctx.lineTo(ew * 0.25, eh * 0.85);
                  ctx.closePath();
                  ctx.fill();
                }
                
                ctx.fillStyle = '#C99454';
                ctx.beginPath();
                ctx.arc(ew * 0.5, eh * 0.24, ew * 0.14, 0, Math.PI * 2);
                ctx.fill();
              }

              if (el.name) {
                const fs = dir === 'left' || dir === 'right' ? 7 : 10;
                ctx.font = `900 ${fs}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                ctx.lineWidth = 2;
                ctx.strokeText(String(el.name), ew / 2, eh * 0.65);
                ctx.fillStyle = 'white';
                ctx.fillText(String(el.name), ew / 2, eh * 0.65);
              }
            }
          } else if (el.type === 'text' || el.type === 'private-text') {
            const isPrivate = el.type === 'private-text';
            ctx.fillStyle = isPrivate ? 'rgba(243, 232, 255, 0.95)' : 'rgba(254, 249, 195, 0.95)';
            roundRectPath(0, 0, ew, eh, 14);
            ctx.fill();
            ctx.strokeStyle = isPrivate ? 'rgba(216, 180, 254, 1)' : 'rgba(253, 224, 71, 1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            const tmp = document.createElement('div');
            tmp.innerHTML = el.text || '';
            const text = (tmp.textContent || tmp.innerText || '').trim();

            if (text) {
              ctx.fillStyle = isPrivate ? '#5B21B6' : '#713F12';
              ctx.font = '12px sans-serif';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'top';
              const lines = [];
              const paras = text.split('\n');
              const maxW = ew - 20;
              for (const para of paras) {
                if (!para) { lines.push(''); continue; }
                const words = para.split(/\s+/);
                let line = '';
                for (const word of words) {
                  const test = line ? line + ' ' + word : word;
                  if (ctx.measureText(test).width > maxW && line) {
                    lines.push(line);
                    line = word;
                  } else {
                    line = test;
                  }
                }
                if (line) lines.push(line);
              }
              const lineHeight = 16;
              const maxLines = Math.floor((eh - 16) / lineHeight);
              let ty = 8;
              for (const l of lines.slice(0, maxLines)) {
                ctx.fillText(l, 10, ty);
                ty += lineHeight;
              }
              if (lines.length > maxLines) ctx.fillText('...', 10, ty);
            }
          }
        } catch (drawErr) {
          console.warn('Element draw error:', drawErr);
        }

        ctx.restore();
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const dateStr = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
      link.download = `Сессия_${dateStr}.png`;
      link.href = dataUrl;
      link.click();
      notify("Скриншот сохранен! ✓");
    } catch (e) {
      console.error('Screenshot error:', e);
      notify("Ошибка скриншота: " + (e.message || 'неизвестная'));
    }
  };

  const addElement = async (type, data) => {
    if (!isAuthorized || !roomId) return;
    playSound('drop', isMuted);
    const id = `elem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const maxZ = cardsOnTable.reduce((m, c) => Math.max(m, c.zIndex || 0), 0);
    const isField = type === 'field';

    let width = isField ? 800 : (type === 'figure' ? 80 : (type === 'arrow' ? 60 : (type === 'token' ? 45 : (type === 'text' || type === 'private-text' ? 200 : 160))));
    let height = isField ? 600 : (type === 'figure' ? 80 : (type === 'arrow' ? 60 : (type === 'token' ? 45 : (type === 'text' || type === 'private-text' ? 100 : 240))));

    if (type === 'card' && data.img) {
      try {
        const dims = await new Promise((resolve) => {
          const i = new Image();
          i.onload = () => resolve({ w: i.width, h: i.height });
          i.onerror = () => resolve(null);
          i.src = data.img;
        });
        if (dims && dims.w > dims.h) { width = 240; height = 160; }
      } catch (e) {}
    }

    let spawnX = 200;
    let spawnY = 150;
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      if (isField) {
        spawnX = container.scrollLeft + 50;
        spawnY = container.scrollTop + 50;
      } else {
        spawnX = container.scrollLeft + (container.clientWidth / 2) - (width / 2) + (Math.random() * 40 - 20);
        spawnY = container.scrollTop + (container.clientHeight / 2) - (height / 2) + (Math.random() * 40 - 20);
      }
    }

    const elem = {
      id, type, ...data,
      x: spawnX, y: spawnY,
      width, height,
      rotation: (type === 'figure' || type === 'arrow') ? 180 : 0,
      isFlipped: type !== 'token' && type !== 'text' && type !== 'private-text' && type !== 'figure' && type !== 'arrow' && !isField,
      zIndex: isField ? 0 : maxZ + 1,
      isLocked: false
    };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, id), elem);
  };

  const clearTable = async () => {
    const unlocked = cardsOnTable.filter(c => !c.isLocked);
    if (unlocked.length === 0) return notify("Нет незакреплённых объектов на столе");
    if (undoStack?.timeoutId) clearTimeout(undoStack.timeoutId);
    const timeoutId = setTimeout(async () => {
      try {
        const batch = writeBatch(db);
        unlocked.forEach(card => {
          batch.delete(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, card.id));
        });
        await batch.commit();
      } catch (e) {}
      setUndoStack(null);
    }, 10000);
    setUndoStack({ cards: unlocked, expiresAt: Date.now() + 10000, timeoutId });
  };

  const undoClear = () => {
    if (!undoStack) return;
    clearTimeout(undoStack.timeoutId);
    setUndoStack(null);
    notify("Восстановлено ✓");
  };

  const confirmUpload = async () => {
    if (pendingFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const deckId = `deck_${Date.now()}`;
      const cards = [];
      let backImage = null;
      const total = pendingFiles.length;
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        setUploadProgress(Math.round((i / total) * 100));
        const data = await new Promise(r => {
          const rd = new FileReader();
          rd.onload = (e) => r(e.target.result);
          rd.readAsDataURL(file);
        });
        const compressed = await compressImage(data, 800, 800);
        const isBack = file.name.toLowerCase().includes("рубашка");
        const path = `decks/${user.uid}/${deckId}/${isBack ? 'back' : `card_${i}`}.jpg`;
        const url = await uploadImageToStorage(compressed, path);
        if (isBack) backImage = url;
        else cards.push(url);
      }
      setUploadProgress(100);
      const newDeck = { name: tempDeckName || "Колода", cards, backImage, createdAt: Date.now() };
      if (isDbConnected && user && !isClientMode) {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), newDeck);
        notify("Колода сохранена в Облако ✓");
      } else {
        setLocalDecks(p => [...p, { ...newDeck, id: Date.now().toString() }]);
        notify("Добавлено локально");
      }
    } catch (err) {
      notify("Ошибка загрузки: " + err.message);
    } finally {
      setIsNamingDeck(false);
      setIsUploading(false);
      setUploadProgress(0);
      setTempDeckName("");
      setPendingFiles([]);
      setActiveTab('cloud');
    }
  };

  const addDeckByLinks = async () => {
    const input = await askPrompt("Вставьте ссылку на папку Google Диска (или несколько ссылок на файлы):");
    if (!input || !input.trim()) return;
    const folderId = extractDriveFolderId(input.trim());
    if (folderId) {
      const name = await askPrompt("Имя колоды:", "", "Напр: Эмоции");
      if (!name) return;
      notify("Загружаю список файлов из папки...");
      try {
        const files = await loadDriveFolderFiles(folderId, DRIVE_API_KEY);
        if (files.length === 0) return notify("В папке нет изображений.");
        let backImage = null;
        const cards = [];
        for (const file of files) {
          const url = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`;
          if (file.name.toLowerCase().includes('рубашка')) backImage = url;
          else cards.push(url);
        }
        if (cards.length === 0) return notify("Карты не найдены.");
        const newDeck = { name, cards, backImage: backImage || null, createdAt: Date.now() };
        if (isDbConnected && user && !isClientMode) {
          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), newDeck);
          notify(`Колода "${name}": ${cards.length} карт ✓`);
          setActiveTab('cloud');
        } else {
          setLocalDecks(p => [...p, { ...newDeck, id: Date.now().toString() }]);
        }
      } catch (e) {
        notify("Ошибка загрузки папки: " + e.message);
      }
    } else {
      const name = await askPrompt("Имя колоды:", "", "Напр: Ресурсы");
      if (!name) return;
      const linkArray = input.split(/[\n\r,\s]+/).map(l => l.trim()).filter(l => l.length > 10).map(l => convertDriveLink(l)).filter(Boolean);
      if (linkArray.length === 0) return notify("Не найдено ни одной ссылки");
      const newDeck = { name, cards: linkArray, backImage: null, createdAt: Date.now() };
      if (isDbConnected && user && !isClientMode) {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), newDeck);
        notify(`Колода "${name}" сохранена: ${linkArray.length} карт ✓`);
        setActiveTab('cloud');
      } else {
        setLocalDecks(p => [...p, { ...newDeck, id: Date.now().toString() }]);
      }
    }
  };

  if (appLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4" style={{ backgroundColor: COLORS.ink }}>
      <Loader2 size={40} className="animate-spin text-plum" />
      Загрузка кабинета...
    </div>
  );

  if (!inRoom) return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden" style={{ backgroundColor: COLORS.ink, color: COLORS.haze }}>
      {customDialog && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}CC` }}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black mb-4 text-center" style={{ color: COLORS.ink }}>{customDialog.title}</h3>
            {customDialog.type === 'prompt' && (
              <input key={customDialog.title} autoFocus defaultValue={customDialog.defaultValue || ''} placeholder={customDialog.placeholder || ''} id="dialog-input" className="w-full px-4 py-3 rounded-xl border-2 mb-6 outline-none font-bold text-center" style={{ borderColor: COLORS.haze }} onKeyDown={(e) => e.key === 'Enter' && (customDialog.onOk(e.target.value), setCustomDialog(null))} />
            )}
            <div className="flex gap-3">
              <button onClick={() => { customDialog.onCancel(); setCustomDialog(null); }} className="flex-1 py-3 font-bold rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">Отмена</button>
              <button onClick={() => { const val = customDialog.type === 'prompt' ? document.getElementById('dialog-input').value : true; customDialog.onOk(val); setCustomDialog(null); }} className="flex-1 py-3 font-bold rounded-xl text-white transition-colors" style={{ backgroundColor: COLORS.plum }}>Ок</button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px]" style={{ backgroundColor: COLORS.plum }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px]" style={{ backgroundColor: COLORS.forest }}></div>
      </div>
      
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 space-y-8 relative z-10 text-center pb-12">
        <div className="relative" style={{ color: COLORS.ink }}>
          <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute top-2 left-4 w-16 h-24 rounded-xl transform -rotate-12 border-[3px] shadow-inner" style={{ backgroundColor: COLORS.haze, borderColor: `${COLORS.ink}10` }}></div>
            <div className="absolute top-0 right-4 w-16 h-24 rounded-xl transform rotate-6 border-[3px] border-white shadow-md" style={{ backgroundColor: `${COLORS.terra}4D` }}></div>
            <div className="absolute -top-2 left-8 w-16 h-24 rounded-xl transform -rotate-3 border-[3px] border-white shadow-lg flex items-center justify-center z-10" style={{ backgroundColor: COLORS.plum }}>
              <div className="w-8 h-12 border-2 border-white/40 rounded-lg"></div>
            </div>
          </div>
          <h1 className="text-3xl font-black uppercase italic mb-2 leading-none">ОНЛАЙН КАБИНЕТ</h1>
          <p className="font-bold text-[10px] tracking-[0.3em] uppercase" style={{ color: COLORS.forest }}>Платформа для сессий</p>
        </div>
        
        <div className="space-y-4">
          {!isClientMode ? (
            !showKeyPrompt ? (
              <div className="flex flex-col gap-4">
                <button onClick={() => setShowKeyPrompt(true)} style={{ backgroundColor: COLORS.plum, color: 'white', border: 'none' }} className="w-full font-black py-5 rounded-2xl text-xs uppercase tracking-widest shadow-lg flex flex-col items-center gap-2 transition-all hover:opacity-90">
                  <Key size={24} /> ВОЙТИ КАК ПСИХОЛОГ
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input type="text" value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Email" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center text-base" style={{ borderColor: COLORS.plum, color: COLORS.plum, backgroundColor: `${COLORS.plum}10` }} />
                <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Пароль" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center text-base" style={{ borderColor: COLORS.plum, color: COLORS.plum, backgroundColor: `${COLORS.plum}10` }} />
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowKeyPrompt(false)} className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: `${COLORS.ink}80` }}>Назад</button>
                  <button onClick={handleLogin} disabled={isCheckingKey} style={{ backgroundColor: COLORS.forest, color: 'white', border: 'none' }} className="flex-[2] font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-md disabled:opacity-50">
                    {isCheckingKey ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Проверка...</span> : "Войти"}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] text-center mb-4" style={{ color: COLORS.ink, opacity: 0.7 }}>
                {psychologistName 
                  ? `Вы идёте на сессию к специалисту: ${psychologistName}. Представьтесь, пожалуйста.`
                  : 'Представьтесь, чтобы зайти за стол.'}
              </p>
              <input type="text" value={clientNameInput} onChange={e => setClientNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleClientLogin()} placeholder="Ваше Имя" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center text-base" style={{ borderColor: COLORS.forest, color: COLORS.forest, backgroundColor: `${COLORS.forest}10` }} />
              <button onClick={handleClientLogin} style={{ backgroundColor: COLORS.forest, color: 'white', border: 'none' }} className="w-full font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-md transition-all hover:opacity-90 mt-2">Войти в кабинет</button>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t-2 border-dashed flex flex-col items-center gap-4" style={{ borderColor: `${COLORS.ink}15` }}>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-center" style={{ color: `${COLORS.ink}60` }}>
            Нужна помощь или есть вопросы по платформе?
          </span>
          <div className="flex flex-col gap-3 w-full">
            <a href="https://t.me/psyplat" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-4 rounded-[1rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:scale-[1.02] shadow-sm border border-transparent hover:border-plum/20" style={{ backgroundColor: '#FDF7F9', color: COLORS.plum }}>
               <MessageCircle size={16} strokeWidth={2.5} /> TELEGRAM-КАНАЛ
            </a>
            <a href="https://max.ru/join/kmLoxZy4ssavrneuneZhry22HKbI5hbe11kPGlQUXUg" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-4 rounded-[1rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:scale-[1.02] shadow-sm border border-transparent hover:border-forest/20" style={{ backgroundColor: '#F5FAF8', color: COLORS.forest }}>
               <MaxIcon size={16} color={COLORS.forest} /> СВЯЗЬ (МАКС)
            </a>
          </div>
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

      {isNotebookOpen && !isClientMode && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}CC` }}>
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col">
            <button onClick={() => { setIsNotebookOpen(false); setIsCreatingNote(false); setEditingNoteId(null); setNoteTitleInput(''); }} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors">
              <X size={24} style={{ color: COLORS.ink }} />
            </button>
            <h2 className="text-xl md:text-2xl font-black uppercase mb-6 flex items-center gap-3" style={{ color: COLORS.ink }}>
              <BookOpen size={24} className="text-blue-600" /> Мои Техники
            </h2>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4">
              {!isCreatingNote ? (
                <>
                  <button onClick={() => { setIsCreatingNote(true); setEditingNoteId(null); setNoteTitleInput(''); setTimeout(() => { if (notebookEditorRef.current) notebookEditorRef.current.innerHTML = ''; }, 50); }} className="w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 hover:bg-black/5 transition-all" style={{ borderColor: `${COLORS.plum}4D`, color: COLORS.plum }}>
                    <Plus size={20} /> <span className="font-black uppercase text-[10px] tracking-widest">Добавить технику / скрипт</span>
                  </button>
                  {savedNotes.length === 0 && (
                    <p className="text-center text-sm font-medium opacity-50 mt-4">У вас пока нет сохраненных техник.</p>
                  )}
                  {savedNotes.map(note => (
                    <div key={note.id} className="p-4 rounded-2xl border flex flex-col gap-3 shadow-sm bg-gray-50 hover:bg-white transition-colors" style={{ borderColor: `${COLORS.ink}10` }}>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>{note.title}</h3>
                        <div className="flex gap-1">
                          <button onClick={() => {
                            setNoteTitleInput(note.title);
                            setEditingNoteId(note.id);
                            setIsCreatingNote(true);
                            setTimeout(() => {
                              if (notebookEditorRef.current) {
                                notebookEditorRef.current.innerHTML = note.text;
                              }
                            }, 50);
                          }} className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors" title="Редактировать">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={async () => {
                            if (await askConfirm('Удалить технику?')) {
                              await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saved_notes', note.id));
                            }
                          }} className="text-gray-400 hover:text-terra hover:bg-terra/10 p-1.5 rounded-lg transition-colors" title="Удалить">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-pre-wrap rich-text max-h-[150px] overflow-hidden" dangerouslySetInnerHTML={{ __html: note.text }}></div>
                      <button onClick={() => {
                        addElement('private-text', { text: note.text });
                        setIsNotebookOpen(false);
                        notify("Техника добавлена на стол!");
                      }} className="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all hover:opacity-90 flex items-center justify-center gap-2 mt-2 shadow-sm" style={{ backgroundColor: COLORS.plum }}>
                        <Type size={14} /> Выложить на стол (Секретно)
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col mb-4">
                  <input autoFocus type="text" value={noteTitleInput} onChange={e => setNoteTitleInput(e.target.value)} placeholder="Название (напр: Работа с травмой)" className="w-full px-4 py-3 rounded-xl border-2 border-b-0 rounded-b-none outline-none font-bold text-sm shadow-inner" style={{ borderColor: COLORS.haze, color: COLORS.ink }} />
                  
                  <div className="flex gap-2 items-center bg-gray-100 px-3 py-2 border-2 border-b-0 border-t-0 flex-wrap" style={{ borderColor: COLORS.haze }}>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('bold', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="Жирный"><Bold size={14} strokeWidth={3} /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('italic', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="Курсив"><Italic size={14} /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('underline', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="Подчеркнутый"><Underline size={14} /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('strikeThrough', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="Зачеркнутый"><Strikethrough size={14} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertUnorderedList', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="Список"><List size={14} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <label className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer flex items-center justify-center relative" title="Вставить картинку">
                      {isUploadingNoteImage ? <Loader2 size={14} className="animate-spin text-plum" /> : <ImageIcon size={14} />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleNoteImageUpload} disabled={isUploadingNoteImage} />
                    </label>
                  </div>
                  
                  <div
                    ref={notebookEditorRef}
                    contentEditable={true}
                    className="rich-text w-full px-4 py-3 rounded-b-xl border-2 outline-none text-sm custom-scrollbar min-h-[200px] shadow-inner leading-relaxed bg-white"
                    style={{ borderColor: COLORS.haze, color: COLORS.ink }}
                    data-placeholder="Текст техники, алгоритм или вопросы... Выделите текст и используйте кнопки сверху 👆"
                  />
                  
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => { setIsCreatingNote(false); setEditingNoteId(null); }} className="flex-1 py-3 font-bold rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-xs uppercase tracking-widest text-gray-600">Отмена</button>
                    <button onClick={async () => {
                      const finalHtml = notebookEditorRef.current ? notebookEditorRef.current.innerHTML : '';
                      if (!noteTitleInput.trim() || !finalHtml.trim()) return notify("Заполните все поля");
                      try {
                        if (editingNoteId) {
                          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saved_notes', editingNoteId), {
                            title: noteTitleInput.trim(),
                            text: finalHtml.trim()
                          });
                          notify("Техника обновлена!");
                        } else {
                          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_notes'), {
                            title: noteTitleInput.trim(),
                            text: finalHtml.trim(),
                            createdAt: Date.now()
                          });
                          notify("Техника сохранена!");
                        }
                        setIsCreatingNote(false);
                        setEditingNoteId(null);
                        setNoteTitleInput('');
                      } catch (e) {
                        notify("Ошибка: " + e.message);
                      }
                    }} className="flex-[2] py-3 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-md transition-all hover:scale-105" style={{ backgroundColor: COLORS.forest }}>Сохранить</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {customDialog && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}CC` }}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black mb-4 text-center" style={{ color: COLORS.ink }}>{customDialog.title}</h3>
            {customDialog.type === 'prompt' && (
              <input key={customDialog.title} autoFocus defaultValue={customDialog.defaultValue || ''} placeholder={customDialog.placeholder || ''} id="dialog-input" className="w-full px-4 py-3 rounded-xl border-2 mb-6 outline-none font-bold text-center" style={{ borderColor: COLORS.haze }} onKeyDown={(e) => e.key === 'Enter' && (customDialog.onOk(e.target.value), setCustomDialog(null))} />
            )}
            <div className="flex gap-3">
              <button onClick={() => { customDialog.onCancel(); setCustomDialog(null); }} className="flex-1 py-3 font-bold rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">Отмена</button>
              <button onClick={() => { const val = customDialog.type === 'prompt' ? document.getElementById('dialog-input').value : true; customDialog.onOk(val); setCustomDialog(null); }} className="flex-1 py-3 font-bold rounded-xl text-white transition-colors" style={{ backgroundColor: COLORS.plum }}>Ок</button>
            </div>
          </div>
        </div>
      )}

      {isHelpOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}CC` }} onClick={() => setIsHelpOpen(false)}>
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-5xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsHelpOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors">
              <X size={24} style={{ color: COLORS.ink }} />
            </button>
            <h2 className="text-2xl font-black uppercase mb-8 text-center" style={{ color: COLORS.ink }}>Полное руководство</h2>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-8 shadow-sm">
              <h4 className="font-black text-red-700 text-sm flex items-center gap-2 uppercase tracking-wide"><MonitorPlay size={18}/> Важный порядок действий (Работа с клиентом)</h4>
              <p className="text-sm text-red-800 mt-2 leading-relaxed">
                Для стабильной работы платформы (независимо от того, используете вы телефон или ПК) <b>строго соблюдайте этот порядок</b>:
              </p>
              <ol className="list-decimal list-inside text-sm text-red-800 mt-2 font-bold space-y-2">
                <li><b>Сначала включите видеосвязь</b> (кнопка с камерой). В модалке выберите вариант: <b>встроенный звонок</b> (тестовый, поверх платформы) или <b>внешний сервис</b> (Zoom/Телемост/Meet — надёжный, откроется в соседней вкладке).</li>
                <li><b>Только после этого копируйте и отправляйте ссылку клиенту.</b></li>
                <li>Если клиент заходит <b>с телефона</b>, ему нужно сначала развернуть верхнюю панель (нажав на стрелочку <ChevronDown size={14} className="inline text-red-700"/> справа вверху), а затем нажать зеленую кнопку <b>«Подключиться к видео»</b>.</li>
              </ol>
              <div className="mt-3 p-2 bg-white/50 rounded-lg text-xs font-bold flex gap-2">
                 <AlertCircle size={16} className="shrink-0 text-red-600" />
                 <span>Хотя платформа поддерживает смартфоны, мы настоятельно рекомендуем использовать ПК или планшет для комфортной работы психолога.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><Users size={16}/> Клиент и Доступ</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <p>Нажмите <UserPlus size={14} className="inline text-plum"/> <b>«ССЫЛКА ДЛЯ КЛИЕНТА»</b> на верхней панели. Ссылка скопируется — отправьте её клиенту.</p>
                  <p>Клиент переходит по ссылке, вводит своё имя и попадает за ваш стол. <b>Регистрация не нужна.</b></p>
                  <p><b>Права клиента:</b> тянуть карты (если колода открыта), двигать их, писать в желтых заметках, бросать игровые кубики.</p>
                  <p className="text-terra"><b>Клиент НЕ может:</b> видеть фиолетовые заметки, открывать библиотеку и менять колоды, удалять всё со стола, видеть лазерную указку (если она выключена у мастера).</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><Users size={16}/> Групповые и Трансформационные игры</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <p>Для групповых игр в платформу встроена система <b>приватности карт</b>:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Когда участник (клиент) нажимает <b><Eye size={14} className="inline text-forest" /> Подсмотреть</b> на ничьей закрытой карте, она <b>закрепляется за ним</b>.</li>
                    <li>Под картой появляется его имя (например, <UserCircle size={12} className="inline" /> Анна).</li>
                    <li><b>Важно:</b> Никто другой из участников больше не сможет ни подсмотреть, ни перевернуть эту карту.</li>
                    <li>Вы (Психолог) имеете полный контроль: вы в любой момент можете подсмотреть или перевернуть любую карту любого участника, а также отвязать владельца.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><LayoutGrid size={16}/> Панель инструментов</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <div className="flex items-start gap-2"><Crosshair size={16} className="text-red-500 mt-0.5 shrink-0"/> <div><b>Лазерная указка:</b> Обычная мышка скрыта от клиента. Указка включает красную точку, которую видят все (удобно показывать детали).</div></div>
                  <div className="flex items-start gap-2"><Camera size={16} className="text-gray-500 mt-0.5 shrink-0"/> <div><b>Скриншот:</b> Делает качественный снимок всего рабочего стола и скачивает на ваше устройство.</div></div>
                  <div className="flex items-start gap-2"><Save size={16} className="text-gray-500 mt-0.5 shrink-0"/> <div><b>Сохранить сессию:</b> Сохраняет весь расклад в библиотеку (вкладка СЕССИИ), чтобы загрузить его на следующих встречах.</div></div>
                  <div className="flex items-start gap-2"><LayoutGrid size={16} className="text-forest mt-0.5 shrink-0"/> <div><b>Настройки Поля:</b> Изменение фона стола (нейро-текстуры) или загрузка своего игрового поля (картинки, на которую можно класть карты).</div></div>
                  <div className="flex items-start gap-2"><Trash2 size={16} className="text-terra mt-0.5 shrink-0"/> <div><b>Очистить стол:</b> Удаляет все незакрепленные объекты. Внизу появится кнопка отмены (действует 10 секунд).</div></div>
                  <div className="flex items-start gap-2"><Timer size={16} className="text-plum mt-0.5 shrink-0"/> <div><b>Таймер:</b> Устанавливает общее время (60/90 мин). Синхронизирован с клиентом.</div></div>
                  <div className="flex items-start gap-2"><Video size={16} className="text-forest mt-0.5 shrink-0"/> <div><b>Видеосвязь:</b> Встроенная прямо в кабинет. Окно видео можно перемещать и растягивать.</div></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><Type size={16}/> Работа с заметками</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <div className="flex items-start gap-3 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-terra shrink-0"><Type size={16} /></div>
                    <div><b>Желтая (Общая):</b> Видят оба. И вы, и клиент можете печатать в ней текст одновременно.</div>
                  </div>
                  <div className="flex items-start gap-3 bg-purple-50 p-3 rounded-xl border border-purple-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600 relative shrink-0"><Type size={16} /><EyeOff size={8} className="absolute bottom-1 right-1" /></div>
                    <div><b className="text-purple-900">Фиолетовая (Секретная):</b> <b>Видите только вы</b>. На экране клиента её не существует. Идеально для ваших личных скрытых пометок.</div>
                  </div>
                  <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 shrink-0"><BookOpen size={16} /></div>
                    <div><b className="text-blue-900">Мои Техники:</b> Записная книжка Психолога. Запишите в неё свои скрипты до сессии. В один клик текст из неё выкладывается на стол в виде Секретной заметки!</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><Layers size={16}/> Плавающие панели</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-700 shrink-0"><FigureIcon gender="male" color={COLORS.forest} isMenu={true} className="w-[18px] h-[18px] opacity-80" /></div>
                    <div><b className="text-emerald-800">Фигурки для расстановок:</b> Кнопка с фигуркой вверху открывает панель. Вы можете выбирать цвет, указывать имя, добавлять мужские/женские фигурки и стрелки. Есть переключатель вида (Сбоку/Сверху).</div>
                  </div>
                  <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-700 shrink-0"><Dices size={18} /></div>
                    <div><b className="text-blue-800">Игровые кубики и фишки:</b> Кнопка с кубиками открывает панель. Доступны цветные маркеры и кубики (d6 и d10). Бросать кубик может и клиент.</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><MousePointer2 size={16}/> Действия с объектами</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2">
                  <p className="mb-2">Наведите курсор на любую карту или фигурку на столе, чтобы появилось меню:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs"><RefreshCw size={14} className="text-gray-500" /> Перевернуть (лицо/рубашка)</div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs"><Eye size={14} className="text-forest" /> Подсмотреть (только если закрыта)</div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs"><Maximize2 size={14} className="text-gray-500" /> Увеличить объект</div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs"><RotateCw size={14} className="text-gray-500" /> Повернуть</div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs"><ArrowUpToLine size={14} className="text-gray-500" /> На передний план</div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs"><Lock size={14} className="text-gray-500" /> Закрепить (от сдвигов)</div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs sm:col-span-2"><EyeOff size={14} className="text-gray-500" /> Уложить/Разбудить (сон/смерть для фигур)</div>
                  </div>
                  <p className="mt-3 text-xs bg-gray-50 p-3 rounded-lg flex flex-col gap-2">
                    <span><Move size={14} className="inline text-plum"/> Чтобы <b>изменить размер</b>, потяните за правый нижний угол.</span>
                    <span><RotateCw size={14} className="inline text-plum"/> Чтобы <b>свободно вращать фигурку</b>, наведите на неё и нажмите на появившийся <b>круг компаса</b> вокруг неё. Для карт используйте кнопки Влево/Вправо в меню.</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-2">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><FolderOpen size={16}/> Библиотека Мастера</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <p>Вызывается длинной кнопкой <b>«Библиотека Мастера»</b> в самом низу экрана.</p>
                  <ul className="space-y-1 list-disc list-inside grid grid-cols-1 md:grid-cols-2">
                    <li><b>БАЗА:</b> Стандартные колоды, доступные всегда.</li>
                    <li><b>ОБЛАКО:</b> Колоды, загруженные разработчиком специально для вас.</li>
                    <li><b>МОИ:</b> Ваше личное пространство. Можно добавить колоды ссылкой с вашего Google Диска. Видите их только вы.</li>
                    <li><b>СЕССИИ:</b> Сохраненные столы (история раскладов).</li>
                  </ul>
                  <div className="bg-plum/10 p-3 rounded-lg border border-plum/20 mt-2">
                    <p className="font-bold text-plum mb-1">Как вытаскивать карты?</p>
                    <p className="text-xs">Выберите колоду в левом списке. Нажмите <b>«Наугад»</b> (вытащит случайную рубашкой вверх) или нажмите кнопку <b>«Открыть колоду»</b> справа вверху, чтобы увидеть все изображения и выбрать конкретную.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {isVideoActive && (
        <div
           onMouseDown={handleVideoPointerDown}
           onTouchStart={handleVideoPointerDown}
           className="fixed z-[200] bg-ink rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 cursor-move"
           style={{ left: videoPos.x, top: videoPos.y, width: videoDim.w, height: videoDim.h, touchAction: 'none' }}
        >
          <div className="absolute top-2 right-2 z-[60]">
             <button
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onClick={() => {
                  if (isClientMode) {
                     setIsVideoActive(false);
                     if (pcRef.current) pcRef.current.close();
                     if (localVideoRef.current?.srcObject) localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
                  } else {
                     endNativeCall();
                  }
                }}
                className="bg-red-500/80 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors pointer-events-auto shadow-md"
             >
                <X size={14} />
             </button>
          </div>

          <div className="flex-1 bg-black relative pointer-events-none">
             {callStatus && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/90 z-40 text-center px-4">
                  <Loader2 className="animate-spin text-plum mb-3" size={24} />
                  <span className="text-white text-[9px] font-black tracking-widest uppercase opacity-80">{callStatus}</span>
               </div>
             )}
             <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>

          <div className="absolute bottom-2 left-2 w-[30%] h-[30%] min-w-[30px] min-h-[40px] bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-white/20 z-50 pointer-events-none">
             <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
          </div>

          <div
             onMouseDown={handleVideoResizePointerDown}
             onTouchStart={handleVideoResizePointerDown}
             className="absolute bottom-0 right-0 w-12 h-12 cursor-nwse-resize z-[70] flex items-end justify-end p-2 text-white/50 hover:text-white"
          >
            <Maximize2 size={18} className="rotate-90 pointer-events-none drop-shadow-md" />
          </div>
        </div>
      )}

      {externalVideoLink && videoMode === 'external' && (
        <div 
           onMouseDown={handleVideoPointerDown} 
           onTouchStart={handleVideoPointerDown} 
           className="fixed z-[200] bg-ink rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 cursor-move" 
           style={{ left: videoPos.x + 20, top: videoPos.y + 20, width: videoDim.w, height: videoDim.h, touchAction: 'none' }}
        >
          <div className="flex items-center justify-between px-3 py-2 bg-black/30 border-b border-white/10">
            <div className="flex items-center gap-2 text-white">
              <Video size={12} className="text-forest" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-90">{detectVideoService(externalVideoLink)}</span>
            </div>
            <button
              onMouseDown={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
              onClick={() => {
                if (isClientMode) {
                  setVideoMode(null);
                  setHasClickedJoinExternal(false);
                } else {
                  endExternalVideo();
                }
              }}
              className="bg-red-500/80 p-1 rounded-full text-white hover:bg-red-600 transition-colors shadow-md"
            >
              <X size={12} />
            </button>
          </div>
          <div className="flex-1 bg-black relative">
            <div className="flex flex-col items-center justify-center h-full p-4 text-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-forest/20 flex items-center justify-center mb-4">
                <Video size={28} className="text-forest" />
              </div>
              <div className="text-white text-sm font-black uppercase tracking-widest mb-1">{detectVideoService(externalVideoLink)}</div>
              <div className="text-white/60 text-[10px] mb-4 px-2">
                {isClientMode 
                   ? (hasClickedJoinExternal ? "Видеосвязь открыта в соседней вкладке" : "Психолог пригласил вас на видеовстречу")
                  : "Видеосвязь открыта в соседней вкладке"
                }
              </div>
              <button
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onClick={() => window.open(externalVideoLink, '_blank', 'noopener,noreferrer')}
                className="pointer-events-auto px-5 py-2.5 rounded-xl bg-forest text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                <ExternalLink size={12} /> {isClientMode && !hasClickedJoinExternal ? "Подключиться" : "Открыть снова"}
              </button>
            </div>
          </div>
          <div 
             onMouseDown={handleVideoResizePointerDown} 
             onTouchStart={handleVideoResizePointerDown} 
             className="absolute bottom-0 right-0 w-10 h-10 cursor-nwse-resize z-[70] flex items-end justify-end p-2 text-white/50 hover:text-white"
          >
            <Maximize2 size={16} className="rotate-90 pointer-events-none drop-shadow-md" />
          </div>
        </div>
      )}

      {isVideoModalOpen && !isClientMode && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}CC` }}>
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => { setIsVideoModalOpen(false); setTempLinkInput(''); setSaveLinkPermanently(false); }} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors">
              <X size={20} style={{ color: COLORS.ink }} />
            </button>
            <h2 className="text-xl font-black uppercase mb-2 text-center flex items-center justify-center gap-2" style={{ color: COLORS.ink }}>
              <Video size={20} /> Видеосвязь
            </h2>
            <p className="text-[10px] text-center mb-6 font-medium leading-relaxed" style={{ color: `${COLORS.ink}99` }}>
              Выберите способ связи с клиентом
            </p>
            
            <div className="mb-6 p-4 rounded-2xl border-2" style={{ borderColor: `${COLORS.plum}30`, backgroundColor: `${COLORS.plum}05` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.plum }}>
                  Вариант 1: Встроенная связь
                </div>
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${COLORS.terra}20`, color: COLORS.terra }}>
                  Тестовая
                </span>
              </div>
              <p className="text-[10px] italic mb-3 leading-relaxed" style={{ color: `${COLORS.ink}80` }}>
                Звонок откроется прямо в окошке поверх платформы. Работает не на всех сетях — если связь нестабильна, используйте внешний сервис ниже.
              </p>
              <button onClick={async () => {
                  setIsVideoModalOpen(false);
                  startNativeCall();
                  notify("Встроенная видеосвязь запущена!");
                }}
                className="w-full py-3 rounded-xl text-white font-black uppercase tracking-widest shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-[10px]" 
                style={{ backgroundColor: COLORS.plum }}>
                <Video size={14} /> Запустить встроенный звонок
              </button>
              {isVideoCallReady && (
                <button onClick={async () => { endNativeCall(); setIsVideoModalOpen(false); notify("Связь удалена"); }} className="w-full mt-2 py-2 font-bold rounded-xl text-[9px] uppercase tracking-widest transition-colors hover:opacity-80" style={{ backgroundColor: `${COLORS.terra}20`, color: COLORS.terra }}>
                  Завершить встроенный звонок
                </button>
              )}
            </div>
            
            <div className="p-4 rounded-2xl border-2" style={{ borderColor: `${COLORS.forest}30`, backgroundColor: `${COLORS.forest}05` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.forest }}>
                  Вариант 2: Внешний сервис
                </div>
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${COLORS.forest}20`, color: COLORS.forest }}>
                  Надёжный
                </span>
              </div>
              <p className="text-[10px] mb-3 leading-relaxed" style={{ color: `${COLORS.ink}80` }}>
                Zoom, Телемост, Google Meet — любой сервис. Откроется в соседней вкладке у вас и клиента.
              </p>
              
              {savedVideoLink && (
                <div className="mb-3 p-2.5 rounded-xl border" style={{ backgroundColor: 'white', borderColor: `${COLORS.forest}30` }}>
                  <div className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: COLORS.forest }}>Постоянная ссылка</div>
                  <div className="text-[9px] font-bold truncate mb-2" style={{ color: COLORS.ink }}>{savedVideoLink}</div>
                  <div className="flex gap-2">
                    <button onClick={() => launchExternalVideo(savedVideoLink)} className="flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-sm hover:opacity-90" style={{ backgroundColor: COLORS.forest }}>
                      Использовать
                    </button>
                    <button onClick={async () => {
                      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'video'), { savedLink: '' }, { merge: true });
                      setSavedVideoLink('');
                      notify("Постоянная ссылка удалена");
                    }} className="px-2 py-1.5 rounded-lg text-[9px] font-bold hover:opacity-70" style={{ color: COLORS.terra }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
              
              <input 
                type="text" 
                value={tempLinkInput} 
                onChange={e => setTempLinkInput(e.target.value)}
                placeholder="https://zoom.us/j/..." 
                className="w-full px-3 py-2.5 rounded-xl border-2 outline-none font-bold text-[11px] mb-2"
                style={{ borderColor: COLORS.haze, color: COLORS.ink }}
              />
              
              {tempLinkInput && detectVideoService(tempLinkInput) && (
                <div className="text-[9px] font-bold mb-3 flex items-center gap-1" style={{ color: COLORS.plum }}>
                  <CheckCircle size={10} /> Сервис: {detectVideoService(tempLinkInput)}
                </div>
              )}
              
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={saveLinkPermanently} 
                  onChange={e => setSaveLinkPermanently(e.target.checked)}
                  className="w-3.5 h-3.5 accent-plum"
                />
                <span className="text-[10px] font-bold" style={{ color: COLORS.ink }}>Сохранить как постоянную</span>
              </label>
              
              <button 
                onClick={() => launchExternalVideo(tempLinkInput)}
                disabled={!tempLinkInput.trim()}
                className="w-full py-3 rounded-xl text-white font-black uppercase tracking-widest shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-[10px] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100" 
                style={{ backgroundColor: COLORS.forest }}
              >
                <Video size={14} /> Запустить внешнюю связь
              </button>
              
              {externalVideoLink && (
                <button onClick={() => { endExternalVideo(); setIsVideoModalOpen(false); }} className="w-full mt-2 py-2 font-bold rounded-xl text-[9px] uppercase tracking-widest transition-colors hover:opacity-80" style={{ backgroundColor: `${COLORS.terra}20`, color: COLORS.terra }}>
                  Завершить внешнюю связь
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {previewCard && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}F2` }} onClick={() => setPreviewCard(null)}>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white font-black tracking-widest uppercase bg-black/50 px-6 py-2 rounded-full backdrop-blur-md text-xs text-center w-[90%] md:w-auto">
            {previewCard.isFlipped ? "Эту карту сейчас видите только вы" : "Эта карта открыта для всех"}
          </div>
          <button className="absolute top-6 right-6 text-white p-2 rounded-full transition-all hover:opacity-70" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <X size={40} />
          </button>
          <img src={previewCard.img} className="max-h-[85vh] max-w-[90vw] h-auto w-auto rounded-2xl shadow-2xl bg-white object-contain" style={{ animation: 'scaleIn 0.2s ease-out' }} alt="Карта" />
        </div>
      )}

      <style>{`
        .backface-hidden { backface-visibility: hidden; }
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 50, 82, 0.2); border-radius: 10px; }
        
        .rich-text b, .rich-text strong { font-weight: 900; color: inherit; }
        .rich-text i, .rich-text em { font-style: italic; }
        .rich-text u { text-decoration: underline; text-underline-offset: 2px; }
        .rich-text strike, .rich-text s { text-decoration: line-through; opacity: 0.7; }
        .rich-text ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 0.25rem; margin-bottom: 0.25rem; }
        .rich-text li { margin-bottom: 0.25rem; }
        .rich-text:empty:before { content: attr(data-placeholder); color: rgba(0,0,0,0.3); font-weight: bold; pointer-events: none; }
        .rich-text img { max-width: 100%; max-height: 300px; object-fit: contain; border-radius: 8px; margin-top: 0.5rem; margin-bottom: 0.5rem; display: block; }
        
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes timerPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes popup { from { opacity: 0; transform: translateY(-10px) scale(0.95) translateX(-50%); } to { opacity: 1; transform: translateY(0) scale(1) translateX(-50%); } }
      `}</style>
    </div>
  );
}

function DraggableElement({ element, onUpdate, onRemove, onPreview, maxZIndex, playSound, isMuted, isClientMode, currentUser, currentUserName, onNotify, boardRef, globalFigureView, isLaserMode }) {
  const elementRef = useRef(null);
  const contentEditableRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const startPos = useRef({ x: 0, y: 0 });
  const initialMousePos = useRef({ x: 0, y: 0 });
  const startDim = useRef({ w: 0, h: 0 });
  const hasMoved = useRef(false);
  const clickTimestamp = useRef(0);

  const COLORS = { plum: '#8B3252', forest: '#2D4A3E', terra: '#C44D29', ink: '#1C1020', haze: '#F2EFF5' };

  const isField = element.type === 'field';
  const isText = element.type === 'text' || element.type === 'private-text';
  const isPrivate = element.type === 'private-text';
  const isLocked = element.isLocked;

  const handleDragStart = (e) => {
    if (isResizing || isRotating) return;
    if (isLocked) return;
    if (isField && isClientMode) return;
    if (isText && e.target.tagName.toLowerCase() === 'textarea') return;
    if (isLaserMode && !isClientMode) return;

    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;

    setIsDragging(true); hasMoved.current = false; clickTimestamp.current = Date.now();
    initialMousePos.current = { x: cx, y: cy };
    startPos.current = { x: (cx - (element.x || 0)), y: (cy - (element.y || 0)) };
    if (!isField) onUpdate({ zIndex: maxZIndex + 1 });
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    if (isLocked) return;
    if (isField && isClientMode) return;
    if (isLaserMode && !isClientMode) return;

    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setIsResizing(true); startPos.current = { x: cx, y: cy }; startDim.current = { w: element.width, h: element.height };
  };

  const handleRotateStart = (e) => {
    e.stopPropagation();
    if (isLocked) return;
    if (isField && isClientMode) return;
    if (isLaserMode && !isClientMode) return;

    setIsRotating(true);
    if (!isField) onUpdate({ zIndex: maxZIndex + 1 });

    if (!boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const centerX = boardRect.left + (element.x || 0) + element.width / 2;
    const centerY = boardRect.top + (element.y || 0) + element.height / 2;

    const angleRad = Math.atan2(cy - centerY, cx - centerX);
    let angleDeg = angleRad * (180 / Math.PI) + 90;
    if (angleDeg < 0) angleDeg += 360;

    onUpdate({ rotation: Math.round(angleDeg) });
  };

  const handleTextInput = () => {
    if (contentEditableRef.current) {
      onUpdate({ text: contentEditableRef.current.innerHTML });
    }
  };

  useEffect(() => {
    if (isText && contentEditableRef.current && document.activeElement !== contentEditableRef.current) {
      if (contentEditableRef.current.innerHTML !== (element.text || '')) {
        contentEditableRef.current.innerHTML = String(element.text || '');
      }
    }
  }, [element.text, isText]);

  useEffect(() => {
    const move = (e) => {
      if (isLocked) return;
      if (isLaserMode && !isClientMode) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        if (Math.sqrt(Math.pow(cx - initialMousePos.current.x, 2) + Math.pow(cy - initialMousePos.current.y, 2)) > 5) hasMoved.current = true;
        onUpdate({ x: Math.max(0, cx - startPos.current.x), y: Math.max(0, cy - startPos.current.y) });
      } else if (isResizing) {
        const dx = cx - startPos.current.x;
        if (isText) {
          const nw = Math.max(150, startDim.current.w + dx);
          onUpdate({ width: nw }); 
        } else {
          const ratio = startDim.current.w / startDim.current.h;
          const nw = Math.max(element.type === 'token' ? 25 : (element.type === 'arrow' ? 30 : 80), startDim.current.w + dx);
          onUpdate({ width: nw, height: nw / ratio });
        }
      } else if (isRotating) {
        if (!boardRef.current) return;
        const boardRect = boardRef.current.getBoundingClientRect();
        const centerX = boardRect.left + (element.x || 0) + element.width / 2;
        const centerY = boardRect.top + (element.y || 0) + element.height / 2;
        
        const angleRad = Math.atan2(cy - centerY, cx - centerX);
        let angleDeg = angleRad * (180 / Math.PI) + 90;
        if (angleDeg < 0) angleDeg += 360;
        
        onUpdate({ rotation: Math.round(angleDeg) });
      }
    };

    const end = () => {
      if (isDragging) {
        setIsDragging(false);
        if (hasMoved.current) playSound('drop', isMuted);
        if (!hasMoved.current && (Date.now() - clickTimestamp.current < 250) && element.type !== 'token' && element.type !== 'figure' && element.type !== 'arrow' && !isField && !isText) {
          playSound('flip', isMuted); onUpdate({ isFlipped: !element.isFlipped });
        }
      }
      setIsResizing(false);
      setIsRotating(false);
    };

    if (isDragging || isResizing || isRotating) {
      window.addEventListener('mousemove', move); window.addEventListener('mouseup', end);
      window.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchmove', end);
    }
    return () => {
      window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', move); window.removeEventListener('touchmove', end);
    };
  }, [isDragging, isResizing, isRotating, element, onUpdate, playSound, isMuted, isLocked, isText, isLaserMode, isClientMode, boardRef]);

  const canDrag = !isLocked && !(isField && isClientMode) && !(isLaserMode && !isClientMode);
  const isFigureOrArrow = element.type === 'figure' || element.type === 'arrow';
  const appliedRotation = isFigureOrArrow ? 0 : element.rotation;

  let dragClasses = '';
  if (isDragging || isRotating) {
    dragClasses = isFigureOrArrow ? 'scale-105' : 'scale-105 shadow-2xl';
  } else {
    dragClasses = isField || isFigureOrArrow ? '' : 'shadow-[0_8px_30px_rgb(0,0,0,0.12)]';
  }

  const baseClasses = `w-full h-full relative ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} transition-transform`;
  const typeClasses = isText ? `rounded-2xl backdrop-blur-md border flex flex-col overflow-hidden ${isPrivate ? 'bg-purple-100/90 border-purple-300' : 'bg-yellow-100/90 border-yellow-300'}` : (isField || isFigureOrArrow ? '' : 'rounded-[1rem]');

  return (
    <div
      ref={elementRef}
      className={`absolute group ${canDrag ? 'touch-none' : ''} ${(isDragging || isRotating) ? 'z-[1000]' : ''}`}
      style={{
        left: Math.max(0, element.x || 0), top: Math.max(0, element.y || 0),
        width: element.width, height: isText ? 'auto' : element.height,
        zIndex: isField ? 0 : (element.zIndex || 1),
        transform: `rotate(${appliedRotation || 0}deg)`,
        transition: (isDragging || isResizing || isRotating) ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      {isFigureOrArrow && canDrag && (
        <div
          onMouseDown={handleRotateStart}
          onTouchStart={handleRotateStart}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair z-[-1]"
          style={{ width: element.width + 60, height: element.height + 60 }}
          title="Нажмите на круг, чтобы повернуть"
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
            <div key={angle} className="absolute w-full h-full pointer-events-none" style={{ transform: `rotate(${angle}deg)` }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-plum rounded-full shadow-md" />
            </div>
          ))}
        </div>
      )}

      {!(isLaserMode && !isClientMode) && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all bg-white/80 backdrop-blur-xl rounded-full px-2 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 border border-white">
          {!isField && <button onClick={(e) => { e.stopPropagation(); onUpdate({ zIndex: maxZIndex + 1 }); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-black/5 text-ink/70" title="На передний план"><ArrowUpToLine size={16} /></button>}
          
          {element.type === 'figure' && (
            <button onClick={(e) => { e.stopPropagation(); onUpdate({ isLaying: !element.isLaying }); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-black/5 text-ink/70" title={element.isLaying ? "Открыть глаза / Поднять фигурку" : "Закрыть глаза (сон/смерть)"}>
              {element.isLaying ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          )}

          {element.type === 'figure' && (
            <button onClick={(e) => { e.stopPropagation(); onUpdate({ isFallen: !element.isFallen }); }} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 ${element.isFallen ? 'bg-terra/10 text-terra' : 'hover:bg-black/5 text-ink/70'}`} title={element.isFallen ? "Поднять фигурку" : "Уронить на пол"}>
              <UserMinus size={16} />
            </button>
          )}

          {element.type === 'card' && element.isFlipped && (
            <button onClick={(e) => {
              e.stopPropagation();
              if (!element.owner) {
                if (isClientMode) {
                   onUpdate({ owner: currentUser?.uid, ownerName: currentUserName || 'Игрок' });
                   onNotify("Карта закреплена за вами. Только вы и Психолог можете её видеть и переворачивать.");
                }
                onPreview();
              } else if (element.owner === currentUser?.uid || !isClientMode) {
                onPreview();
              } else {
                onNotify(`Эта карта принадлежит: ${element.ownerName}. Подсматривать нельзя! 🤫`);
              }
            }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 bg-forest/10 text-forest" title={!element.owner ? "Взять себе и подсмотреть" : (element.owner === currentUser?.uid ? "Подсмотреть свою карту" : "Подсмотреть (только для владельца и Психолога)")}>
              <Eye size={16} />
            </button>
          )}
          
          {element.type === 'card' && (
            <button onClick={(e) => {
              e.stopPropagation();
              if (element.owner && element.owner !== currentUser?.uid && isClientMode) {
                onNotify(`Только ${element.ownerName} или Психолог могут перевернуть карту`); return;
              }
              playSound('flip', isMuted); onUpdate({ isFlipped: !element.isFlipped });
            }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-black/5 text-ink/70" title="Перевернуть">
              <RefreshCw size={16} />
            </button>
          )}
          
          {(isField || (element.type === 'card' && element.isFlipped)) && (
            <button onClick={(e) => { e.stopPropagation(); onPreview(); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-black/5 text-ink/70" title="Увеличить"><Maximize2 size={16} /></button>
          )}
          
          {(!isClientMode || !isField) && !isFigureOrArrow && (
            <div className="flex bg-gray-100 rounded-full p-0.5 shadow-inner border border-gray-200/50 ml-1">
              <button onClick={(e) => { e.stopPropagation(); onUpdate({ rotation: (element.rotation - 90 + 360) % 360 }); }} className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white text-ink/70 shadow-sm" title={`Повернуть влево (90°)`}>
                <RotateCcw size={14} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onUpdate({ rotation: (element.rotation + 90) % 360 }); }} className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white text-ink/70 shadow-sm" title={`Повернуть вправо (90°)`}>
                <RotateCw size={14} />
              </button>
            </div>
          )}

          {!isClientMode && !isField && (
            <button onClick={(e) => { e.stopPropagation(); onUpdate({ isLocked: !isLocked }); }} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 ${isLocked ? 'bg-terra/10 text-terra' : 'hover:bg-black/5 text-ink/70'}`} title={isLocked ? "Открепить" : "Закрепить"}>
              {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
          )}

          {!isClientMode && element.owner && (
            <button onClick={(e) => {
              e.stopPropagation();
              onUpdate({ owner: null, ownerName: null });
              onNotify("Сброшена привязка карты к игроку");
            }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-black/5 text-ink/70" title="Отвязать владельца">
              <UserMinus size={16} />
            </button>
          )}

          {!isClientMode && (
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-terra/10 text-terra" title="Удалить"><Trash2 size={16} /></button>
          )}
        </div>
      )}

      {(!isClientMode && isField && !(isLaserMode && !isClientMode)) && (
        <div className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-20" style={{ left: 'calc(100% + 12px)' }}>
          <button onClick={(e) => { e.stopPropagation(); onUpdate({ isLocked: !isLocked }); }} className="p-3 rounded-full transition-colors hover:opacity-80 shadow-xl border bg-white/90 backdrop-blur-md" style={{ color: isLocked ? COLORS.terra : `${COLORS.ink}80`, borderColor: isLocked ? COLORS.terra : `${COLORS.ink}20` }} title={isLocked ? "Открепить поле" : "Закрепить поле"}>
            {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
          </button>
        </div>
      )}

      <div
        className={`${baseClasses} ${dragClasses} ${typeClasses}`}
        style={{ 
          perspective: isField ? 'none' : '1000px', 
          height: isText ? 'auto' : '100%',
          transform: element.isFallen ? 'rotate(90deg)' : 'none',
          transition: (isDragging || isResizing || isRotating) ? 'none' : 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {isText ? (
          <>
            <div 
              onMouseDown={handleDragStart} 
              onTouchStart={handleDragStart} 
              className={`w-full h-8 flex items-center justify-between px-2 flex-shrink-0 cursor-grab active:cursor-grabbing border-b ${isPrivate ? 'bg-purple-200/50 border-purple-300/50 text-purple-700' : 'bg-yellow-200/50 border-yellow-300/50 text-yellow-800'}`}
            >
              <div className="flex gap-1 items-center">
                <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); document.execCommand('bold', false, null); handleTextInput(); }} className={`p-1 rounded transition-colors ${isPrivate ? 'hover:bg-purple-300/50' : 'hover:bg-yellow-300/50'}`} title="Жирный"><Bold size={12} strokeWidth={3} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); document.execCommand('italic', false, null); handleTextInput(); }} className={`p-1 rounded transition-colors ${isPrivate ? 'hover:bg-purple-300/50' : 'hover:bg-yellow-300/50'}`} title="Курсив"><Italic size={12} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); document.execCommand('underline', false, null); handleTextInput(); }} className={`p-1 rounded transition-colors ${isPrivate ? 'hover:bg-purple-300/50' : 'hover:bg-yellow-300/50'}`} title="Подчеркнутый"><Underline size={12} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); document.execCommand('strikeThrough', false, null); handleTextInput(); }} className={`p-1 rounded transition-colors ${isPrivate ? 'hover:bg-purple-300/50' : 'hover:bg-yellow-300/50'}`} title="Зачеркнутый"><Strikethrough size={12} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); document.execCommand('insertUnorderedList', false, null); handleTextInput(); }} className={`p-1 rounded transition-colors ${isPrivate ? 'hover:bg-purple-300/50' : 'hover:bg-yellow-300/50'}`} title="Список"><List size={12} /></button>
              </div>
              <div className="flex gap-1.5 opacity-30 pr-2 pointer-events-none">
                <div className="w-1 h-1 rounded-full bg-current" />
                <div className="w-1 h-1 rounded-full bg-current" />
                <div className="w-1 h-1 rounded-full bg-current" />
              </div>
            </div>
            <div 
              ref={contentEditableRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={handleTextInput}
              onBlur={() => { if (contentEditableRef.current) onUpdate({ text: contentEditableRef.current.innerHTML }); }}
              className="rich-text flex-1 w-full p-4 bg-transparent outline-none text-[13px] text-gray-800 leading-relaxed min-h-[60px] max-h-[65vh] overflow-y-auto custom-scrollbar"
              data-placeholder="Заметка..."
            />
          </>
        ) : element.type === 'token' ? (
          <div className="w-full h-full rounded-full shadow-inner border-2 border-white/80" style={{ backgroundColor: element.color }} onMouseDown={handleDragStart} onTouchStart={handleDragStart} />
        ) : element.type === 'arrow' ? (
          <div className="w-full h-full relative flex items-center justify-center" onMouseDown={handleDragStart} onTouchStart={handleDragStart}>
             <ArrowElementIcon color={element.color} rotation={element.rotation} className="w-full h-full" />
          </div>
        ) : element.type === 'figure' ? (
          <div className="w-full h-full relative flex items-center justify-center" onMouseDown={handleDragStart} onTouchStart={handleDragStart}>
             <FigureIcon gender={element.gender} color={element.color} viewMode={globalFigureView} rotation={element.rotation} name={String(element.name || '')} isLaying={element.isLaying} className="w-full h-full" />
          </div>
        ) : (
          <div className="relative w-full h-full" style={isField ? {} : { transformStyle: 'preserve-3d', transition: 'transform 0.6s ease', transform: element.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }} onMouseDown={handleDragStart} onTouchStart={handleDragStart}>
            {isField ? (
              <img src={element.img} className="w-full h-full object-contain pointer-events-none" alt="Игровое поле" />
            ) : (
              <>
                <div className="absolute inset-0 rounded-[1rem] overflow-hidden flex items-center justify-center bg-white border border-black/5" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                  <img src={element.img} className="w-full h-full object-contain pointer-events-none" alt="Карта" />
                </div>
                <div className="absolute inset-0 rounded-[1rem] overflow-hidden flex items-center justify-center border border-white/10" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundImage: `linear-gradient(to bottom right, ${COLORS.forest}, ${COLORS.ink})` }}>
                  {element.backImg
                    ? <img src={element.backImg} className="w-full h-full object-cover absolute inset-0 pointer-events-none" alt="Рубашка" />
                    : <div className="flex flex-col items-center justify-center gap-2 opacity-30"><Layers size={40} className="text-white" /><span className="text-[10px] text-white font-black uppercase tracking-widest leading-none">MAK SPACE</span></div>}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {(!isLocked && (!isClientMode || !isField) && !(isLaserMode && !isClientMode)) && (
        <div onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} className="absolute -bottom-3 -right-3 w-10 h-10 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-30 drop-shadow-md bg-white/90 backdrop-blur-md rounded-full scale-75 hover:scale-100 shadow-[0_4px_15px_rgb(0,0,0,0.15)] border border-white/50 text-plum">
          <Move size={16} />
        </div>
      )}

      {element.owner && element.type === 'card' && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-ink/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 whitespace-nowrap shadow-lg pointer-events-none flex items-center gap-1.5 border border-white/10">
          <UserCircle size={12} /> {element.ownerName}
        </div>
      )}
    </div>
  );
}
