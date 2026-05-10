import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, doc, onSnapshot, setDoc, getDoc,
  updateDoc, collection, deleteDoc, addDoc, writeBatch, getDocs
} from 'firebase/firestore';
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from 'firebase/auth';
import {
  getStorage, ref as storageRef, uploadString, getDownloadURL, deleteObject
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
  const shadowStyle = isLaying ? 'drop-shadow(0px 2px 3px rgba(0,0,0,0.4))' : 'drop-shadow(0px 6px 12px rgba(0,0,0,0.3))';

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

      {isLaying ? (
        <g>
          <g transform={`rotate(${rot}, 50, 50)`}>
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
            {/* Закрытые глаза для лежащей фигурки */}
            <path d="M 42,24 Q 44,22 46,24" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 54,24 Q 56,22 58,24" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
          {name && (
            <text
              x="50" y="95" textAnchor="middle" fontSize="10" fontWeight="900" fill="rgba(255,255,255,0.95)"
              style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }} textLength={name.length > 5 ? "35" : undefined} lengthAdjust="spacingAndGlyphs"
            >
              {name}
            </text>
          )}
        </g>
      ) : isSide ? (
        <g>
          {/* Тонкий эстетичный вектор (луч внимания из уровня глаз/головы) */}
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
              <circle cx="56" cy="22" r="1.8" fill="#222" />
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
              <circle cx="44" cy="24" r="1.5" fill="#333" />
              <circle cx="56" cy="24" r="1.5" fill="#333" />
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
            <circle cx="45" cy="52" r="1.8" fill="#222" />
            <circle cx="55" cy="52" r="1.8" fill="#222" />
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
  terra: '#D26027', // Сделали более теплым, кирпично-оранжевым
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
  
  const [videoLink, setVideoLink] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [tempVideoLink, setTempVideoLink] = useState('');
  
  // Состояния для плашек
  const [isDicePanelOpen, setIsDicePanelOpen] = useState(false);
  const [isFiguresPanelOpen, setIsFiguresPanelOpen] = useState(false);

  // Состояния для Записной книжки (Техник)
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [savedNotes, setSavedNotes] = useState([]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null); // Новое состояние для редактирования
  const [noteTitleInput, setNoteTitleInput] = useState('');
  // Для создания заметок теперь не стейт-переменная текста, а управление через ref:
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
        else if (d.id === '_dice_type') setDiceType(d.data().type || 6);
        else if (d.id === '_settings') {
          if (d.data().platformName) setPlatformName(d.data().platformName);
          if (d.data().tableBg) setTableBg(d.data().tableBg);
          if (d.data().figureViewMode) setFigureViewMode(d.data().figureViewMode);
          if (d.data().videoLink !== undefined) {
             setVideoLink(d.data().videoLink);
             if (!d.data().videoLink) setIsVideoActive(false);
          }
        }
        else if (d.id === '_library_state') {
          const libraryData = d.data();
          if (libraryData.isOpen !== undefined && !window._isClientMode) setIsLibraryOpen(libraryData.isOpen);
          if (libraryData.isFullscreen !== undefined && !window._isClientMode) setIsLibraryFullscreen(libraryData.isFullscreen);
          if (libraryData.isFlipped !== undefined) setIsLibraryDeckFlipped(libraryData.isFlipped);
        }
        else if (d.id === '_active_deck') { setActiveDeckData(d.data()); }
        else if (d.id === '_timer_state') { setSessionTimer(d.data()); }
        else cards.push({ id: d.id, ...d.data() });
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

  const takeScreenshot = async () => {
    if (!boardRef.current) return;
    notify("Создаю скриншот, пожалуйста, подождите...");
    try {
      if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }
      const canvas = await window.html2canvas(boardRef.current, { useCORS: true, backgroundColor: tableBg.bgColor });
      const link = document.createElement('a');
      link.download = `session_${new Date().toLocaleDateString()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      notify("Скриншот успешно сохранен! ✓");
    } catch(e) {
      notify("Ошибка при создании скриншота. Попробуйте системный скриншот.");
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
      const name = await askPrompt("Имя колоды:");
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
      const name = await askPrompt("Имя колоды:");
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
      <Loader2 className="animate-spin" color={COLORS.plum} size={48} />
      <span className="font-black uppercase text-xs opacity-50 tracking-widest">Загрузка кабинета...</span>
    </div>
  );

  if (!inRoom) return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden" style={{ backgroundColor: COLORS.ink, color: COLORS.haze }}>
      {customDialog && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}CC` }}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black mb-4 text-center" style={{ color: COLORS.ink }}>{customDialog.title}</h3>
            {customDialog.type === 'prompt' && (
              <input autoFocus defaultValue={customDialog.placeholder || ''} id="dialog-input" className="w-full px-4 py-3 rounded-xl border-2 mb-6 outline-none font-bold text-center" style={{ borderColor: COLORS.haze }} onKeyDown={(e) => e.key === 'Enter' && (customDialog.onOk(e.target.value), setCustomDialog(null))} />
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
              <p className="font-bold text-[10px] uppercase text-center mb-4" style={{ color: COLORS.ink }}>Представьтесь, чтобы зайти за стол:</p>
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

      {/* ПЛАВАЮЩЕЕ ОКНО: ЗАПИСНАЯ КНИЖКА (МОИ ТЕХНИКИ) */}
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
                      <div className="text-xs line-clamp-3 text-gray-500 whitespace-pre-wrap rich-text" dangerouslySetInnerHTML={{ __html: note.text }}></div>
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
                  
                  {/* Панель форматирования для Моих Техник */}
                  <div className="flex gap-2 items-center bg-gray-100 px-3 py-2 border-2 border-b-0 border-t-0" style={{ borderColor: COLORS.haze }}>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('bold', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="Жирный"><Bold size={14} strokeWidth={3} /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('italic', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="Курсив"><Italic size={14} /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('underline', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="Подчеркнутый"><Underline size={14} /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('strikeThrough', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="Зачеркнутый"><Strikethrough size={14} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertUnorderedList', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="Список"><List size={14} /></button>
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
              <input autoFocus defaultValue={customDialog.placeholder || ''} id="dialog-input" className="w-full px-4 py-3 rounded-xl border-2 mb-6 outline-none font-bold text-center" style={{ borderColor: COLORS.haze }} onKeyDown={(e) => e.key === 'Enter' && (customDialog.onOk(e.target.value), setCustomDialog(null))} />
            )}
            <div className="flex gap-3">
              <button onClick={() => { customDialog.onCancel(); setCustomDialog(null); }} className="flex-1 py-3 font-bold rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">Отмена</button>
              <button onClick={() => { const val = customDialog.type === 'prompt' ? document.getElementById('dialog-input').value : true; customDialog.onOk(val); setCustomDialog(null); }} className="flex-1 py-3 font-bold rounded-xl text-white transition-colors" style={{ backgroundColor: COLORS.plum }}>Ок</button>
            </div>
          </div>
        </div>
      )}

      {/* ИНСТРУКЦИЯ ПО ПЛАТФОРМЕ */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}CC` }} onClick={() => setIsHelpOpen(false)}>
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-5xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsHelpOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors">
              <X size={24} style={{ color: COLORS.ink }} />
            </button>
            <h2 className="text-2xl font-black uppercase mb-8 text-center" style={{ color: COLORS.ink }}>Полное руководство</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* КЛИЕНТ И ДОСТУП */}
              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><Users size={16}/> Клиент и Доступ</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <p>Нажмите <UserPlus size={14} className="inline text-plum"/> <b>«ССЫЛКА ДЛЯ КЛИЕНТА»</b> на верхней панели. Ссылка скопируется — отправьте её клиенту.</p>
                  <p>Клиент переходит по ссылке, вводит своё имя и попадает за ваш стол. <b>Регистрация не нужна.</b></p>
                  <p><b>Права клиента:</b> тянуть карты (если колода открыта), двигать их, писать в желтых заметках, бросать игровые кубики.</p>
                  <p className="text-terra"><b>Клиент НЕ может:</b> видеть фиолетовые заметки, открывать библиотеку и менять колоды, удалять всё со стола, видеть лазерную указку (если она выключена у мастера).</p>
                </div>
              </div>

              {/* ГРУППОВЫЕ ИГРЫ И ПРИВАТНОСТЬ КАРТ */}
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

              {/* ИНСТРУМЕНТЫ ВЕРХНЕЙ ПАНЕЛИ */}
              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><LayoutGrid size={16}/> Панель инструментов</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <div className="flex items-start gap-2"><Crosshair size={16} className="text-red-500 mt-0.5 shrink-0"/> <div><b>Лазерная указка:</b> Обычная мышка скрыта от клиента. Указка включает красную точку, которую видят все (удобно показывать детали).</div></div>
                  <div className="flex items-start gap-2"><Camera size={16} className="text-gray-500 mt-0.5 shrink-0"/> <div><b>Скриншот:</b> Делает качественный снимок всего рабочего стола и скачивает на ваше устройство.</div></div>
                  <div className="flex items-start gap-2"><Save size={16} className="text-gray-500 mt-0.5 shrink-0"/> <div><b>Сохранить сессию:</b> Сохраняет весь расклад в библиотеку (вкладка СЕССИИ), чтобы загрузить его на следующих встречах.</div></div>
                  <div className="flex items-start gap-2"><LayoutGrid size={16} className="text-forest mt-0.5 shrink-0"/> <div><b>Настройки Поля:</b> Изменение фона стола (нейро-текстуры) или загрузка своего игрового поля (картинки, на которую можно класть карты).</div></div>
                  <div className="flex items-start gap-2"><Trash2 size={16} className="text-terra mt-0.5 shrink-0"/> <div><b>Очистить стол:</b> Удаляет все незакрепленные объекты. Внизу появится кнопка отмены (действует 10 секунд).</div></div>
                  <div className="flex items-start gap-2"><Timer size={16} className="text-plum mt-0.5 shrink-0"/> <div><b>Таймер:</b> Устанавливает общее время (60/90 мин). Синхронизирован с клиентом.</div></div>
                  <div className="flex items-start gap-2"><Video size={16} className="text-forest mt-0.5 shrink-0"/> <div><b>Видеосвязь:</b> Вставьте ссылку на Zoom/Skype/Телемост, чтобы у клиента появилась яркая кнопка для входа в звонок.</div></div>
                </div>
              </div>

              {/* ЗАМЕТКИ И ТЕХНИКИ */}
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

              {/* ПЛАВАЮЩИЕ ПАНЕЛИ */}
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

              {/* ДЕЙСТВИЯ С КАРТАМИ */}
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

              {/* БИБЛИОТЕКА МАСТЕРА */}
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

      {/* ПЛАВАЮЩЕЕ ОКНО ВИДЕОСВЯЗИ */}
      {isVideoActive && videoLink && (
        <div className="fixed bottom-24 right-4 md:right-8 z-[200] w-72 md:w-80 h-52 md:h-60 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col resize overflow-auto" style={{ minWidth: '240px', minHeight: '180px' }}>
          <div className="flex justify-between items-center bg-gray-100 px-3 py-2 border-b border-gray-200">
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2"><Video size={12} /> Видеосвязь</span>
            <div className="flex items-center gap-2">
               <a href={videoLink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-plum transition-colors" title="Открыть в новой вкладке">
                  <ExternalLink size={14} />
               </a>
               <button onClick={() => setIsVideoActive(false)} className="text-gray-500 hover:text-terra transition-colors" title="Закрыть">
                  <X size={16} />
               </button>
            </div>
          </div>
          <div className="flex-1 bg-black relative">
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <Video size={24} className="text-white/20 mb-2" />
                <p className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Если видео не появилось, сервис запрещает встраивание.</p>
                <a href={videoLink} target="_blank" rel="noopener noreferrer" className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-black transition-colors">
                  Открыть в новой вкладке
                </a>
             </div>
             <iframe src={videoLink} title="Video Call" allow="camera; microphone; fullscreen; display-capture; autoplay" className="absolute inset-0 w-full h-full border-0 z-10" />
          </div>
        </div>
      )}

      {isVideoModalOpen && !isClientMode && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}CC` }}>
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setIsVideoModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors">
              <X size={20} style={{ color: COLORS.ink }} />
            </button>
            <h2 className="text-xl font-black uppercase mb-3 text-center" style={{ color: COLORS.ink }}>Видеосвязь</h2>
            <p className="text-[10px] text-center mb-6 font-medium leading-relaxed" style={{ color: `${COLORS.ink}99` }}>
              Вставьте ссылку на Яндекс.Телемост, Zoom, Google Meet или Skype. <br/>У клиента в кабинете появится яркая кнопка для подключения к вашему звонку.
            </p>
            <input type="text" value={tempVideoLink} onChange={e => setTempVideoLink(e.target.value)} placeholder="https://telemost.yandex.ru/j/..." className="w-full px-4 py-3 rounded-xl border-2 mb-6 text-sm font-bold outline-none text-center" style={{ borderColor: COLORS.haze, color: COLORS.ink }} />
            <div className="flex gap-3">
              {videoLink && (
                <button onClick={async () => { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { videoLink: '' }, { merge: true }); setIsVideoModalOpen(false); setIsVideoActive(false); notify("Ссылка удалена"); }} className="flex-1 py-3 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-colors hover:opacity-80" style={{ backgroundColor: `${COLORS.terra}20`, color: COLORS.terra }}>Удалить</button>
              )}
              <button onClick={async () => { if (!tempVideoLink.trim()) return notify("Введите ссылку!"); let linkToSave = tempVideoLink.trim(); if (!linkToSave.startsWith('http')) linkToSave = 'https://' + linkToSave; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { videoLink: linkToSave }, { merge: true }); setIsVideoModalOpen(false); notify("Связь установлена!"); }} className="flex-[2] py-3 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-md transition-all hover:scale-105" style={{ backgroundColor: COLORS.forest }}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
      
      {isFieldModalOpen && !isClientMode && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}CC` }}>
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setIsFieldModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors">
              <X size={24} style={{ color: COLORS.ink }} />
            </button>
            <h2 className="text-xl md:text-2xl font-black uppercase mb-6" style={{ color: COLORS.ink }}>Оформление стола</h2>
            <div className="mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50 flex items-center gap-2">
                <LayoutGrid size={14} /> Фон всего пространства (Нейро-дизайн)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {TABLE_BACKGROUNDS.map(bg => (
                  <button key={bg.id} onClick={async () => {
                    setTableBg(bg);
                    if (isDbConnected && roomId) {
                      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { tableBg: bg }, { merge: true });
                    }
                  }} className={`relative h-20 md:h-24 rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 ${tableBg?.id === bg.id ? 'shadow-lg' : 'border-transparent shadow-sm'}`} style={{ backgroundColor: bg.bgColor, borderColor: tableBg?.id === bg.id ? COLORS.plum : 'transparent' }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: bg.blendMode ? bg.bgColor : 'transparent', backgroundImage: bg.value === 'none' ? 'none' : (bg.type === 'css' ? bg.value : `url('${bg.value}')`), backgroundSize: bg.bgSize, backgroundPosition: 'center', opacity: bg.opacity, backgroundRepeat: bg.repeat || 'repeat', backgroundBlendMode: bg.blendMode || 'normal' }}></div>
                    <div className="absolute inset-0 flex items-end p-2 md:p-3 bg-gradient-to-t from-black/50 to-transparent">
                      <span className="text-white text-[9px] md:text-[10px] font-bold leading-tight drop-shadow-md">{bg.name}</span>
                    </div>
                  </button>
                ))}
                <label className="relative h-20 md:h-24 rounded-2xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:bg-black/5" style={{ borderColor: `${COLORS.plum}4D`, color: COLORS.plum }}>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const f = e.target.files[0]; if (!f) return;
                    setIsUploadingBg(true); notify("Загружаю фон...", 4000);
                    try {
                      const data = await new Promise(r => { const rd = new FileReader(); rd.onload = ev => r(ev.target.result); rd.readAsDataURL(f); });
                      let comp = await compressImage(data, 1920, 1920);
                      const url = await uploadImageToStorage(comp, `backgrounds/${user.uid}/${Date.now()}.jpg`);
                      const customBg = { id: 'custom', name: 'Свой фон', type: 'image', value: url, bgSize: 'cover', bgColor: COLORS.haze, opacity: 1, repeat: 'no-repeat', blendMode: 'normal' };
                      setTableBg(customBg);
                      if (isDbConnected && roomId) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { tableBg: customBg }, { merge: true });
                      notify("Фон установлен! ✓");
                    } catch(err) { notify("Ошибка: " + err.message); } finally { setIsUploadingBg(false); e.target.value = ''; }
                  }} />
                  {isUploadingBg ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                  <span className="text-[9px] md:text-[10px] font-black uppercase text-center leading-tight">Свой<br/>Фон</span>
                </label>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50 flex items-center gap-2">
                <ImageIcon size={14} /> Отдельное игровое поле (Как объект)
              </h3>
              <p className="text-[10px] font-medium mb-4 leading-relaxed" style={{ color: COLORS.ink }}>Используйте это, если нужно загрузить конкретную карту игры как перемещаемый объект на столе (она сохранит свои пропорции и на нее можно будет класть карты).</p>
              <label className="w-full py-4 rounded-2xl cursor-pointer transition-all hover:opacity-80 flex flex-col items-center justify-center gap-2 shadow-md" style={{ backgroundColor: COLORS.forest, color: 'white' }}>
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  setIsFieldModalOpen(false);
                  notify("Сжимаю изображение...", 5000);
                  try {
                    const data = await new Promise(r => { const rd = new FileReader(); rd.onload = (ev) => r(ev.target.result); rd.readAsDataURL(f); });
                    let comp = await compressImage(data, 1200, 1200);
                    if (comp.length > 900000) comp = await compressImage(data, 900, 900);
                    if (comp.length > 900000) comp = await compressImage(data, 700, 700);
                    const sizeKB = Math.round(comp.length / 1024);
                    if (comp.length > 900000) return notify(`Файл слишком большой (${sizeKB}KB). Попробуйте другое изображение.`);
                    notify(`Размещаю поле на столе (${sizeKB}KB)...`, 4000);
                    await addElement('field', { img: comp });
                    notify("Игровое поле появилось на столе! ✓");
                  } catch (err) { notify("Ошибка: " + err.message); } finally { e.target.value = ''; }
                }} />
                <ImageIcon size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Загрузить поле для игры</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ШАПКА / HEADER */}
      <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-3 bg-white/90 backdrop-blur-md border-b z-30 shadow-sm gap-2 relative" style={{ borderColor: `${COLORS.ink}10` }}>
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundImage: `linear-gradient(to bottom right, ${COLORS.plum}, ${COLORS.forest})` }}>
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black leading-none uppercase flex items-center gap-2" style={{ color: COLORS.ink }}>
                {platformName}
                {!isClientMode && (
                  <button onClick={editPlatformName} className="transition-colors hover:opacity-70" style={{ color: COLORS.plum }}>
                    <Edit2 size={12} />
                  </button>
                )}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[8px] md:text-[9px] font-bold tracking-widest uppercase flex items-center gap-1" style={{ color: COLORS.plum }}>
                  СЕССИЯ: {roomId} <span className="opacity-50">|</span> ВЫ: {userName}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* ИНСТРУМЕНТЫ ПРАВАЯ ЧАСТЬ */}
        <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end w-full md:w-auto">
          
          {/* НОВЫЕ КНОПКИ ВЫЗОВА ПЛАШЕК */}
          <div className="flex bg-black/5 p-1 rounded-2xl shadow-inner border border-ink/5 gap-1 mr-1">
             <button onClick={() => setIsFiguresPanelOpen(!isFiguresPanelOpen)} className={`p-2 rounded-xl transition-all flex items-center justify-center ${isFiguresPanelOpen ? 'bg-white shadow-sm text-plum' : 'hover:bg-white text-ink/70'}`} title="Открыть фигурки и стрелки">
                <FigureIcon gender="male" color={isFiguresPanelOpen ? COLORS.plum : 'currentColor'} isMenu={true} className="w-[18px] h-[18px] opacity-80" />
             </button>
             <button onClick={() => setIsDicePanelOpen(!isDicePanelOpen)} className={`p-2 rounded-xl transition-all flex items-center justify-center ${isDicePanelOpen ? 'bg-white shadow-sm text-forest' : 'hover:bg-white text-ink/70'}`} title="Открыть кубики и фишки">
                <Dices size={18} />
             </button>
          </div>

          {!isClientMode ? (
            <div className="flex items-center gap-1 bg-white/50 p-1 rounded-[1rem] border shadow-sm" style={{ borderColor: `${COLORS.forest}30`, backgroundColor: `${COLORS.forest}10` }}>
              <button onClick={() => { setTempVideoLink(videoLink || ''); setIsVideoModalOpen(true); }} className="p-2 rounded-xl transition-all hover:bg-white text-forest" title="Настроить видеосвязь">
                <Video size={16} />
              </button>
              {videoLink && (
                <button onClick={() => setIsVideoActive(true)} className="px-3 py-1.5 rounded-xl text-[10px] font-black transition-all bg-white text-forest hover:scale-105 shadow-sm uppercase">
                  Войти в звонок
                </button>
              )}
            </div>
          ) : (
            videoLink && (
              <button onClick={() => setIsVideoActive(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-[1rem] text-[10px] font-black text-white shadow-[0_0_15px_rgba(45,74,62,0.4)] transition-all hover:scale-105 uppercase animate-pulse" style={{ backgroundColor: COLORS.forest }}>
                <Video size={14} /> Подключиться к видео
              </button>
            )
          )}

          {timerDisplay ? (
            <div className="flex items-center gap-1.5">
              <div className="px-4 py-2 rounded-2xl font-black text-sm tabular-nums tracking-widest flex items-center gap-2 border transition-all" style={{ backgroundColor: timerIsWarning ? '#FEE2E2' : `${COLORS.plum}12`, color: timerIsWarning ? '#DC2626' : COLORS.plum, borderColor: timerIsWarning ? '#FCA5A5' : `${COLORS.plum}30` }}>
                <Timer size={14} />{timerDisplay}
              </div>
              {!isClientMode && (
                <button onClick={stopTimer} className="p-2 rounded-2xl hover:bg-black/5 transition-colors" style={{ color: COLORS.terra }} title="Остановить таймер">
                  <TimerOff size={15} />
                </button>
              )}
            </div>
          ) : (
            !isClientMode && (
              <div className="flex items-center gap-1 bg-white/50 p-1 rounded-2xl border shadow-sm" style={{ borderColor: `${COLORS.plum}30`, backgroundColor: `${COLORS.plum}10` }}>
                <Timer size={14} className="ml-1" style={{ color: COLORS.plum }} />
                <button onClick={() => startTimer(60)} className="px-2 py-1 rounded-xl text-[10px] font-black hover:opacity-70 transition-all" style={{ color: COLORS.plum, backgroundColor: 'white' }} title="Таймер 60 мин">60</button>
                <button onClick={() => startTimer(90)} className="px-2 py-1 rounded-xl text-[10px] font-black hover:opacity-70 transition-all" style={{ color: COLORS.plum, backgroundColor: 'white' }} title="Таймер 90 мин">90</button>
              </div>
            )
          )}
          
          <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 rounded-[1rem] transition-all hover:bg-black/5" style={{ color: COLORS.ink }}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          
          {!isClientMode && (
            <button onClick={async () => {
              const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
              await copyToClipboard(url);
              setCopyFeedback(true); setTimeout(() => setCopyFeedback(false), 2000);
            }} className="px-4 py-2.5 rounded-[1rem] text-[10px] font-black border flex items-center gap-2 shadow-sm transition-all hover:scale-105" style={{ backgroundColor: copyFeedback ? COLORS.forest : 'white', borderColor: copyFeedback ? COLORS.forest : `${COLORS.plum}30`, color: copyFeedback ? 'white' : COLORS.plum }}>
              {copyFeedback ? <CheckCircle size={14} /> : <UserPlus size={14} />}
              <span className="hidden sm:inline">{copyFeedback ? "СКОПИРОВАНО" : "ССЫЛКА ДЛЯ КЛИЕНТА"}</span>
            </button>
          )}

          {!isClientMode && (
            <div className="flex bg-black/5 p-1 rounded-[1rem] gap-1 shadow-inner border border-ink/5">
              <button onClick={() => setIsLaserMode(!isLaserMode)} className={`p-2 rounded-xl transition-all ${isLaserMode ? 'bg-white shadow-sm text-red-500' : 'hover:bg-white text-ink/70'}`} title={isLaserMode ? "Отключить указку" : "Лазерная указка (клиент видит точку)"}>
                <Crosshair size={16} />
              </button>
              <button onClick={takeScreenshot} className="p-2 rounded-xl transition-all hover:bg-white text-ink/70" title="Скриншот стола">
                <Camera size={16} />
              </button>
              <button onClick={saveCurrentSession} className="p-2 rounded-xl transition-all hover:bg-white text-ink/70" title="Сохранить сессию">
                <Save size={16} />
              </button>
            </div>
          )}
          
          {!isClientMode && (
            <>
              {/* ЗАМЕТКИ, ПОЛЕ, ОЧИСТКА */}
              <button onClick={() => setIsNotebookOpen(true)} className="relative p-2.5 rounded-[1rem] transition-all hover:scale-105 shadow-sm border" style={{ backgroundColor: '#E0F2FE', color: '#2563EB', borderColor: '#BFDBFE' }} title="Мои Техники (Записная книжка)">
                <BookOpen size={18} />
              </button>
              <button onClick={() => addElement('private-text', { text: "" })} className="relative p-2.5 rounded-[1rem] transition-all hover:scale-105 shadow-sm border" style={{ backgroundColor: '#F3E8FF', color: '#9333EA', borderColor: '#D8B4FE' }} title="Скрытая заметка (не видна клиенту)">
                <Type size={18} />
                <EyeOff size={10} className="absolute bottom-1 right-1 opacity-70" />
              </button>
              <button onClick={() => addElement('text', { text: "" })} className="p-2.5 rounded-[1rem] transition-all hover:scale-105 shadow-sm border" style={{ backgroundColor: '#FFF9C4', color: COLORS.terra, borderColor: '#FDE047' }} title="Добавить публичную заметку">
                <Type size={18} />
              </button>
              <button onClick={() => setIsFieldModalOpen(true)} className="px-3 py-2.5 rounded-[1rem] border transition-all hover:bg-black/5 hover:scale-105 flex items-center gap-2" style={{ backgroundColor: 'white', color: COLORS.forest, borderColor: `${COLORS.forest}20` }} title="Настройки стола и поля">
                <LayoutGrid size={14} />
                <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">ПОЛЕ</span>
              </button>
              <button onClick={clearTable} className="p-2.5 rounded-[1rem] transition-all hover:bg-black/5" style={{ color: COLORS.terra }} title="Очистить стол">
                <Trash2 size={18} />
              </button>
            </>
          )}

          {/* НОВАЯ КНОПКА ИНСТРУКЦИИ */}
          <button onClick={() => setIsHelpOpen(true)} className="px-3 py-2.5 rounded-[1rem] border transition-all hover:bg-black/5 hover:scale-105 flex items-center gap-2 shadow-sm" style={{ backgroundColor: 'white', color: COLORS.plum, borderColor: `${COLORS.plum}30` }} title="Инструкция">
            <HelpCircle size={14} />
            <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">ИНСТРУКЦИЯ</span>
          </button>

          <button onClick={() => window.location.reload()} className="p-2.5 rounded-[1rem] transition-all hover:bg-black/5" style={{ color: `${COLORS.ink}80` }} title="Выйти">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col overflow-hidden pt-28 md:pt-24">
        
        {/* ПЛАШКА: КУБИКИ И ФИШКИ */}
        {isDicePanelOpen && (
          <div className="absolute top-4 right-4 md:right-8 z-40 flex flex-col items-center gap-2 md:gap-3 bg-white/90 backdrop-blur-xl p-4 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.15)] border border-white transition-all pointer-events-auto" style={{ animation: 'popup 0.2s ease-out' }}>
            <button onClick={() => setIsDicePanelOpen(false)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-terra hover:bg-gray-100 rounded-full transition-colors">
              <X size={14} />
            </button>
            <div className="flex gap-1.5 md:gap-2 p-1.5 md:p-2 rounded-[1rem] md:rounded-2xl border border-white mt-2" style={{ backgroundColor: `${COLORS.ink}10` }}>
              {['#8B3252', '#2D4A3E', '#C4714A', '#4A90E2', '#E2A94A'].map(color => (
                <button key={color} onClick={() => addElement('token', { color })} className="w-5 h-5 md:w-6 md:h-6 rounded-full shadow-md border border-white/50 hover:scale-125 transition-transform" style={{ backgroundColor: color }} />
              ))}
            </div>
            <div className="flex p-0.5 rounded-lg md:rounded-xl" style={{ backgroundColor: `${COLORS.ink}15` }}>
              {[6, 10].map(type => (
                <button key={type} onClick={async () => {
                  setDiceType(type);
                  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_dice_type'), { type }, { merge: true });
                }} className="px-2 py-1 md:px-3 md:py-1.5 rounded-[0.5rem] text-[9px] md:text-[10px] font-black transition-all" style={{ backgroundColor: diceType === type ? 'white' : 'transparent', color: diceType === type ? COLORS.plum : `${COLORS.ink}60`, boxShadow: diceType === type ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                  d{type}
                </button>
              ))}
            </div>
            {diceType === 6 ? (
              <div className={`w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-md flex items-center justify-center border transition-all ${isAnimating ? 'animate-bounce scale-110' : ''}`} style={{ borderColor: `${COLORS.plum}20` }}>
                {renderDiceFace(visualDice, COLORS.plum)}
              </div>
            ) : (
              <div className={`w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-md flex items-center justify-center border transition-all ${isAnimatingD10 ? 'animate-bounce scale-110' : ''}`} style={{ borderColor: `${COLORS.forest}30` }}>
                <span className="font-black text-2xl md:text-3xl" style={{ color: COLORS.forest }}>{visualDiceD10}</span>
              </div>
            )}
            <button onClick={async () => {
              if (diceType === 6) {
                if (isAnimating) return;
                const array = new Uint32Array(1);
                window.crypto.getRandomValues(array);
                const v = (array[0] % 6) + 1;
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_dice_state'), { value: v, timestamp: Date.now() });
              } else {
                if (isAnimatingD10) return;
                const array = new Uint32Array(1);
                window.crypto.getRandomValues(array);
                const v = (array[0] % 10) + 1;
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_dice_d10_state'), { value: v, timestamp: Date.now() });
              }
            }} disabled={diceType === 6 ? isAnimating : isAnimatingD10} style={{ backgroundColor: COLORS.forest, color: 'white', border: 'none' }} className="w-full py-2 rounded-xl text-[10px] font-black uppercase shadow-md hover:scale-105 transition-all disabled:opacity-50">
              Бросить
            </button>
          </div>
        )}

        {/* ПЛАШКА: ФИГУРЫ И СТРЕЛКИ */}
        {isFiguresPanelOpen && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-4 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl md:rounded-full shadow-[0_10px_40px_rgb(0,0,0,0.15)] border border-white transition-all pointer-events-auto w-[95%] md:w-max" style={{ animation: 'popup 0.2s ease-out' }}>
            
            <div className="flex bg-[#F3F4F6] p-1 rounded-full">
              <button onClick={() => updateGlobalFigureView('side')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${figureViewMode === 'side' ? 'bg-white shadow-sm text-plum' : 'text-gray-500'}`}>Сбоку</button>
              <button onClick={() => updateGlobalFigureView('top')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${figureViewMode === 'top' ? 'bg-white shadow-sm text-plum' : 'text-gray-500'}`}>Сверху</button>
            </div>

            <div className="w-[1px] h-6 bg-gray-200 hidden md:block"></div>

            <input type="text" value={figureName} onChange={e => setFigureName(e.target.value)} placeholder="Имя" maxLength={12} className="w-20 md:w-24 px-3 py-1.5 rounded-full border-2 text-[10px] font-bold outline-none text-center transition-colors focus:border-plum/30" style={{ borderColor: '#F3F4F6', color: COLORS.ink }} />

            <div className="w-[1px] h-6 bg-gray-200 hidden md:block"></div>

            <div className="flex gap-1.5 p-1.5 rounded-full bg-[#F3F4F6]">
              {['#8B3252', '#2D4A3E', '#C4714A', '#4A90E2', '#E2A94A', '#8E44AD', '#34495E', '#D35400'].map(color => (
                <button key={color} onClick={() => setFigureColor(color)} className={`w-5 h-5 rounded-full shadow-sm border-2 hover:scale-110 transition-transform ${figureColor === color ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
              ))}
            </div>

            <div className="w-[1px] h-6 bg-gray-200 hidden md:block"></div>

            <div className="flex gap-1.5">
              <button onClick={() => { addElement('figure', { gender: 'male', color: figureColor, name: figureName }); setFigureName(''); }} className="px-4 py-2 bg-white rounded-full border border-gray-100 hover:border-plum/30 flex items-center gap-2 transition-all shadow-sm hover:scale-105">
                <FigureIcon gender="male" color={figureColor} isMenu={true} className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase text-gray-600 hidden lg:block">Муж</span>
              </button>
              <button onClick={() => { addElement('figure', { gender: 'female', color: figureColor, name: figureName }); setFigureName(''); }} className="px-4 py-2 bg-white rounded-full border border-gray-100 hover:border-plum/30 flex items-center gap-2 transition-all shadow-sm hover:scale-105">
                <FigureIcon gender="female" color={figureColor} isMenu={true} className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase text-gray-600 hidden lg:block">Жен</span>
              </button>
              <button onClick={() => addElement('arrow', { color: figureColor })} className="px-4 py-2 bg-white rounded-full border border-gray-100 hover:border-plum/30 flex items-center gap-2 transition-all shadow-sm hover:scale-105">
                <ArrowElementIcon color={figureColor} className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase text-gray-600 hidden lg:block">Стрелка</span>
              </button>
            </div>

            <button onClick={() => setIsFiguresPanelOpen(false)} className="ml-1 p-2 text-gray-400 hover:text-terra hover:bg-gray-100 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ИГРОВОЕ ПОЛЕ */}
        <div ref={scrollContainerRef} className="absolute inset-0 overflow-auto custom-scrollbar transition-colors duration-500" style={{ backgroundColor: tableBg.bgColor }}>
          <div ref={boardRef} className="relative min-w-[3000px] min-h-[3000px] bg-transparent" onMouseMove={handleMouseMove} onTouchMove={handleMouseMove}>
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-500" style={{ backgroundColor: tableBg.blendMode ? tableBg.bgColor : 'transparent', backgroundImage: tableBg.value === 'none' ? 'none' : (tableBg.type === 'css' ? tableBg.value : `url('${tableBg.value}')`), backgroundSize: tableBg.bgSize, backgroundPosition: 'center', backgroundRepeat: tableBg.repeat || 'repeat', backgroundBlendMode: tableBg.blendMode || 'normal', opacity: tableBg.opacity }}></div>
            
            {cardsOnTable
              .filter(elem => !undoStack?.cards.some(c => c.id === elem.id))
              .filter(elem => !(isClientMode && elem.type === 'private-text')) // СКРЫВАЕМ ПРИВАТНЫЕ ЗАМЕТКИ ОТ КЛИЕНТА
              .map((elem) => (
                <DraggableElement key={elem.id} element={elem} globalFigureView={figureViewMode} isClientMode={isClientMode} isMuted={isMuted} isLaserMode={isLaserMode} playSound={playSound} maxZIndex={Math.max(0, ...cardsOnTable.map(c => c.zIndex || 0))} onUpdate={(d) => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, elem.id), d)} onRemove={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, elem.id))} onPreview={() => elem.type === 'card' && setPreviewCard(elem)} currentUser={user} currentUserName={userName} onNotify={notify} boardRef={boardRef} />
              ))}
            
            {Object.entries(cursors).map(([id, cur]) => {
              const isMasterCursor = cur.name?.includes('(Мастер)');
              if (isClientMode && isMasterCursor && !cur.isLaser) return null;
              if (cur.isLaser) {
                return (
                  <div key={id} className="absolute pointer-events-none z-[2000] transition-all duration-150 ease-out" style={{ left: cur.x, top: cur.y, transform: 'translate(-50%, -50%)' }}>
                    <div className="w-4 h-4 rounded-full bg-red-500/80 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] border-2 border-white/50" />
                    <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded shadow-md bg-red-500/80 whitespace-nowrap">{cur.name || 'Гость'}</span>
                  </div>
                );
              }
              return (
                <div key={id} className="absolute pointer-events-none z-[2000] flex flex-col items-center transition-all duration-150 ease-out" style={{ left: cur.x, top: cur.y }}>
                  <MousePointer2 size={24} fill={cur.color} color="white" strokeWidth={2} className="drop-shadow-md -rotate-12 transform -translate-x-2 -translate-y-2" />
                  <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded mt-1 shadow-md" style={{ backgroundColor: cur.color }}>{cur.name || 'Гость'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {undoStack && (
          <div className="fixed z-[110] flex items-center gap-3 px-5 py-3 rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.2)] border" style={{ bottom: isLibraryOpen ? '320px' : '80px', left: '50%', transform: 'translateX(-50%)', backgroundColor: COLORS.ink, borderColor: `${COLORS.terra}40`, transition: 'bottom 0.4s ease' }}>
            <Undo2 size={16} color={COLORS.terra} />
            <span className="text-white text-sm font-bold whitespace-nowrap">{undoStack.cards.length} {undoStack.cards.length === 1 ? 'объект' : 'объектов'} удалено</span>
            <button onClick={undoClear} className="px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-all" style={{ backgroundColor: COLORS.plum, color: 'white' }}>ОТМЕНА</button>
            <UndoTimer expiresAt={undoStack.expiresAt} />
          </div>
        )}

        {/* НИЖНЯЯ ПАНЕЛЬ (БИБЛИОТЕКА) */}
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-700 pointer-events-none ${isLibraryOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}`}>
          <div className={`bg-white/90 backdrop-blur-2xl rounded-t-[3rem] shadow-[0_-10px_50px_rgba(0,0,0,0.1)] border-t border-white flex flex-col transition-all duration-500 pointer-events-auto ${isLibraryFullscreen ? 'h-[95vh]' : 'h-[75vh] md:h-80'}`}>
            
            <div className="relative w-full flex justify-center py-2 h-12">
              <button onClick={toggleLibrary} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition-colors rounded-t-[3rem]">
                <div className="w-12 h-1.5 bg-ink/10 rounded-full mb-1"></div>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none text-plum flex items-center gap-2">
                  <Layers size={14} /> {isClientMode ? "Выбор карты" : "Библиотека Мастера"}
                </span>
              </button>
              {isLibraryOpen && (
                <button onClick={toggleFullscreen} className="absolute right-8 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors hover:bg-black/5" style={{ color: COLORS.ink }}>
                  <Maximize2 size={18} />
                </button>
              )}
            </div>
            
            <div className="flex flex-1 flex-col md:flex-row p-4 md:p-8 pt-0 gap-4 md:gap-8 min-h-0 overflow-hidden">
              {!isClientMode && (
                <div className="w-full md:w-72 border-b md:border-b-0 md:border-r pb-4 md:pb-0 pr-0 md:pr-6 h-[30%] md:h-auto flex-shrink-0 overflow-y-auto custom-scrollbar flex flex-col gap-3" style={{ borderColor: `${COLORS.ink}10` }}>
                  <div className="flex p-1 rounded-xl mb-1 flex-shrink-0 bg-black/5">
                    <button onClick={() => setActiveTab('platform')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeTab === 'platform' ? 'bg-white shadow-sm text-plum' : 'hover:opacity-70 text-ink/60'}`}>БАЗА</button>
                    <button onClick={() => setActiveTab('cloud')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeTab === 'cloud' ? 'bg-white shadow-sm text-plum' : 'hover:opacity-70 text-ink/60'}`}>ОБЛАКО</button>
                    <button onClick={() => setActiveTab('local')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeTab === 'local' ? 'bg-white shadow-sm text-plum' : 'hover:opacity-70 text-ink/60'}`}>МОИ</button>
                    <button onClick={() => setActiveTab('sessions')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeTab === 'sessions' ? 'bg-white shadow-sm text-forest' : 'hover:opacity-70 text-ink/60'}`}>СЕССИИ</button>
                  </div>

                  {activeTab === 'sessions' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <div className="text-[10px] font-bold text-center mb-2" style={{ color: COLORS.ink }}>СОХРАНЕННЫЕ РАССТАНОВКИ</div>
                      {savedSessions.length === 0 && <div className="text-[9px] text-center opacity-50">Нет сохраненных сессий</div>}
                      {savedSessions.map(session => (
                        <div key={session.id} className="group flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:bg-black/5 transition-colors">
                           <div>
                              <div className="text-[10px] font-bold" style={{ color: COLORS.ink }}>{session.name}</div>
                              <div className="text-[8px] text-gray-500">{new Date(session.createdAt).toLocaleDateString()}</div>
                           </div>
                           <div className="flex gap-1">
                              <button onClick={() => loadSavedSession(session)} className="p-2 text-forest hover:bg-forest/10 rounded-lg transition-colors" title="Загрузить на стол"><UploadCloud size={14}/></button>
                              <button onClick={async () => {
                                const ok = await askConfirm('Удалить эту сессию навсегда?');
                                if(ok) await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saved_sessions', session.id));
                              }} className="p-2 text-terra hover:bg-terra/10 rounded-lg transition-colors" title="Удалить сессию"><Trash2 size={14}/></button>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeTab === 'local' && (
                    <div className="flex flex-col gap-3 flex-shrink-0">
                      <div className="rounded-2xl p-3 text-[9px] leading-relaxed" style={{ backgroundColor: `${COLORS.forest}12`, color: COLORS.forest, border: `1px solid ${COLORS.forest}25` }}>
                        <div className="font-black uppercase tracking-widest mb-2 flex items-center gap-1"><FolderOpen size={11} /> Как добавить колоду с Google Диска:</div>
                        <div className="space-y-1 font-medium" style={{ color: `${COLORS.ink}99` }}>
                          <div>1. Откройте папку с картами на Google Диске</div>
                          <div>2. Правая кнопка → <b>"Открыть доступ"</b></div>
                          <div>3. Нажмите <b>"Все у кого есть ссылка"</b></div>
                          <div>4. Скопируйте ссылку и вставьте ниже</div>
                        </div>
                      </div>
                      <button onClick={addDeckByLinks} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black transition-all uppercase hover:opacity-80 shadow-sm" style={{ backgroundColor: COLORS.forest, color: 'white', border: 'none' }}>
                        <LinkIcon size={16} /> Вставить ссылку на папку
                      </button>
                    </div>
                  )}

                  {activeTab === 'platform' && isPlatformDecksLoading && <div className="flex justify-center py-4 flex-shrink-0"><Loader2 size={20} className="animate-spin" style={{ color: COLORS.plum }} /></div>}
                  {activeTab === 'cloud' && isBaseDecksLoading && <div className="flex justify-center py-4 flex-shrink-0"><Loader2 size={20} className="animate-spin" style={{ color: COLORS.plum }} /></div>}
                  
                  {activeTab !== 'sessions' && (activeTab === 'platform' ? platformDecks : activeTab === 'local' ? localDecks : [...baseDecks, ...cloudDecks]).map(item => (
                    <div key={item.id} className={`group flex items-center gap-3 p-3 rounded-2xl transition-all relative border flex-shrink-0 ${selectedDeckId === item.id ? 'bg-white shadow-sm border-white' : 'border-transparent hover:bg-black/5'}`}>
                      <button onClick={() => selectDeck(item)} className="flex-1 flex items-center gap-3 text-left overflow-hidden hover:opacity-70">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden border flex-shrink-0 shadow-sm" style={{ borderColor: `${COLORS.ink}10` }}>
                          {item.backImage ? <img src={item.backImage} className="w-full h-full object-contain" alt="" /> : <FolderOpen size={16} color={`${COLORS.ink}4D`} />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[10px] font-bold truncate uppercase" style={{ color: COLORS.ink }}>{item.name}</span>
                          {item.isPlatformDeck && <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: COLORS.forest }}>Платформа</span>}
                          {item.isBaseDeck && <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: `${COLORS.ink}50` }}>Google Drive</span>}
                        </div>
                      </button>
                      {!item.isBaseDeck && !item.isPlatformDeck && (
                        <button onClick={async () => {
                          const ok = await askConfirm("Удалить колоду?");
                          if (ok) {
                            if (activeTab === 'local') setLocalDecks(p => p.filter(d => d.id !== item.id));
                            else await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saved_decks', item.id));
                            notify("Удалено");
                          }
                        }} className="opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-colors hover:bg-black/5" style={{ color: COLORS.terra }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex-1 flex flex-col overflow-hidden">
                {activeDeckData ? (
                  <>
                    <div className="flex justify-between items-center mb-3 flex-shrink-0">
                      <span className="text-sm font-black uppercase" style={{ color: `${COLORS.ink}B3` }}>{activeDeckData.name}</span>
                      {!isClientMode && (
                        <button onClick={toggleDeckFlip} style={{ backgroundColor: COLORS.plum, color: 'white', border: 'none' }} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 transition-all">
                          {isLibraryDeckFlipped ? "Скрыть карты" : "Открыть колоду"}
                        </button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex gap-4 content-start flex-wrap pb-8 pr-2">
                      <button onClick={() => {
                        const array = new Uint32Array(1);
                        window.crypto.getRandomValues(array);
                        const randomIndex = array[0] % activeDeckData.cards.length;
                        addElement('card', { img: activeDeckData.cards[randomIndex], backImg: activeDeckData.backImage });
                        if (isLibraryFullscreen) toggleLibrary();
                      }} className="flex-shrink-0 w-24 h-36 md:w-28 md:h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all shadow-sm" style={{ borderColor: `${COLORS.plum}4D`, backgroundColor: `${COLORS.plum}10`, color: COLORS.plum }}>
                        <Plus size={28} /><span className="text-[9px] font-black uppercase">Наугад</span>
                      </button>
                      
                      {activeDeckData.cards.map((img, idx) => (
                        <button key={idx} onClick={() => {
                          addElement('card', { img, backImg: activeDeckData.backImage });
                          if (isLibraryFullscreen) toggleLibrary();
                        }} className="relative flex-shrink-0 h-36 md:h-40 rounded-2xl group shadow-sm hover:shadow-lg transition-all flex items-center justify-center hover:scale-105">
                          {isLibraryDeckFlipped
                            ? <img src={img} className="h-full w-auto min-w-[5rem] md:min-w-[6rem] object-contain rounded-2xl bg-white shadow-sm" alt={`Карта ${idx + 1}`} />
                            : <div className="h-full w-24 md:w-28 flex items-center justify-center rounded-2xl overflow-hidden relative shadow-sm border border-white/20" style={{ backgroundImage: `linear-gradient(to bottom right, ${COLORS.forest}, ${COLORS.ink})` }}>
                              {activeDeckData.backImage ? <img src={activeDeckData.backImage} className="w-full h-full object-cover absolute inset-0 pointer-events-none" alt="Рубашка" /> : <Layers size={40} className="text-white opacity-30" />}
                            </div>}
                          <div className="absolute top-2 left-2 text-white text-[10px] font-black px-2 py-0.5 rounded-md z-10 pointer-events-none backdrop-blur-md bg-black/40 border border-white/20 shadow-sm">{idx + 1}</div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center font-bold uppercase tracking-widest leading-none text-center px-4" style={{ color: `${COLORS.ink}33` }}>
                    {isClientMode ? "Мастер еще не выбрал колоду" : "Выберите колоду слева"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {isNamingDeck && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center backdrop-blur-sm p-4" style={{ backgroundColor: `${COLORS.ink}CC` }}>
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl border-4" style={{ borderColor: COLORS.haze }}>
            <h3 className="text-xl font-black mb-2 uppercase italic" style={{ color: COLORS.ink }}>ИМЯ КОЛОДЫ</h3>
            <p className="text-[10px] mb-6 font-medium" style={{ color: `${COLORS.ink}66` }}>Выбрано файлов: {pendingFiles.length}. Файл с "рубашка" в названии станет обложкой.</p>
            <input autoFocus value={tempDeckName} onChange={e => setTempDeckName(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmUpload()} placeholder="Напр: Эмоции" className="w-full px-6 py-4 rounded-2xl border-2 mb-8 outline-none font-bold text-base" style={{ borderColor: COLORS.haze, color: COLORS.ink }} />
            {isUploading && (
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold mb-2" style={{ color: `${COLORS.ink}66` }}>
                  <span>Загрузка в облако...</span><span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${COLORS.ink}10` }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%`, backgroundColor: COLORS.plum }} />
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <button onClick={() => { setIsNamingDeck(false); setPendingFiles([]); }} disabled={isUploading} className="flex-1 font-bold uppercase text-xs hover:opacity-70 transition-colors disabled:opacity-30" style={{ color: `${COLORS.ink}66` }}>Отмена</button>
              <button onClick={confirmUpload} disabled={isUploading} style={{ backgroundColor: COLORS.plum, color: 'white', border: 'none' }} className="flex-[2] py-4 rounded-2xl font-black shadow-lg uppercase text-xs disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2">
                {isUploading ? <><Loader2 size={14} className="animate-spin" /> Загрузка {uploadProgress}%</> : "Готово"}
              </button>
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
        
        /* Стили для редактора текста */
        .rich-text b, .rich-text strong { font-weight: 900; color: inherit; }
        .rich-text i, .rich-text em { font-style: italic; }
        .rich-text u { text-decoration: underline; text-underline-offset: 2px; }
        .rich-text strike, .rich-text s { text-decoration: line-through; opacity: 0.7; }
        .rich-text ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 0.25rem; margin-bottom: 0.25rem; }
        .rich-text li { margin-bottom: 0.25rem; }
        .rich-text:empty:before { content: attr(data-placeholder); color: rgba(0,0,0,0.3); font-weight: bold; pointer-events: none; }
        
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
    startPos.current = { x: cx - element.x, y: cy - element.y };
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
    const centerX = boardRect.left + element.x + element.width / 2;
    const centerY = boardRect.top + element.y + element.height / 2;

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
        contentEditableRef.current.innerHTML = element.text || '';
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
        onUpdate({ x: cx - startPos.current.x, y: cy - startPos.current.y });
      } else if (isResizing) {
        const dx = cx - startPos.current.x;
        if (isText) {
          const nw = Math.max(150, startDim.current.w + dx);
          onUpdate({ width: nw }); // Высота у текста теперь автоматическая
        } else {
          const ratio = startDim.current.w / startDim.current.h;
          const nw = Math.max(element.type === 'token' ? 25 : (element.type === 'arrow' ? 30 : 80), startDim.current.w + dx);
          onUpdate({ width: nw, height: nw / ratio });
        }
      } else if (isRotating) {
        if (!boardRef.current) return;
        const boardRect = boardRef.current.getBoundingClientRect();
        const centerX = boardRect.left + element.x + element.width / 2;
        const centerY = boardRect.top + element.y + element.height / 2;
        
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
      window.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchend', end);
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
        left: element.x, top: element.y,
        width: element.width, height: isText ? 'auto' : element.height,
        zIndex: isField ? 0 : (element.zIndex || 1),
        transform: `rotate(${appliedRotation}deg)`,
        transition: (isDragging || isResizing || isRotating) ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      {/* РАДАР / КОМПАС ДЛЯ ВРАЩЕНИЯ ФИГУРОК */}
      {isFigureOrArrow && canDrag && (
        <div
          onMouseDown={handleRotateStart}
          onTouchStart={handleRotateStart}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair z-[-1]"
          style={{ width: element.width + 60, height: element.height + 60 }}
          title="Нажмите на круг, чтобы повернуть"
        >
          <div className="absolute inset-0 rounded-full border-2 border-plum/30 border-dashed bg-plum/5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
            <div key={angle} className="absolute w-full h-full pointer-events-none" style={{ transform: `rotate(${angle}deg)` }}>
              <div className="mx-auto w-2.5 h-2.5 bg-plum/80 rounded-full mt-[-5px] shadow-sm border border-white" />
            </div>
          ))}
        </div>
      )}

      {/* МЕНЮ БЫСТРЫХ ДЕЙСТВИЙ */}
      {!(isLaserMode && !isClientMode) && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all bg-white/80 backdrop-blur-xl rounded-full px-2 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 border border-white">
          {!isField && <button onClick={(e) => { e.stopPropagation(); onUpdate({ zIndex: maxZIndex + 1 }); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-black/5 text-ink/70" title="На передний план"><ArrowUpToLine size={16} /></button>}
          
          {/* НОВАЯ КНОПКА ПОЛОЖИТЬ/ПОСТАВИТЬ (ТОЛЬКО ДЛЯ ФИГУР) */}
          {element.type === 'figure' && (
            <button onClick={(e) => { e.stopPropagation(); onUpdate({ isLaying: !element.isLaying }); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-black/5 text-ink/70" title={element.isLaying ? "Разбудить / Поставить фигурку" : "Уложить фигурку (сон/смерть)"}>
              {element.isLaying ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          )}

          {/* ГЛАЗОК - появляется ТОЛЬКО когда карта рубашкой вверх (isFlipped === true) */}
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
          
          {/* Кнопки поворота (Для карт, где нет компаса) */}
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

      {!isClientMode && isField && !(isLaserMode && !isClientMode) && (
        <div className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-20" style={{ left: 'calc(100% + 12px)' }}>
          <button onClick={(e) => { e.stopPropagation(); onUpdate({ isLocked: !isLocked }); }} className="p-3 rounded-full transition-colors hover:opacity-80 shadow-xl border bg-white/90 backdrop-blur-md" style={{ color: isLocked ? COLORS.terra : `${COLORS.ink}80`, borderColor: isLocked ? COLORS.terra : `${COLORS.ink}20` }} title={isLocked ? "Открепить поле" : "Закрепить поле"}>
            {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
          </button>
        </div>
      )}

      <div
        className={`${baseClasses} ${dragClasses} ${typeClasses}`}
        style={{ perspective: isField ? 'none' : '1000px', height: isText ? 'auto' : '100%' }}
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
              className="rich-text flex-1 w-full p-4 bg-transparent outline-none text-[13px] text-gray-800 leading-relaxed min-h-[60px]"
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
             <FigureIcon gender={element.gender} color={element.color} viewMode={globalFigureView} rotation={element.rotation} name={element.name} isLaying={element.isLaying} className="w-full h-full" />
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
