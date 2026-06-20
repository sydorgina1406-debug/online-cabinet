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
    console.error('РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РєРѕР»РѕРґ РїР»Р°С‚С„РѕСЂРјС‹:', e);
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
  { id: 'milky', name: 'РњРѕР»РѕС‡РЅС‹Р№', type: 'css', value: 'none', bgSize: 'auto', bgColor: '#FDFAF6', opacity: 1 },
  { id: 'forest', name: 'Р—РµР»РµРЅС‹Р№', type: 'css', value: 'none', bgSize: 'auto', bgColor: '#2D4A3E', opacity: 1 },
  { id: 'plum', name: 'РЎР»РёРІРѕРІС‹Р№', type: 'css', value: 'none', bgSize: 'auto', bgColor: '#8B3252', opacity: 1 },
  { id: 'purple', name: 'Р¤РёРѕР»РµС‚РѕРІС‹Р№', type: 'css', value: 'none', bgSize: 'auto', bgColor: '#4A148C', opacity: 1 },
  { id: 'terra', name: 'РўРµСЂСЂР°РєРѕС‚РѕРІС‹Р№', type: 'css', value: 'none', bgSize: 'auto', bgColor: '#D26027', opacity: 1 }
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

const getDriveThumbnailUrl = (fileId) => `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

const normalizeCardNumber = (value) => String(value || '').replace(/^0+(?=\d)/, '');

const getFileStem = (name = '') => String(name).replace(/\.[^/.]+$/, '').trim();

const getNumberedCardNumber = (name) => {
  const match = getFileStem(name).match(/^(\d+)$/);
  return match ? normalizeCardNumber(match[1]) : null;
};

const getNumberedBackNumber = (name) => {
  const match = getFileStem(name).match(/^(\d+)-1$/);
  return match ? normalizeCardNumber(match[1]) : null;
};

const isCommonBackFileName = (name = '') => String(name).toLowerCase().includes('\u0440\u0443\u0431\u0430\u0448\u043a\u0430');

const isDeckBoxFileName = (name = '') => String(name).toLowerCase().includes('\u043a\u043e\u0440\u043e\u0431\u043a');

const sortByFileName = (a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { numeric: true, sensitivity: 'base' });

const buildDeckImages = (files) => {
  const sortedFiles = [...files].sort(sortByFileName);
  const hasNumberedBacks = sortedFiles.some(file => getNumberedBackNumber(file.name));
  let backImage = null;
  let boxImage = null;
  const cards = [];
  const cardBacks = [];

  if (hasNumberedBacks) {
    const backsByNumber = new Map();
    const numberedCards = [];
    const otherCards = [];

    for (const file of sortedFiles) {
      if (isDeckBoxFileName(file.name)) {
        boxImage = file.url;
        continue;
      }
      if (isCommonBackFileName(file.name)) {
        backImage = file.url;
        continue;
      }

      const backNumber = getNumberedBackNumber(file.name);
      if (backNumber) {
        backsByNumber.set(backNumber, file.url);
        continue;
      }

      const cardNumber = getNumberedCardNumber(file.name);
      if (cardNumber) numberedCards.push({ ...file, cardNumber });
      else otherCards.push(file);
    }

    numberedCards
      .sort((a, b) => Number(a.cardNumber) - Number(b.cardNumber) || sortByFileName(a, b))
      .forEach(file => {
        cards.push(file.url);
        cardBacks.push(backsByNumber.get(file.cardNumber) || null);
      });

    otherCards.forEach(file => {
      cards.push(file.url);
      cardBacks.push(null);
    });
  } else {
    for (const file of sortedFiles) {
      if (isCommonBackFileName(file.name)) backImage = file.url;
      else cards.push(file.url);
    }
  }

  return {
    cards,
    backImage,
    boxImage,
    cardBacks: cardBacks.some(Boolean) ? cardBacks : []
  };
};

const buildDeckFromFiles = (files, deckData = {}) => ({
  ...deckData,
  ...buildDeckImages(files.map(file => ({
    name: file.name,
    url: file.url || getDriveThumbnailUrl(file.id)
  })))
});

const getDeckCardBackImage = (deck, cardImg, cardIndex = -1) => {
  const cardBacks = Array.isArray(deck?.cardBacks) ? deck.cardBacks : [];
  const index = cardIndex >= 0 ? cardIndex : (deck?.cards || []).indexOf(cardImg);
  return cardBacks[index] || deck?.backImage || null;
};

const loadDriveFolderFiles = async (folderId, apiKey, imagesOnly = true) => {
  const mimeFilter = imagesOnly ? "mimeType contains 'image/' and " : "";
  const q = `'${folderId}' in parents and ${mimeFilter}trashed = false`;
  const files = [];
  let pageToken = '';

  do {
    const params = new URLSearchParams({
      q,
      fields: 'nextPageToken,files(id,name,mimeType)',
      key: apiKey,
      orderBy: 'name',
      pageSize: '1000',
      includeItemsFromAllDrives: 'true',
      supportsAllDrives: 'true'
    });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`);
    if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
    const data = await res.json();
    files.push(...(data.files || []));
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return files.sort(sortByFileName);
};

const loadBaseDecks = async (notifyCb) => {
  try {
    const allItems = await loadDriveFolderFiles(ROOT_DRIVE_FOLDER_ID, DRIVE_API_KEY, false);

    const folders = allItems.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
    const images = allItems.filter(f => f.mimeType.includes('image/'));
    const loadedDecks = [];

    if (folders.length > 0) {
      for (const folder of folders) {
        const files = await loadDriveFolderFiles(folder.id, DRIVE_API_KEY);
        const deck = buildDeckFromFiles(files, { id: folder.id, name: folder.name, isBaseDeck: true });
        if (deck.cards.length > 0) {
          loadedDecks.push(deck);
        }
      }
    } else if (images.length > 0) {
      const deck = buildDeckFromFiles(images, { id: ROOT_DRIVE_FOLDER_ID, name: "Базовая колода", isBaseDeck: true });
      if (deck.cards.length > 0) {
        loadedDecks.push(deck);
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
  return <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 400 }}>{sec}СЃ</span>;
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

  const [platformName, setPlatformName] = useState("РћРќР›РђР™Рќ РљРђР‘РРќР•Рў");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const processedCandidates = useRef(new Set());
  const callSnapshotUnsubRef = useRef(null);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoCallReady, setIsVideoCallReady] = useState(false);
  const [callStatus, setCallStatus] = useState('');

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
      setCallStatus('РџРѕРґРіРѕС‚РѕРІРєР°...');
      processedCandidates.current.clear();

      await new Promise(resolve => setTimeout(resolve, 100));

      setCallStatus('Р”РѕСЃС‚СѓРї Рє РєР°РјРµСЂРµ...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
         localVideoRef.current.srcObject = stream;
         localVideoRef.current.play().catch(()=>{});
      }

      const pc = new RTCPeerConnection(rtcConfig);
      pcRef.current = pc;

      // Р’РђР–РќРћ: СЃРЅР°С‡Р°Р»Р° РґРѕР±Р°РІР»СЏРµРј С‚СЂРµРєРё, РїРѕС‚РѕРј РІСЃС‘ РѕСЃС‚Р°Р»СЊРЅРѕРµ
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        console.log('[PSY] ontrack РїРѕР»СѓС‡РµРЅ:', event.streams);
        if (remoteVideoRef.current) {
           remoteVideoRef.current.srcObject = event.streams[0];
           remoteVideoRef.current.play().catch(err => console.warn('play err', err));
        }
        setCallStatus('');
      };

      pc.onconnectionstatechange = () => {
        console.log('[PSY] connectionState:', pc.connectionState);
        if (pc.connectionState === 'connected') setCallStatus('');
        else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') setCallStatus('РЎРІСЏР·СЊ РїСЂРµСЂРІР°РЅР°...');
      };

      pc.oniceconnectionstatechange = () => {
        console.log('[PSY] iceConnectionState:', pc.iceConnectionState);
      };

      const callDoc = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_webrtc');
      // Р§РёСЃС‚РёРј РґРѕРєСѓРјРµРЅС‚ РїРµСЂРµРґ СЃС‚Р°СЂС‚РѕРј
      await setDoc(callDoc, { offerCandidates: [], answerCandidates: [], createdAt: Date.now() });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[PSY] РѕС‚РїСЂР°РІР»СЏСЋ ICE РєР°РЅРґРёРґР°С‚Р°');
          updateDoc(callDoc, { offerCandidates: arrayUnion(event.candidate.toJSON()) }).catch(e => console.error('ice send err', e));
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await updateDoc(callDoc, { offer: { type: offer.type, sdp: offer.sdp } });

      // РўРѕР»СЊРєРѕ РїРѕСЃР»Рµ СЃРѕР·РґР°РЅРёСЏ offer РѕРїРѕРІРµС‰Р°РµРј РєР»РёРµРЅС‚Р°
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { isVideoCallReady: true }, { merge: true });

      setCallStatus('РћР¶РёРґР°РЅРёРµ РєР»РёРµРЅС‚Р°...');

      if (callSnapshotUnsubRef.current) callSnapshotUnsubRef.current();

      let answerSet = false;

      callSnapshotUnsubRef.current = onSnapshot(callDoc, async (snap) => {
        const data = snap.data();
        if (!data) return;

        // РџСЂРёРЅРёРјР°РµРј answer РѕРґРёРЅ СЂР°Р·
        if (data.answer && !answerSet && pc.signalingState !== 'closed') {
          try {
            console.log('[PSY] РїРѕР»СѓС‡РµРЅ answer, СЃС‚Р°РІР»СЋ remoteDescription');
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            answerSet = true;
          } catch(e) { 
            console.error("[PSY] setRemoteDescription error", e); 
          }
        }

        // ICE-РєР°РЅРґРёРґР°С‚С‹ РѕС‚ РєР»РёРµРЅС‚Р° вЂ” РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ СѓСЃС‚Р°РЅРѕРІРєРё remoteDescription
        if (pc.remoteDescription && data.answerCandidates) {
          for (const c of data.answerCandidates) {
            const candKey = JSON.stringify(c);
            if (!processedCandidates.current.has(candKey)) {
              processedCandidates.current.add(candKey);
              try {
                await pc.addIceCandidate(new RTCIceCandidate(c));
                console.log('[PSY] РґРѕР±Р°РІРёР» answer РєР°РЅРґРёРґР°С‚Р°');
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
      notify("РћС€РёР±РєР° РІРёРґРµРѕСЃРІСЏР·Рё: " + err.message, 8000);
      console.error("WebRTC Error:", err);
    }
  };

  const joinNativeCall = async () => {
    try {
      setIsVideoActive(true);
      setCallStatus('РџРѕРґРіРѕС‚РѕРІРєР°...');
      processedCandidates.current.clear();

      await new Promise(resolve => setTimeout(resolve, 100));

      setCallStatus('Р”РѕСЃС‚СѓРї Рє РєР°РјРµСЂРµ...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
         localVideoRef.current.srcObject = stream;
         localVideoRef.current.play().catch(()=>{});
      }

      const pc = new RTCPeerConnection(rtcConfig);
      pcRef.current = pc;

      // Р’РђР–РќРћ: СЃРЅР°С‡Р°Р»Р° РґРѕР±Р°РІР»СЏРµРј С‚СЂРµРєРё
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        console.log('[CLIENT] ontrack РїРѕР»СѓС‡РµРЅ:', event.streams);
        if (remoteVideoRef.current) {
           remoteVideoRef.current.srcObject = event.streams[0];
           remoteVideoRef.current.play().catch(err => console.warn('play err', err));
        }
        setCallStatus('');
      };

      pc.onconnectionstatechange = () => {
        console.log('[CLIENT] connectionState:', pc.connectionState);
        if (pc.connectionState === 'connected') setCallStatus('');
        else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') setCallStatus('РЎРІСЏР·СЊ РїСЂРµСЂРІР°РЅР°...');
      };

      pc.oniceconnectionstatechange = () => {
        console.log('[CLIENT] iceConnectionState:', pc.iceConnectionState);
      };

      const callDoc = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_webrtc');

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[CLIENT] РѕС‚РїСЂР°РІР»СЏСЋ ICE РєР°РЅРґРёРґР°С‚Р°');
          updateDoc(callDoc, { answerCandidates: arrayUnion(event.candidate.toJSON()) }).catch(e => console.error('ice send err', e));
        }
      };

      // Р–РґС‘Рј offer РѕС‚ РїСЃРёС…РѕР»РѕРіР° (РµСЃР»Рё РµС‰С‘ РЅРµ РїРѕСЏРІРёР»СЃСЏ вЂ” Р¶РґС‘Рј С‡РµСЂРµР· onSnapshot)
      setCallStatus('РћР¶РёРґР°РЅРёРµ СЃРёРіРЅР°Р»Р° РѕС‚ РїСЃРёС…РѕР»РѕРіР°...');

      let offerHandled = false;
      if (callSnapshotUnsubRef.current) callSnapshotUnsubRef.current();

      callSnapshotUnsubRef.current = onSnapshot(callDoc, async (snap) => {
        const data = snap.data();
        if (!data) return;

        // РћР±СЂР°Р±Р°С‚С‹РІР°РµРј offer РѕРґРёРЅ СЂР°Р·
        if (data.offer && !offerHandled && pc.signalingState === 'stable') {
          offerHandled = true;
          try {
            console.log('[CLIENT] РїРѕР»СѓС‡РµРЅ offer, СЃС‚Р°РІР»СЋ remoteDescription');
            setCallStatus('РЎРѕРµРґРёРЅРµРЅРёРµ...');
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await updateDoc(callDoc, { answer: { type: answer.type, sdp: answer.sdp } });
            console.log('[CLIENT] answer РѕС‚РїСЂР°РІР»РµРЅ');
          } catch(e) {
            console.error('[CLIENT] РѕР±СЂР°Р±РѕС‚РєР° offer РѕС€РёР±РєР°:', e);
            offerHandled = false;
          }
        }

        // ICE-РєР°РЅРґРёРґР°С‚С‹ РѕС‚ РїСЃРёС…РѕР»РѕРіР°
        if (pc.remoteDescription && data.offerCandidates) {
          for (const c of data.offerCandidates) {
            const candKey = JSON.stringify(c);
            if (!processedCandidates.current.has(candKey)) {
              processedCandidates.current.add(candKey);
              try {
                await pc.addIceCandidate(new RTCIceCandidate(c));
                console.log('[CLIENT] РґРѕР±Р°РІРёР» offer РєР°РЅРґРёРґР°С‚Р°');
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
      notify("РћС€РёР±РєР° РІРёРґРµРѕСЃРІСЏР·Рё: " + err.message, 8000);
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
          notify('РџСЃРёС…РѕР»РѕРі Р·Р°РІРµСЂС€РёР» Р·РІРѕРЅРѕРє', 5000);
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
    notify(`РўР°Р№РјРµСЂ Р·Р°РїСѓС‰РµРЅ: ${minutes} РјРёРЅСѓС‚ вЏ±`);
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
    const newName = await askPrompt("РќР°Р·РІР°РЅРёРµ РІР°С€РµРіРѕ РєР°Р±РёРЅРµС‚Р°:", platformName);
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
      notify("РћС€РёР±РєР°: СЃРµСЃСЃРёСЏ РЅРµ РЅР°Р№РґРµРЅР°. РџРµСЂРµР·Р°Р№РґРёС‚Рµ.");
      return;
    }
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${currentRoomId}`, '_active_deck'), {
        id: deck.id,
        name: deck.name,
        cards: deck.cards || [],
        backImage: deck.backImage || null,
        boxImage: deck.boxImage || null,
        cardBacks: deck.cardBacks || []
      });
      syncLibraryUI({ isFlipped: false });
      notify(`РљРѕР»РѕРґР° "${deck.name}" Р°РєС‚РёРІРёСЂРѕРІР°РЅР° вњ“`);
    } catch(e) {
      notify("РћС€РёР±РєР° СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё: " + e.message);
    }
  };

  const handleLogin = async () => {
    if (!emailInput || !passwordInput) return notify("Р’РІРµРґРёС‚Рµ Email Рё РџР°СЂРѕР»СЊ");
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
      setUserName(name + " (РњР°СЃС‚РµСЂ)");
      setIsClientMode(false); window._isClientMode = false; setIsAuthorized(true); setInRoom(true); setShowKeyPrompt(false);
      notify(`РџСЂРёРІРµС‚, ${name}! Р‘Р°Р·РѕРІС‹Рµ РєРѕР»РѕРґС‹ Р·Р°РіСЂСѓР¶Р°СЋС‚СЃСЏ...`);
    };

    if ((inputEmail === "yulia" || inputEmail === "СЋР»РёСЏ") && inputPwd === "owner777") {
      enterRoomAsPsy("Р®Р»РёСЏ");
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
        notify(found ? "РџРѕРґРїРёСЃРєР° РёСЃС‚РµРєР»Р° (РџСЂРѕРІРµСЂСЊС‚Рµ С„РѕСЂРјР°С‚ РґР°С‚С‹ РІ С‚Р°Р±Р»РёС†Рµ)" : "РќРµРІРµСЂРЅС‹Р№ Email РёР»Рё РџР°СЂРѕР»СЊ"); 
      }
    } catch (e) {
      setIsCheckingKey(false);
      notify("РћС€РёР±РєР° СЃРІСЏР·Рё СЃ С‚Р°Р±Р»РёС†РµР№. Р’РєР»СЋС‡РёС‚Рµ РїСЂРѕРєСЃРё РёР»Рё СѓР±РµРґРёС‚РµСЃСЊ С‡С‚Рѕ С‚Р°Р±Р»РёС†Р° РѕРїСѓР±Р»РёРєРѕРІР°РЅР° РІ РёРЅС‚РµСЂРЅРµС‚Рµ.");
    }
  };

  const handleClientLogin = () => {
    if (!clientNameInput.trim()) return notify("РЈРєР°Р¶РёС‚Рµ РІР°С€Рµ РёРјСЏ");
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
      notify('РЎСЃС‹Р»РєР° СЃРєРѕРїРёСЂРѕРІР°РЅР°!');
    } else {
      notify('РќРµ СѓРґР°Р»РѕСЃСЊ СЃРєРѕРїРёСЂРѕРІР°С‚СЊ. РЎРєРѕРїРёСЂСѓР№С‚Рµ СЃСЃС‹Р»РєСѓ РІСЂСѓС‡РЅСѓСЋ РёР· Р°РґСЂРµСЃРЅРѕР№ СЃС‚СЂРѕРєРё.');
    }
  };

  const saveCurrentSession = async () => {
    const name = await askPrompt("Р’РІРµРґРёС‚Рµ РЅР°Р·РІР°РЅРёРµ РґР»СЏ СЃРѕС…СЂР°РЅРµРЅРёСЏ С‚РµРєСѓС‰РµРіРѕ СЃС‚РѕР»Р° (РЅР°РїСЂРёРјРµСЂ: РЎРµСЃСЃРёСЏ СЃ РђРЅРЅРѕР№):");
    if (!name || !name.trim()) return;
    notify("РЎРѕС…СЂР°РЅСЏСЋ СЃРµСЃСЃРёСЋ...");
    try {
      const elementsToSave = cardsOnTable.filter(c => c.id !== '_settings' && c.id !== '_dice_state' && c.id !== '_dice_type' && c.id !== '_library_state' && !c.id.startsWith('_'));
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_sessions'), {
        name: name.trim(),
        elements: elementsToSave,
        createdAt: Date.now()
      });
      notify("РЎРµСЃСЃРёСЏ СѓСЃРїРµС€РЅРѕ СЃРѕС…СЂР°РЅРµРЅР°! РС‰РёС‚Рµ РµРµ РІРѕ РІРєР»Р°РґРєРµ РЎР•РЎРЎРР РІ Р±РёР±Р»РёРѕС‚РµРєРµ.");
    } catch (e) {
      notify("РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ СЃРµСЃСЃРёРё: " + e.message);
    }
  };

  const loadSavedSession = async (session) => {
    const ok = await askConfirm(`Р’С‹ СѓРІРµСЂРµРЅС‹, С‡С‚Рѕ С…РѕС‚РёС‚Рµ Р·Р°РіСЂСѓР·РёС‚СЊ "${session.name}"? РўРµРєСѓС‰РёР№ СЃС‚РѕР» Р±СѓРґРµС‚ РћР§РР©Р•Рќ.`);
    if (!ok) return;
    notify("Р—Р°РіСЂСѓР¶Р°СЋ СЃРµСЃСЃРёСЋ...");
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
      notify("РЎРµСЃСЃРёСЏ Р·Р°РіСЂСѓР¶РµРЅР° РЅР° СЃС‚РѕР»! вњ“");
      if (isLibraryOpen) toggleLibrary();
    } catch (e) {
      notify("РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё СЃРµСЃСЃРёРё: " + e.message);
    }
  };

  const handleNoteImageUpload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setIsUploadingNoteImage(true);
    notify("Р—Р°РіСЂСѓР·РєР° РєР°СЂС‚РёРЅРєРё...", 4000);
    try {
      const data = await new Promise(r => { const rd = new FileReader(); rd.onload = ev => r(ev.target.result); rd.readAsDataURL(f); });
      const comp = await compressImage(data, 800, 800);
      const url = await uploadImageToStorage(comp, `notes_images/${user?.uid || 'anon'}/${Date.now()}.jpg`);
      if (notebookEditorRef.current) {
        notebookEditorRef.current.focus();
        document.execCommand('insertImage', false, url);
      }
      notify("РљР°СЂС‚РёРЅРєР° РґРѕР±Р°РІР»РµРЅР°!");
    } catch (err) {
      notify("РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё: " + err.message);
    } finally {
      setIsUploadingNoteImage(false);
      e.target.value = '';
    }
  };

  const takeScreenshot = async () => {
    if (!boardRef.current) return;

    const elements = cardsOnTable.filter(c => !c.id.startsWith('_'));
    if (elements.length === 0) {
      return notify("РЎС‚РѕР» РїСѓСЃС‚, РЅРµС‡РµРіРѕ СЃРѕС…СЂР°РЅСЏС‚СЊ");
    }

    notify("РЎРѕР·РґР°СЋ СЃРєСЂРёРЅС€РѕС‚, РїРѕРґРѕР¶РґРёС‚Рµ...", 8000);

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
            // РџРµСЂРµС…РѕРґРёРј Рє СЃР»РµРґСѓСЋС‰РµРјСѓ РїСЂРѕРєСЃРё
          }
        }
        
        // РџРѕСЃР»РµРґРЅРёР№ fallback: РїРѕР»СѓС‡РµРЅРёРµ base64 С‡РµСЂРµР· JSON
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
              ctx.fillText(el.isFlipped ? 'MAK SPACE' : 'РќРµРґРѕСЃС‚СѓРїРЅРѕ', ew / 2, eh / 2);
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
      link.download = `РЎРµСЃСЃРёСЏ_${dateStr}.png`;
      link.href = dataUrl;
      link.click();
      notify("РЎРєСЂРёРЅС€РѕС‚ СЃРѕС…СЂР°РЅРµРЅ! вњ“");
    } catch (e) {
      console.error('Screenshot error:', e);
      notify("РћС€РёР±РєР° СЃРєСЂРёРЅС€РѕС‚Р°: " + (e.message || 'РЅРµРёР·РІРµСЃС‚РЅР°СЏ'));
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
    if (unlocked.length === 0) return notify("РќРµС‚ РЅРµР·Р°РєСЂРµРїР»С‘РЅРЅС‹С… РѕР±СЉРµРєС‚РѕРІ РЅР° СЃС‚РѕР»Рµ");
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
    notify("Р’РѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРѕ вњ“");
  };

  const confirmUpload = async () => {
    if (pendingFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const deckId = `deck_${Date.now()}`;
      const uploadedFiles = [];
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
        const isDeckMeta = isCommonBackFileName(file.name) || isDeckBoxFileName(file.name) || !!getNumberedBackNumber(file.name);
        const path = `decks/${user.uid}/${deckId}/${isDeckMeta ? `deck_meta_${i}` : `card_${i}`}.jpg`;
        const url = await uploadImageToStorage(compressed, path);
        uploadedFiles.push({ name: file.name, url });
      }
      setUploadProgress(100);
      const newDeck = { name: tempDeckName || "Колода", ...buildDeckImages(uploadedFiles), createdAt: Date.now() };
      if (isDbConnected && user && !isClientMode) {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), newDeck);
        notify("РљРѕР»РѕРґР° СЃРѕС…СЂР°РЅРµРЅР° РІ РћР±Р»Р°РєРѕ вњ“");
      } else {
        setLocalDecks(p => [...p, { ...newDeck, id: Date.now().toString() }]);
        notify("Р”РѕР±Р°РІР»РµРЅРѕ Р»РѕРєР°Р»СЊРЅРѕ");
      }
    } catch (err) {
      notify("РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё: " + err.message);
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
    const input = await askPrompt("Р’СЃС‚Р°РІСЊС‚Рµ СЃСЃС‹Р»РєСѓ РЅР° РїР°РїРєСѓ Google Р”РёСЃРєР° (РёР»Рё РЅРµСЃРєРѕР»СЊРєРѕ СЃСЃС‹Р»РѕРє РЅР° С„Р°Р№Р»С‹):");
    if (!input || !input.trim()) return;
    const folderId = extractDriveFolderId(input.trim());
    if (folderId) {
      const name = await askPrompt("РРјСЏ РєРѕР»РѕРґС‹:");
      if (!name) return;
      notify("Р—Р°РіСЂСѓР¶Р°СЋ СЃРїРёСЃРѕРє С„Р°Р№Р»РѕРІ РёР· РїР°РїРєРё...");
      try {
        const files = await loadDriveFolderFiles(folderId, DRIVE_API_KEY);
        if (files.length === 0) return notify("Р’ РїР°РїРєРµ РЅРµС‚ РёР·РѕР±СЂР°Р¶РµРЅРёР№.");
        const deckImages = buildDeckImages(files.map(file => ({ name: file.name, url: getDriveThumbnailUrl(file.id) })));
        if (deckImages.cards.length === 0) return notify("Карты не найдены.");
        const newDeck = { name, ...deckImages, createdAt: Date.now() };
        if (isDbConnected && user && !isClientMode) {
          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), newDeck);
          notify(`Колода "${name}": ${deckImages.cards.length} карт ✓`);
          setActiveTab('cloud');
        } else {
          setLocalDecks(p => [...p, { ...newDeck, id: Date.now().toString() }]);
        }
      } catch (e) {
        notify("РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РїР°РїРєРё: " + e.message);
      }
    } else {
      const name = await askPrompt("РРјСЏ РєРѕР»РѕРґС‹:");
      if (!name) return;
      const linkArray = input.split(/[\n\r,\s]+/).map(l => l.trim()).filter(l => l.length > 10).map(l => convertDriveLink(l)).filter(Boolean);
      if (linkArray.length === 0) return notify("РќРµ РЅР°Р№РґРµРЅРѕ РЅРё РѕРґРЅРѕР№ СЃСЃС‹Р»РєРё");
      const newDeck = { name, cards: linkArray, backImage: null, createdAt: Date.now() };
      if (isDbConnected && user && !isClientMode) {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), newDeck);
        notify(`РљРѕР»РѕРґР° "${name}" СЃРѕС…СЂР°РЅРµРЅР°: ${linkArray.length} РєР°СЂС‚ вњ“`);
        setActiveTab('cloud');
      } else {
        setLocalDecks(p => [...p, { ...newDeck, id: Date.now().toString() }]);
      }
    }
  };

  if (appLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4" style={{ backgroundColor: COLORS.ink }}>
      <Loader2 size={40} className="animate-spin text-plum" />
      Р—Р°РіСЂСѓР·РєР° РєР°Р±РёРЅРµС‚Р°...
    </div>
  );

  if (!inRoom) return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden" style={{ backgroundColor: COLORS.ink, color: COLORS.haze }}>
      {customDialog && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}CC` }}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black mb-4 text-center" style={{ color: COLORS.ink }}>{customDialog.title}</h3>
            {customDialog.type === 'prompt' && (
              <input autoFocus defaultValue={customDialog.defaultValue || ''} placeholder={customDialog.placeholder || ''} id="dialog-input" className="w-full px-4 py-3 rounded-xl border-2 mb-6 outline-none font-bold text-center" style={{ borderColor: COLORS.haze }} onKeyDown={(e) => e.key === 'Enter' && (customDialog.onOk(e.target.value), setCustomDialog(null))} />
            )}
            <div className="flex gap-3">
              <button onClick={() => { customDialog.onCancel(); setCustomDialog(null); }} className="flex-1 py-3 font-bold rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">РћС‚РјРµРЅР°</button>
              <button onClick={() => { const val = customDialog.type === 'prompt' ? document.getElementById('dialog-input').value : true; customDialog.onOk(val); setCustomDialog(null); }} className="flex-1 py-3 font-bold rounded-xl text-white transition-colors" style={{ backgroundColor: COLORS.plum }}>РћРє</button>
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
          <h1 className="text-3xl font-black uppercase italic mb-2 leading-none">РћРќР›РђР™Рќ РљРђР‘РРќР•Рў</h1>
          <p className="font-bold text-[10px] tracking-[0.3em] uppercase" style={{ color: COLORS.forest }}>РџР»Р°С‚С„РѕСЂРјР° РґР»СЏ СЃРµСЃСЃРёР№</p>
        </div>
        
        <div className="space-y-4">
          {!isClientMode ? (
            !showKeyPrompt ? (
              <div className="flex flex-col gap-4">
                <button onClick={() => setShowKeyPrompt(true)} style={{ backgroundColor: COLORS.plum, color: 'white', border: 'none' }} className="w-full font-black py-5 rounded-2xl text-xs uppercase tracking-widest shadow-lg flex flex-col items-center gap-2 transition-all hover:opacity-90">
                  <Key size={24} /> Р’РћР™РўР РљРђРљ РџРЎРРҐРћР›РћР“
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input type="text" value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Email" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center text-base" style={{ borderColor: COLORS.plum, color: COLORS.plum, backgroundColor: `${COLORS.plum}10` }} />
                <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="РџР°СЂРѕР»СЊ" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center text-base" style={{ borderColor: COLORS.plum, color: COLORS.plum, backgroundColor: `${COLORS.plum}10` }} />
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowKeyPrompt(false)} className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: `${COLORS.ink}80` }}>РќР°Р·Р°Рґ</button>
                  <button onClick={handleLogin} disabled={isCheckingKey} style={{ backgroundColor: COLORS.forest, color: 'white', border: 'none' }} className="flex-[2] font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-md disabled:opacity-50">
                    {isCheckingKey ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> РџСЂРѕРІРµСЂРєР°...</span> : "Р’РѕР№С‚Рё"}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <p className="font-bold text-[10px] uppercase text-center mb-4" style={{ color: COLORS.ink }}>РџСЂРµРґСЃС‚Р°РІСЊС‚РµСЃСЊ, С‡С‚РѕР±С‹ Р·Р°Р№С‚Рё Р·Р° СЃС‚РѕР»:</p>
              <input type="text" value={clientNameInput} onChange={e => setClientNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleClientLogin()} placeholder="Р’Р°С€Рµ РРјСЏ" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center text-base" style={{ borderColor: COLORS.forest, color: COLORS.forest, backgroundColor: `${COLORS.forest}10` }} />
              <button onClick={handleClientLogin} style={{ backgroundColor: COLORS.forest, color: 'white', border: 'none' }} className="w-full font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-md transition-all hover:opacity-90 mt-2">Р’РѕР№С‚Рё РІ РєР°Р±РёРЅРµС‚</button>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t-2 border-dashed flex flex-col items-center gap-4" style={{ borderColor: `${COLORS.ink}15` }}>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-center" style={{ color: `${COLORS.ink}60` }}>
            РќСѓР¶РЅР° РїРѕРјРѕС‰СЊ РёР»Рё РµСЃС‚СЊ РІРѕРїСЂРѕСЃС‹ РїРѕ РїР»Р°С‚С„РѕСЂРјРµ?
          </span>
          <div className="flex flex-col gap-3 w-full">
            <a href="https://t.me/psyplat" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-4 rounded-[1rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:scale-[1.02] shadow-sm border border-transparent hover:border-plum/20" style={{ backgroundColor: '#FDF7F9', color: COLORS.plum }}>
               <MessageCircle size={16} strokeWidth={2.5} /> TELEGRAM-РљРђРќРђР›
            </a>
            <a href="https://max.ru/join/kmLoxZy4ssavrneuneZhry22HKbI5hbe11kPGlQUXUg" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-4 rounded-[1rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:scale-[1.02] shadow-sm border border-transparent hover:border-forest/20" style={{ backgroundColor: '#F5FAF8', color: COLORS.forest }}>
               <MaxIcon size={16} color={COLORS.forest} /> РЎР’РЇР—Р¬ (РњРђРљРЎ)
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
              <BookOpen size={24} className="text-blue-600" /> РњРѕРё РўРµС…РЅРёРєРё
            </h2>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4">
              {!isCreatingNote ? (
                <>
                  <button onClick={() => { setIsCreatingNote(true); setEditingNoteId(null); setNoteTitleInput(''); setTimeout(() => { if (notebookEditorRef.current) notebookEditorRef.current.innerHTML = ''; }, 50); }} className="w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 hover:bg-black/5 transition-all" style={{ borderColor: `${COLORS.plum}4D`, color: COLORS.plum }}>
                    <Plus size={20} /> <span className="font-black uppercase text-[10px] tracking-widest">Р”РѕР±Р°РІРёС‚СЊ С‚РµС…РЅРёРєСѓ / СЃРєСЂРёРїС‚</span>
                  </button>
                  {savedNotes.length === 0 && (
                    <p className="text-center text-sm font-medium opacity-50 mt-4">РЈ РІР°СЃ РїРѕРєР° РЅРµС‚ СЃРѕС…СЂР°РЅРµРЅРЅС‹С… С‚РµС…РЅРёРє.</p>
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
                          }} className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors" title="Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={async () => {
                            if (await askConfirm('РЈРґР°Р»РёС‚СЊ С‚РµС…РЅРёРєСѓ?')) {
                              await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saved_notes', note.id));
                            }
                          }} className="text-gray-400 hover:text-terra hover:bg-terra/10 p-1.5 rounded-lg transition-colors" title="РЈРґР°Р»РёС‚СЊ">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-pre-wrap rich-text max-h-[150px] overflow-hidden" dangerouslySetInnerHTML={{ __html: note.text }}></div>
                      <button onClick={() => {
                        addElement('private-text', { text: note.text });
                        setIsNotebookOpen(false);
                        notify("РўРµС…РЅРёРєР° РґРѕР±Р°РІР»РµРЅР° РЅР° СЃС‚РѕР»!");
                      }} className="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all hover:opacity-90 flex items-center justify-center gap-2 mt-2 shadow-sm" style={{ backgroundColor: COLORS.plum }}>
                        <Type size={14} /> Р’С‹Р»РѕР¶РёС‚СЊ РЅР° СЃС‚РѕР» (РЎРµРєСЂРµС‚РЅРѕ)
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col mb-4">
                  <input autoFocus type="text" value={noteTitleInput} onChange={e => setNoteTitleInput(e.target.value)} placeholder="РќР°Р·РІР°РЅРёРµ (РЅР°РїСЂ: Р Р°Р±РѕС‚Р° СЃ С‚СЂР°РІРјРѕР№)" className="w-full px-4 py-3 rounded-xl border-2 border-b-0 rounded-b-none outline-none font-bold text-sm shadow-inner" style={{ borderColor: COLORS.haze, color: COLORS.ink }} />
                  
                  <div className="flex gap-2 items-center bg-gray-100 px-3 py-2 border-2 border-b-0 border-t-0 flex-wrap" style={{ borderColor: COLORS.haze }}>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('bold', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="Р–РёСЂРЅС‹Р№"><Bold size={14} strokeWidth={3} /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('italic', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="РљСѓСЂСЃРёРІ"><Italic size={14} /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('underline', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="РџРѕРґС‡РµСЂРєРЅСѓС‚С‹Р№"><Underline size={14} /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('strikeThrough', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="Р—Р°С‡РµСЂРєРЅСѓС‚С‹Р№"><Strikethrough size={14} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertUnorderedList', false, null); }} className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700" title="РЎРїРёСЃРѕРє"><List size={14} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <label className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700 cursor-pointer flex items-center justify-center relative" title="Р’СЃС‚Р°РІРёС‚СЊ РєР°СЂС‚РёРЅРєСѓ">
                      {isUploadingNoteImage ? <Loader2 size={14} className="animate-spin text-plum" /> : <ImageIcon size={14} />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleNoteImageUpload} disabled={isUploadingNoteImage} />
                    </label>
                  </div>
                  
                  <div
                    ref={notebookEditorRef}
                    contentEditable={true}
                    className="rich-text w-full px-4 py-3 rounded-b-xl border-2 outline-none text-sm custom-scrollbar min-h-[200px] shadow-inner leading-relaxed bg-white"
                    style={{ borderColor: COLORS.haze, color: COLORS.ink }}
                    data-placeholder="РўРµРєСЃС‚ С‚РµС…РЅРёРєРё, Р°Р»РіРѕСЂРёС‚Рј РёР»Рё РІРѕРїСЂРѕСЃС‹... Р’С‹РґРµР»РёС‚Рµ С‚РµРєСЃС‚ Рё РёСЃРїРѕР»СЊР·СѓР№С‚Рµ РєРЅРѕРїРєРё СЃРІРµСЂС…Сѓ рџ‘†"
                  />
                  
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => { setIsCreatingNote(false); setEditingNoteId(null); }} className="flex-1 py-3 font-bold rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-xs uppercase tracking-widest text-gray-600">РћС‚РјРµРЅР°</button>
                    <button onClick={async () => {
                      const finalHtml = notebookEditorRef.current ? notebookEditorRef.current.innerHTML : '';
                      if (!noteTitleInput.trim() || !finalHtml.trim()) return notify("Р—Р°РїРѕР»РЅРёС‚Рµ РІСЃРµ РїРѕР»СЏ");
                      try {
                        if (editingNoteId) {
                          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saved_notes', editingNoteId), {
                            title: noteTitleInput.trim(),
                            text: finalHtml.trim()
                          });
                          notify("РўРµС…РЅРёРєР° РѕР±РЅРѕРІР»РµРЅР°!");
                        } else {
                          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_notes'), {
                            title: noteTitleInput.trim(),
                            text: finalHtml.trim(),
                            createdAt: Date.now()
                          });
                          notify("РўРµС…РЅРёРєР° СЃРѕС…СЂР°РЅРµРЅР°!");
                        }
                        setIsCreatingNote(false);
                        setEditingNoteId(null);
                        setNoteTitleInput('');
                      } catch (e) {
                        notify("РћС€РёР±РєР°: " + e.message);
                      }
                    }} className="flex-[2] py-3 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-md transition-all hover:scale-105" style={{ backgroundColor: COLORS.forest }}>РЎРѕС…СЂР°РЅРёС‚СЊ</button>
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
              <input autoFocus defaultValue={customDialog.defaultValue || ''} placeholder={customDialog.placeholder || ''} id="dialog-input" className="w-full px-4 py-3 rounded-xl border-2 mb-6 outline-none font-bold text-center" style={{ borderColor: COLORS.haze }} onKeyDown={(e) => e.key === 'Enter' && (customDialog.onOk(e.target.value), setCustomDialog(null))} />
            )}
            <div className="flex gap-3">
              <button onClick={() => { customDialog.onCancel(); setCustomDialog(null); }} className="flex-1 py-3 font-bold rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">РћС‚РјРµРЅР°</button>
              <button onClick={() => { const val = customDialog.type === 'prompt' ? document.getElementById('dialog-input').value : true; customDialog.onOk(val); setCustomDialog(null); }} className="flex-1 py-3 font-bold rounded-xl text-white transition-colors" style={{ backgroundColor: COLORS.plum }}>РћРє</button>
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
            <h2 className="text-2xl font-black uppercase mb-8 text-center" style={{ color: COLORS.ink }}>РџРѕР»РЅРѕРµ СЂСѓРєРѕРІРѕРґСЃС‚РІРѕ</h2>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-8 shadow-sm">
              <h4 className="font-black text-red-700 text-sm flex items-center gap-2 uppercase tracking-wide"><MonitorPlay size={18}/> Р’Р°Р¶РЅС‹Р№ РїРѕСЂСЏРґРѕРє РґРµР№СЃС‚РІРёР№ (Р Р°Р±РѕС‚Р° СЃ РєР»РёРµРЅС‚РѕРј)</h4>
              <p className="text-sm text-red-800 mt-2 leading-relaxed">
                Р”Р»СЏ СЃС‚Р°Р±РёР»СЊРЅРѕР№ СЂР°Р±РѕС‚С‹ РїР»Р°С‚С„РѕСЂРјС‹ (РЅРµР·Р°РІРёСЃРёРјРѕ РѕС‚ С‚РѕРіРѕ, РёСЃРїРѕР»СЊР·СѓРµС‚Рµ РІС‹ С‚РµР»РµС„РѕРЅ РёР»Рё РџРљ) <b>СЃС‚СЂРѕРіРѕ СЃРѕР±Р»СЋРґР°Р№С‚Рµ СЌС‚РѕС‚ РїРѕСЂСЏРґРѕРє</b>:
              </p>
              <ol className="list-decimal list-inside text-sm text-red-800 mt-2 font-bold space-y-2">
                <li><b>РЎРЅР°С‡Р°Р»Р° РІРєР»СЋС‡РёС‚Рµ РІРёРґРµРѕСЃРІСЏР·СЊ</b> (РєРЅРѕРїРєР° СЃ РєР°РјРµСЂРѕР№).</li>
                <li><b>РўРѕР»СЊРєРѕ РїРѕСЃР»Рµ СЌС‚РѕРіРѕ РєРѕРїРёСЂСѓР№С‚Рµ Рё РѕС‚РїСЂР°РІР»СЏР№С‚Рµ СЃСЃС‹Р»РєСѓ РєР»РёРµРЅС‚Сѓ.</b></li>
                <li>Р•СЃР»Рё РєР»РёРµРЅС‚ Р·Р°С…РѕРґРёС‚ <b>СЃ С‚РµР»РµС„РѕРЅР°</b>, РµРјСѓ РЅСѓР¶РЅРѕ СЃРЅР°С‡Р°Р»Р° СЂР°Р·РІРµСЂРЅСѓС‚СЊ РІРµСЂС…РЅСЋСЋ РїР°РЅРµР»СЊ (РЅР°Р¶Р°РІ РЅР° СЃС‚СЂРµР»РѕС‡РєСѓ <ChevronDown size={14} className="inline text-red-700"/> СЃРїСЂР°РІР° РІРІРµСЂС…Сѓ), Р° Р·Р°С‚РµРј РЅР°Р¶Р°С‚СЊ Р·РµР»РµРЅСѓСЋ РєРЅРѕРїРєСѓ <b>В«РџРѕРґРєР»СЋС‡РёС‚СЊСЃСЏ Рє РІРёРґРµРѕВ»</b>.</li>
              </ol>
              <div className="mt-3 p-2 bg-white/50 rounded-lg text-xs font-bold flex gap-2">
                 <AlertCircle size={16} className="shrink-0 text-red-600" />
                 <span>РҐРѕС‚СЏ РїР»Р°С‚С„РѕСЂРјР° РїРѕРґРґРµСЂР¶РёРІР°РµС‚ СЃРјР°СЂС‚С„РѕРЅС‹, РјС‹ РЅР°СЃС‚РѕСЏС‚РµР»СЊРЅРѕ СЂРµРєРѕРјРµРЅРґСѓРµРј РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РџРљ РёР»Рё РїР»Р°РЅС€РµС‚ РґР»СЏ РєРѕРјС„РѕСЂС‚РЅРѕР№ СЂР°Р±РѕС‚С‹ РїСЃРёС…РѕР»РѕРіР°.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><Users size={16}/> РљР»РёРµРЅС‚ Рё Р”РѕСЃС‚СѓРї</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <p>РќР°Р¶РјРёС‚Рµ <UserPlus size={14} className="inline text-plum"/> <b>В«РЎРЎР«Р›РљРђ Р”Р›РЇ РљР›РР•РќРўРђВ»</b> РЅР° РІРµСЂС…РЅРµР№ РїР°РЅРµР»Рё. РЎСЃС‹Р»РєР° СЃРєРѕРїРёСЂСѓРµС‚СЃСЏ вЂ” РѕС‚РїСЂР°РІСЊС‚Рµ РµС‘ РєР»РёРµРЅС‚Сѓ.</p>
                  <p>РљР»РёРµРЅС‚ РїРµСЂРµС…РѕРґРёС‚ РїРѕ СЃСЃС‹Р»РєРµ, РІРІРѕРґРёС‚ СЃРІРѕС‘ РёРјСЏ Рё РїРѕРїР°РґР°РµС‚ Р·Р° РІР°С€ СЃС‚РѕР». <b>Р РµРіРёСЃС‚СЂР°С†РёСЏ РЅРµ РЅСѓР¶РЅР°.</b></p>
                  <p><b>РџСЂР°РІР° РєР»РёРµРЅС‚Р°:</b> С‚СЏРЅСѓС‚СЊ РєР°СЂС‚С‹ (РµСЃР»Рё РєРѕР»РѕРґР° РѕС‚РєСЂС‹С‚Р°), РґРІРёРіР°С‚СЊ РёС…, РїРёСЃР°С‚СЊ РІ Р¶РµР»С‚С‹С… Р·Р°РјРµС‚РєР°С…, Р±СЂРѕСЃР°С‚СЊ РёРіСЂРѕРІС‹Рµ РєСѓР±РёРєРё.</p>
                  <p className="text-terra"><b>РљР»РёРµРЅС‚ РќР• РјРѕР¶РµС‚:</b> РІРёРґРµС‚СЊ С„РёРѕР»РµС‚РѕРІС‹Рµ Р·Р°РјРµС‚РєРё, РѕС‚РєСЂС‹РІР°С‚СЊ Р±РёР±Р»РёРѕС‚РµРєСѓ Рё РјРµРЅСЏС‚СЊ РєРѕР»РѕРґС‹, СѓРґР°Р»СЏС‚СЊ РІСЃС‘ СЃРѕ СЃС‚РѕР»Р°, РІРёРґРµС‚СЊ Р»Р°Р·РµСЂРЅСѓСЋ СѓРєР°Р·РєСѓ (РµСЃР»Рё РѕРЅР° РІС‹РєР»СЋС‡РµРЅР° Сѓ РјР°СЃС‚РµСЂР°).</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><Users size={16}/> Р“СЂСѓРїРїРѕРІС‹Рµ Рё РўСЂР°РЅСЃС„РѕСЂРјР°С†РёРѕРЅРЅС‹Рµ РёРіСЂС‹</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <p>Р”Р»СЏ РіСЂСѓРїРїРѕРІС‹С… РёРіСЂ РІ РїР»Р°С‚С„РѕСЂРјСѓ РІСЃС‚СЂРѕРµРЅР° СЃРёСЃС‚РµРјР° <b>РїСЂРёРІР°С‚РЅРѕСЃС‚Рё РєР°СЂС‚</b>:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>РљРѕРіРґР° СѓС‡Р°СЃС‚РЅРёРє (РєР»РёРµРЅС‚) РЅР°Р¶РёРјР°РµС‚ <b><Eye size={14} className="inline text-forest" /> РџРѕРґСЃРјРѕС‚СЂРµС‚СЊ</b> РЅР° РЅРёС‡СЊРµР№ Р·Р°РєСЂС‹С‚РѕР№ РєР°СЂС‚Рµ, РѕРЅР° <b>Р·Р°РєСЂРµРїР»СЏРµС‚СЃСЏ Р·Р° РЅРёРј</b>.</li>
                    <li>РџРѕРґ РєР°СЂС‚РѕР№ РїРѕСЏРІР»СЏРµС‚СЃСЏ РµРіРѕ РёРјСЏ (РЅР°РїСЂРёРјРµСЂ, <UserCircle size={12} className="inline" /> РђРЅРЅР°).</li>
                    <li><b>Р’Р°Р¶РЅРѕ:</b> РќРёРєС‚Рѕ РґСЂСѓРіРѕР№ РёР· СѓС‡Р°СЃС‚РЅРёРєРѕРІ Р±РѕР»СЊС€Рµ РЅРµ СЃРјРѕР¶РµС‚ РЅРё РїРѕРґСЃРјРѕС‚СЂРµС‚СЊ, РЅРё РїРµСЂРµРІРµСЂРЅСѓС‚СЊ СЌС‚Сѓ РєР°СЂС‚Сѓ.</li>
                    <li>Р’С‹ (РџСЃРёС…РѕР»РѕРі) РёРјРµРµС‚Рµ РїРѕР»РЅС‹Р№ РєРѕРЅС‚СЂРѕР»СЊ: РІС‹ РІ Р»СЋР±РѕР№ РјРѕРјРµРЅС‚ РјРѕР¶РµС‚Рµ РїРѕРґСЃРјРѕС‚СЂРµС‚СЊ РёР»Рё РїРµСЂРµРІРµСЂРЅСѓС‚СЊ Р»СЋР±СѓСЋ РєР°СЂС‚Сѓ Р»СЋР±РѕРіРѕ СѓС‡Р°СЃС‚РЅРёРєР°, Р° С‚Р°РєР¶Рµ РѕС‚РІСЏР·Р°С‚СЊ РІР»Р°РґРµР»СЊС†Р°.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><LayoutGrid size={16}/> РџР°РЅРµР»СЊ РёРЅСЃС‚СЂСѓРјРµРЅС‚РѕРІ</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <div className="flex items-start gap-2"><Crosshair size={16} className="text-red-500 mt-0.5 shrink-0"/> <div><b>Р›Р°Р·РµСЂРЅР°СЏ СѓРєР°Р·РєР°:</b> РћР±С‹С‡РЅР°СЏ РјС‹С€РєР° СЃРєСЂС‹С‚Р° РѕС‚ РєР»РёРµРЅС‚Р°. РЈРєР°Р·РєР° РІРєР»СЋС‡Р°РµС‚ РєСЂР°СЃРЅСѓСЋ С‚РѕС‡РєСѓ, РєРѕС‚РѕСЂСѓСЋ РІРёРґСЏС‚ РІСЃРµ (СѓРґРѕР±РЅРѕ РїРѕРєР°Р·С‹РІР°С‚СЊ РґРµС‚Р°Р»Рё).</div></div>
                  <div className="flex items-start gap-2"><Camera size={16} className="text-gray-500 mt-0.5 shrink-0"/> <div><b>РЎРєСЂРёРЅС€РѕС‚:</b> Р”РµР»Р°РµС‚ РєР°С‡РµСЃС‚РІРµРЅРЅС‹Р№ СЃРЅРёРјРѕРє РІСЃРµРіРѕ СЂР°Р±РѕС‡РµРіРѕ СЃС‚РѕР»Р° Рё СЃРєР°С‡РёРІР°РµС‚ РЅР° РІР°С€Рµ СѓСЃС‚СЂРѕР№СЃС‚РІРѕ.</div></div>
                  <div className="flex items-start gap-2"><Save size={16} className="text-gray-500 mt-0.5 shrink-0"/> <div><b>РЎРѕС…СЂР°РЅРёС‚СЊ СЃРµСЃСЃРёСЋ:</b> РЎРѕС…СЂР°РЅСЏРµС‚ РІРµСЃСЊ СЂР°СЃРєР»Р°Рґ РІ Р±РёР±Р»РёРѕС‚РµРєСѓ (РІРєР»Р°РґРєР° РЎР•РЎРЎРР), С‡С‚РѕР±С‹ Р·Р°РіСЂСѓР·РёС‚СЊ РµРіРѕ РЅР° СЃР»РµРґСѓСЋС‰РёС… РІСЃС‚СЂРµС‡Р°С….</div></div>
                  <div className="flex items-start gap-2"><LayoutGrid size={16} className="text-forest mt-0.5 shrink-0"/> <div><b>РќР°СЃС‚СЂРѕР№РєРё РџРѕР»СЏ:</b> РР·РјРµРЅРµРЅРёРµ С„РѕРЅР° СЃС‚РѕР»Р° (РЅРµР№СЂРѕ-С‚РµРєСЃС‚СѓСЂС‹) РёР»Рё Р·Р°РіСЂСѓР·РєР° СЃРІРѕРµРіРѕ РёРіСЂРѕРІРѕРіРѕ РїРѕР»СЏ (РєР°СЂС‚РёРЅРєРё, РЅР° РєРѕС‚РѕСЂСѓСЋ РјРѕР¶РЅРѕ РєР»Р°СЃС‚СЊ РєР°СЂС‚С‹).</div></div>
                  <div className="flex items-start gap-2"><Trash2 size={16} className="text-terra mt-0.5 shrink-0"/> <div><b>РћС‡РёСЃС‚РёС‚СЊ СЃС‚РѕР»:</b> РЈРґР°Р»СЏРµС‚ РІСЃРµ РЅРµР·Р°РєСЂРµРїР»РµРЅРЅС‹Рµ РѕР±СЉРµРєС‚С‹. Р’РЅРёР·Сѓ РїРѕСЏРІРёС‚СЃСЏ РєРЅРѕРїРєР° РѕС‚РјРµРЅС‹ (РґРµР№СЃС‚РІСѓРµС‚ 10 СЃРµРєСѓРЅРґ).</div></div>
                  <div className="flex items-start gap-2"><Timer size={16} className="text-plum mt-0.5 shrink-0"/> <div><b>РўР°Р№РјРµСЂ:</b> РЈСЃС‚Р°РЅР°РІР»РёРІР°РµС‚ РѕР±С‰РµРµ РІСЂРµРјСЏ (60/90 РјРёРЅ). РЎРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅ СЃ РєР»РёРµРЅС‚РѕРј.</div></div>
                  <div className="flex items-start gap-2"><Video size={16} className="text-forest mt-0.5 shrink-0"/> <div><b>Р’РёРґРµРѕСЃРІСЏР·СЊ:</b> Р’СЃС‚СЂРѕРµРЅРЅР°СЏ РїСЂСЏРјРѕ РІ РєР°Р±РёРЅРµС‚. РћРєРЅРѕ РІРёРґРµРѕ РјРѕР¶РЅРѕ РїРµСЂРµРјРµС‰Р°С‚СЊ Рё СЂР°СЃС‚СЏРіРёРІР°С‚СЊ.</div></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><Type size={16}/> Р Р°Р±РѕС‚Р° СЃ Р·Р°РјРµС‚РєР°РјРё</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <div className="flex items-start gap-3 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-terra shrink-0"><Type size={16} /></div>
                    <div><b>Р–РµР»С‚Р°СЏ (РћР±С‰Р°СЏ):</b> Р’РёРґСЏС‚ РѕР±Р°. Р РІС‹, Рё РєР»РёРµРЅС‚ РјРѕР¶РµС‚Рµ РїРµС‡Р°С‚Р°С‚СЊ РІ РЅРµР№ С‚РµРєСЃС‚ РѕРґРЅРѕРІСЂРµРјРµРЅРЅРѕ.</div>
                  </div>
                  <div className="flex items-start gap-3 bg-purple-50 p-3 rounded-xl border border-purple-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600 relative shrink-0"><Type size={16} /><EyeOff size={8} className="absolute bottom-1 right-1" /></div>
                    <div><b className="text-purple-900">Р¤РёРѕР»РµС‚РѕРІР°СЏ (РЎРµРєСЂРµС‚РЅР°СЏ):</b> <b>Р’РёРґРёС‚Рµ С‚РѕР»СЊРєРѕ РІС‹</b>. РќР° СЌРєСЂР°РЅРµ РєР»РёРµРЅС‚Р° РµС‘ РЅРµ СЃСѓС‰РµСЃС‚РІСѓРµС‚. РРґРµР°Р»СЊРЅРѕ РґР»СЏ РІР°С€РёС… Р»РёС‡РЅС‹С… СЃРєСЂС‹С‚С‹С… РїРѕРјРµС‚РѕРє.</div>
                  </div>
                  <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 shrink-0"><BookOpen size={16} /></div>
                    <div><b className="text-blue-900">РњРѕРё РўРµС…РЅРёРєРё:</b> Р—Р°РїРёСЃРЅР°СЏ РєРЅРёР¶РєР° РџСЃРёС…РѕР»РѕРіР°. Р—Р°РїРёС€РёС‚Рµ РІ РЅРµС‘ СЃРІРѕРё СЃРєСЂРёРїС‚С‹ РґРѕ СЃРµСЃСЃРёРё. Р’ РѕРґРёРЅ РєР»РёРє С‚РµРєСЃС‚ РёР· РЅРµС‘ РІС‹РєР»Р°РґС‹РІР°РµС‚СЃСЏ РЅР° СЃС‚РѕР» РІ РІРёРґРµ РЎРµРєСЂРµС‚РЅРѕР№ Р·Р°РјРµС‚РєРё!</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><Layers size={16}/> РџР»Р°РІР°СЋС‰РёРµ РїР°РЅРµР»Рё</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-700 shrink-0"><FigureIcon gender="male" color={COLORS.forest} isMenu={true} className="w-[18px] h-[18px] opacity-80" /></div>
                    <div><b className="text-emerald-800">Р¤РёРіСѓСЂРєРё РґР»СЏ СЂР°СЃСЃС‚Р°РЅРѕРІРѕРє:</b> РљРЅРѕРїРєР° СЃ С„РёРіСѓСЂРєРѕР№ РІРІРµСЂС…Сѓ РѕС‚РєСЂС‹РІР°РµС‚ РїР°РЅРµР»СЊ. Р’С‹ РјРѕР¶РµС‚Рµ РІС‹Р±РёСЂР°С‚СЊ С†РІРµС‚, СѓРєР°Р·С‹РІР°С‚СЊ РёРјСЏ, РґРѕР±Р°РІР»СЏС‚СЊ РјСѓР¶СЃРєРёРµ/Р¶РµРЅСЃРєРёРµ С„РёРіСѓСЂРєРё Рё СЃС‚СЂРµР»РєРё. Р•СЃС‚СЊ РїРµСЂРµРєР»СЋС‡Р°С‚РµР»СЊ РІРёРґР° (РЎР±РѕРєСѓ/РЎРІРµСЂС…Сѓ).</div>
                  </div>
                  <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-700 shrink-0"><Dices size={18} /></div>
                    <div><b className="text-blue-800">РРіСЂРѕРІС‹Рµ РєСѓР±РёРєРё Рё С„РёС€РєРё:</b> РљРЅРѕРїРєР° СЃ РєСѓР±РёРєР°РјРё РѕС‚РєСЂС‹РІР°РµС‚ РїР°РЅРµР»СЊ. Р”РѕСЃС‚СѓРїРЅС‹ С†РІРµС‚РЅС‹Рµ РјР°СЂРєРµСЂС‹ Рё РєСѓР±РёРєРё (d6 Рё d10). Р‘СЂРѕСЃР°С‚СЊ РєСѓР±РёРє РјРѕР¶РµС‚ Рё РєР»РёРµРЅС‚.</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><MousePointer2 size={16}/> Р”РµР№СЃС‚РІРёСЏ СЃ РѕР±СЉРµРєС‚Р°РјРё</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2">
                  <p className="mb-2">РќР°РІРµРґРёС‚Рµ РєСѓСЂСЃРѕСЂ РЅР° Р»СЋР±СѓСЋ РєР°СЂС‚Сѓ РёР»Рё С„РёРіСѓСЂРєСѓ РЅР° СЃС‚РѕР»Рµ, С‡С‚РѕР±С‹ РїРѕСЏРІРёР»РѕСЃСЊ РјРµРЅСЋ:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs"><RefreshCw size={14} className="text-gray-500" /> РџРµСЂРµРІРµСЂРЅСѓС‚СЊ (Р»РёС†Рѕ/СЂСѓР±Р°С€РєР°)</div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs"><Eye size={14} className="text-forest" /> РџРѕРґСЃРјРѕС‚СЂРµС‚СЊ (С‚РѕР»СЊРєРѕ РµСЃР»Рё Р·Р°РєСЂС‹С‚Р°)</div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs"><Maximize2 size={14} className="text-gray-500" /> РЈРІРµР»РёС‡РёС‚СЊ РѕР±СЉРµРєС‚</div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs"><RotateCw size={14} className="text-gray-500" /> РџРѕРІРµСЂРЅСѓС‚СЊ</div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs"><ArrowUpToLine size={14} className="text-gray-500" /> РќР° РїРµСЂРµРґРЅРёР№ РїР»Р°РЅ</div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs"><Lock size={14} className="text-gray-500" /> Р—Р°РєСЂРµРїРёС‚СЊ (РѕС‚ СЃРґРІРёРіРѕРІ)</div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs sm:col-span-2"><EyeOff size={14} className="text-gray-500" /> РЈР»РѕР¶РёС‚СЊ/Р Р°Р·Р±СѓРґРёС‚СЊ (СЃРѕРЅ/СЃРјРµСЂС‚СЊ РґР»СЏ С„РёРіСѓСЂ)</div>
                  </div>
                  <p className="mt-3 text-xs bg-gray-50 p-3 rounded-lg flex flex-col gap-2">
                    <span><Move size={14} className="inline text-plum"/> Р§С‚РѕР±С‹ <b>РёР·РјРµРЅРёС‚СЊ СЂР°Р·РјРµСЂ</b>, РїРѕС‚СЏРЅРёС‚Рµ Р·Р° РїСЂР°РІС‹Р№ РЅРёР¶РЅРёР№ СѓРіРѕР».</span>
                    <span><RotateCw size={14} className="inline text-plum"/> Р§С‚РѕР±С‹ <b>СЃРІРѕР±РѕРґРЅРѕ РІСЂР°С‰Р°С‚СЊ С„РёРіСѓСЂРєСѓ</b>, РЅР°РІРµРґРёС‚Рµ РЅР° РЅРµС‘ Рё РЅР°Р¶РјРёС‚Рµ РЅР° РїРѕСЏРІРёРІС€РёР№СЃСЏ <b>РєСЂСѓРі РєРѕРјРїР°СЃР°</b> РІРѕРєСЂСѓРі РЅРµС‘. Р”Р»СЏ РєР°СЂС‚ РёСЃРїРѕР»СЊР·СѓР№С‚Рµ РєРЅРѕРїРєРё Р’Р»РµРІРѕ/Р’РїСЂР°РІРѕ РІ РјРµРЅСЋ.</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-2">
                <h3 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 bg-gray-100 p-2 rounded-lg" style={{ color: COLORS.ink }}><FolderOpen size={16}/> Р‘РёР±Р»РёРѕС‚РµРєР° РњР°СЃС‚РµСЂР°</h3>
                <div className="text-sm text-gray-700 leading-relaxed px-2 space-y-3">
                  <p>Р’С‹Р·С‹РІР°РµС‚СЃСЏ РґР»РёРЅРЅРѕР№ РєРЅРѕРїРєРѕР№ <b>В«Р‘РёР±Р»РёРѕС‚РµРєР° РњР°СЃС‚РµСЂР°В»</b> РІ СЃР°РјРѕРј РЅРёР·Сѓ СЌРєСЂР°РЅР°.</p>
                  <ul className="space-y-1 list-disc list-inside grid grid-cols-1 md:grid-cols-2">
                    <li><b>Р‘РђР—Рђ:</b> РЎС‚Р°РЅРґР°СЂС‚РЅС‹Рµ РєРѕР»РѕРґС‹, РґРѕСЃС‚СѓРїРЅС‹Рµ РІСЃРµРіРґР°.</li>
                    <li><b>РћР‘Р›РђРљРћ:</b> РљРѕР»РѕРґС‹, Р·Р°РіСЂСѓР¶РµРЅРЅС‹Рµ СЂР°Р·СЂР°Р±РѕС‚С‡РёРєРѕРј СЃРїРµС†РёР°Р»СЊРЅРѕ РґР»СЏ РІР°СЃ.</li>
                    <li><b>РњРћР:</b> Р’Р°С€Рµ Р»РёС‡РЅРѕРµ РїСЂРѕСЃС‚СЂР°РЅСЃС‚РІРѕ. РњРѕР¶РЅРѕ РґРѕР±Р°РІРёС‚СЊ РєРѕР»РѕРґС‹ СЃСЃС‹Р»РєРѕР№ СЃ РІР°С€РµРіРѕ Google Р”РёСЃРєР°. Р’РёРґРёС‚Рµ РёС… С‚РѕР»СЊРєРѕ РІС‹.</li>
                    <li><b>РЎР•РЎРЎРР:</b> РЎРѕС…СЂР°РЅРµРЅРЅС‹Рµ СЃС‚РѕР»С‹ (РёСЃС‚РѕСЂРёСЏ СЂР°СЃРєР»Р°РґРѕРІ).</li>
                  </ul>
                  <div className="bg-plum/10 p-3 rounded-lg border border-plum/20 mt-2">
                    <p className="font-bold text-plum mb-1">РљР°Рє РІС‹С‚Р°СЃРєРёРІР°С‚СЊ РєР°СЂС‚С‹?</p>
                    <p className="text-xs">Р’С‹Р±РµСЂРёС‚Рµ РєРѕР»РѕРґСѓ РІ Р»РµРІРѕРј СЃРїРёСЃРєРµ. РќР°Р¶РјРёС‚Рµ <b>В«РќР°СѓРіР°РґВ»</b> (РІС‹С‚Р°С‰РёС‚ СЃР»СѓС‡Р°Р№РЅСѓСЋ СЂСѓР±Р°С€РєРѕР№ РІРІРµСЂС…) РёР»Рё РЅР°Р¶РјРёС‚Рµ РєРЅРѕРїРєСѓ <b>В«РћС‚РєСЂС‹С‚СЊ РєРѕР»РѕРґСѓВ»</b> СЃРїСЂР°РІР° РІРІРµСЂС…Сѓ, С‡С‚РѕР±С‹ СѓРІРёРґРµС‚СЊ РІСЃРµ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ Рё РІС‹Р±СЂР°С‚СЊ РєРѕРЅРєСЂРµС‚РЅСѓСЋ.</p>
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

      {isVideoModalOpen && !isClientMode && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}CC` }}>
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setIsVideoModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors">
              <X size={20} style={{ color: COLORS.ink }} />
            </button>
            <h2 className="text-xl font-black uppercase mb-4 text-center" style={{ color: COLORS.ink }}>Р’РёРґРµРѕСЃРІСЏР·СЊ</h2>
            <p className="text-[10px] text-center mb-6 font-medium leading-relaxed" style={{ color: `${COLORS.ink}99` }}>
              РЎРѕР·РґР°Р№С‚Рµ РїСЂРёРІР°С‚РЅСѓСЋ РєРѕРјРЅР°С‚Сѓ РґР»СЏ РІСЃС‚СЂРѕРµРЅРЅРѕРіРѕ Р·РІРѕРЅРєР°. РћРЅР° РїРѕСЏРІРёС‚СЃСЏ РІ РїР»Р°РІР°СЋС‰РµРј РѕРєРѕС€РєРµ Сѓ РІР°СЃ Рё РєР»РёРµРЅС‚Р°.
            </p>
            <button onClick={async () => {
                setIsVideoModalOpen(false);
                startNativeCall();
                notify("Р’СЃС‚СЂРѕРµРЅРЅР°СЏ РІРёРґРµРѕСЃРІСЏР·СЊ Р·Р°РїСѓС‰РµРЅР°!");
              }}
              className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2" style={{ backgroundColor: COLORS.forest }}>
              <Video size={18} /> Р—Р°РїСѓСЃС‚РёС‚СЊ Р·РІРѕРЅРѕРє
            </button>

            <div className="flex gap-3 mt-3">
              {isVideoCallReady && (
                <button onClick={async () => { endNativeCall(); setIsVideoModalOpen(false); notify("РЎРІСЏР·СЊ СѓРґР°Р»РµРЅР°"); }} className="w-full py-3 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-colors hover:opacity-80" style={{ backgroundColor: `${COLORS.terra}20`, color: COLORS.terra }}>Р—Р°РІРµСЂС€РёС‚СЊ Р·РІРѕРЅРѕРє (РЈРґР°Р»РёС‚СЊ)</button>
              )}
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
            <h2 className="text-xl md:text-2xl font-black uppercase mb-6" style={{ color: COLORS.ink }}>РћС„РѕСЂРјР»РµРЅРёРµ СЃС‚РѕР»Р°</h2>
            <div className="mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50 flex items-center gap-2">
                <LayoutGrid size={14} /> Р¤РѕРЅ РІСЃРµРіРѕ РїСЂРѕСЃС‚СЂР°РЅСЃС‚РІР° (РќРµР№СЂРѕ-РґРёР·Р°Р№РЅ)
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
                    setIsUploadingBg(true); notify("Р—Р°РіСЂСѓР¶Р°СЋ С„РѕРЅ...", 4000);
                    try {
                      const data = await new Promise(r => { const rd = new FileReader(); rd.onload = ev => r(ev.target.result); rd.readAsDataURL(f); });
                      let comp = await compressImage(data, 1920, 1920);
                      const url = await uploadImageToStorage(comp, `backgrounds/${user.uid}/${Date.now()}.jpg`);
                      const customBg = { id: 'custom', name: 'РЎРІРѕР№ С„РѕРЅ', type: 'image', value: url, bgSize: 'cover', bgColor: COLORS.haze, opacity: 1, repeat: 'no-repeat', blendMode: 'normal' };
                      setTableBg(customBg);
                      if (isDbConnected && roomId) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { tableBg: customBg }, { merge: true });
                      notify("Р¤РѕРЅ СѓСЃС‚Р°РЅРѕРІР»РµРЅ! вњ“");
                    } catch(err) { notify("РћС€РёР±РєР°: " + err.message); } finally { setIsUploadingBg(false); e.target.value = ''; }
                  }} />
                  {isUploadingBg ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                  <span className="text-[9px] md:text-[10px] font-black uppercase text-center leading-tight">РЎРІРѕР№<br/>Р¤РѕРЅ</span>
            </label>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50 flex items-center gap-2">
                <ImageIcon size={14} /> РћС‚РґРµР»СЊРЅРѕРµ РёРіСЂРѕРІРѕРµ РїРѕР»Рµ (РљР°Рє РѕР±СЉРµРєС‚)
              </h3>
              <p className="text-[10px] font-medium mb-4 leading-relaxed" style={{ color: COLORS.ink }}>РСЃРїРѕР»СЊР·СѓР№С‚Рµ СЌС‚Рѕ, РµСЃР»Рё РЅСѓР¶РЅРѕ Р·Р°РіСЂСѓР·РёС‚СЊ РєРѕРЅРєСЂРµС‚РЅСѓСЋ РєР°СЂС‚Сѓ РёРіСЂС‹ РєР°Рє РїРµСЂРµРјРµС‰Р°РµРјС‹Р№ РѕР±СЉРµРєС‚ РЅР° СЃС‚РѕР»Рµ (РѕРЅР° СЃРѕС…СЂР°РЅРёС‚ СЃРІРѕРё РїСЂРѕРїРѕСЂС†РёРё Рё РЅР° РЅРµРµ РјРѕР¶РЅРѕ Р±СѓРґРµС‚ РєР»Р°СЃС‚СЊ РєР°СЂС‚С‹).</p>
              <label className="w-full py-4 rounded-2xl cursor-pointer transition-all hover:opacity-80 flex flex-col items-center justify-center gap-2 shadow-md" style={{ backgroundColor: COLORS.forest, color: 'white' }}>
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  setIsFieldModalOpen(false);
                  notify("РЎР¶РёРјР°СЋ РёР·РѕР±СЂР°Р¶РµРЅРёРµ...", 5000);
                  try {
                    const data = await new Promise(r => { const rd = new FileReader(); rd.onload = (ev) => r(ev.target.result); rd.readAsDataURL(f); });
                    let comp = await compressImage(data, 1200, 1200);
                    if (comp.length > 900000) comp = await compressImage(data, 900, 900);
                    if (comp.length > 900000) comp = await compressImage(data, 700, 700);
                    const sizeKB = Math.round(comp.length / 1024);
                    if (comp.length > 900000) return notify(`Р¤Р°Р№Р» СЃР»РёС€РєРѕРј Р±РѕР»СЊС€РѕР№ (${sizeKB}KB). РџРѕРїСЂРѕР±СѓР№С‚Рµ РґСЂСѓРіРѕРµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ.`);
                    notify(`Р Р°Р·РјРµС‰Р°СЋ РїРѕР»Рµ РЅР° СЃС‚РѕР»Рµ (${sizeKB}KB)...`, 4000);
                    await addElement('field', { img: comp });
                    notify("РРіСЂРѕРІРѕРµ РїРѕР»Рµ РїРѕСЏРІРёР»РѕСЃСЊ РЅР° СЃС‚РѕР»Рµ! вњ“");
                  } catch (err) { notify("РћС€РёР±РєР°: " + err.message); } finally { e.target.value = ''; }
                }} />
                <ImageIcon size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Р—Р°РіСЂСѓР·РёС‚СЊ РїРѕР»Рµ РґР»СЏ РёРіСЂС‹</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <header className={`flex flex-col md:flex-row items-center justify-between px-4 md:px-8 bg-white/90 backdrop-blur-md border-b z-30 shadow-sm relative transition-all duration-300 ${isMobileMenuOpen ? 'pb-8 pt-3 gap-2' : 'py-3'}`} style={{ borderColor: `${COLORS.ink}10` }}>
        <div className="flex items-center justify-between w-full md:w-auto">
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
                  РЎР•РЎРЎРРЇ: {roomId} <span className="opacity-50">|</span> Р’Р«: {userName}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-100 shadow-sm transition-all active:scale-95"
            style={{ color: COLORS.plum }}
          >
            {isMobileMenuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        
        <div className={`w-full md:w-auto flex items-center gap-2 flex-wrap justify-center md:justify-end transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0 md:max-h-[800px] md:opacity-100 md:mt-0'}`}>
          <div className="flex bg-black/5 p-1 rounded-2xl shadow-inner border border-ink/5 gap-1 mr-1">
             <button onClick={() => setIsFiguresPanelOpen(!isFiguresPanelOpen)} className={`p-2 rounded-xl transition-all flex items-center justify-center ${isFiguresPanelOpen ? 'bg-white shadow-sm text-plum' : 'hover:bg-white text-ink/70'}`} title="РћС‚РєСЂС‹С‚СЊ С„РёРіСѓСЂРєРё Рё СЃС‚СЂРµР»РєРё">
                <FigureIcon gender="male" color={isFiguresPanelOpen ? COLORS.plum : 'currentColor'} isMenu={true} className="w-[18px] h-[18px] opacity-80" />
             </button>
             <button onClick={() => setIsDicePanelOpen(!isDicePanelOpen)} className={`p-2 rounded-xl transition-all flex items-center justify-center ${isDicePanelOpen ? 'bg-white shadow-sm text-forest' : 'hover:bg-white text-ink/70'}`} title="РћС‚РєСЂС‹С‚СЊ РєСѓР±РёРєРё Рё С„РёС€РєРё">
                <Dices size={18} />
             </button>
          </div>

          {!isClientMode ? (
            <div className="flex items-center gap-1 bg-white/50 p-1 rounded-[1rem] border shadow-sm" style={{ borderColor: `${COLORS.forest}30`, backgroundColor: `${COLORS.forest}10` }}>
              <button onClick={() => { setIsVideoModalOpen(true); }} className="p-2 rounded-xl transition-all hover:bg-white text-forest" title="РќР°СЃС‚СЂРѕРёС‚СЊ РІРёРґРµРѕСЃРІСЏР·СЊ">
                <Video size={16} />
              </button>
           </div>
          ) : (
            isVideoCallReady && (
              <button onClick={joinNativeCall} className="flex items-center gap-2 px-4 py-2.5 rounded-[1rem] text-[10px] font-black text-white shadow-[0_0_15px_rgba(45,74,62,0.4)] transition-all hover:scale-105 uppercase animate-pulse" style={{ backgroundColor: COLORS.forest }}>
                <Video size={14} /> РџРѕРґРєР»СЋС‡РёС‚СЊСЃСЏ Рє РІРёРґРµРѕ
             </button>
            )
          )}

          {timerDisplay ? (
            <div className="flex items-center gap-1.5">
              <div className="px-4 py-2 rounded-2xl font-black text-sm tabular-nums tracking-widest flex items-center gap-2 border transition-all" style={{ backgroundColor: timerIsWarning ? '#FEE2E2' : `${COLORS.plum}12`, color: timerIsWarning ? '#DC2626' : COLORS.plum, borderColor: timerIsWarning ? '#FCA5A5' : `${COLORS.plum}30` }}>
                <Timer size={14} />{timerDisplay}
              </div>
              {!isClientMode && (
                <button onClick={stopTimer} className="p-2 rounded-2xl hover:bg-black/5 transition-colors" style={{ color: COLORS.terra }} title="РћСЃС‚Р°РЅРѕРІРёС‚СЊ С‚Р°Р№РјРµСЂ">
                  <TimerOff size={15} />
                </button>
              )}
            </div>
          ) : (
            !isClientMode && (
              <div className="flex items-center gap-1 bg-white/50 p-1 rounded-2xl border shadow-sm" style={{ borderColor: `${COLORS.plum}30`, backgroundColor: `${COLORS.plum}10` }}>
                <Timer size={14} className="ml-1" style={{ color: COLORS.plum }} />
                <button onClick={() => startTimer(60)} className="px-2 py-1 rounded-xl text-[10px] font-black hover:opacity-70 transition-all" style={{ color: COLORS.plum, backgroundColor: 'white' }} title="РўР°Р№РјРµСЂ 60 РјРёРЅ">60</button>
                <button onClick={() => startTimer(90)} className="px-2 py-1 rounded-xl text-[10px] font-black hover:opacity-70 transition-all" style={{ color: COLORS.plum, backgroundColor: 'white' }} title="РўР°Р№РјРµСЂ 90 РјРёРЅ">90</button>
              </div>
            )
          )}
          
          <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 rounded-[1rem] transition-all hover:bg-black/5" style={{ color: COLORS.ink }}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          
          {!isClientMode && (
            <button onClick={shareLinkToClient} className="px-3 md:px-4 py-2.5 rounded-[1rem] text-[10px] font-black border flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-105 min-w-[40px]" style={{ backgroundColor: copyFeedback ? COLORS.forest : 'white', borderColor: copyFeedback ? COLORS.forest : `${COLORS.plum}30`, color: copyFeedback ? 'white' : COLORS.plum }} title="РџРѕРґРµР»РёС‚СЊСЃСЏ СЃСЃС‹Р»РєРѕР№ СЃ РєР»РёРµРЅС‚РѕРј">
              {copyFeedback ? <CheckCircle size={14} /> : <UserPlus size={14} />}
              <span className="ml-1 text-[9px] md:text-[10px] whitespace-nowrap">{copyFeedback ? "РЎРљРћРџРР РћР’РђРќРћ" : "РЎРЎР«Р›РљРђ"}</span>
            </button>
          )}

          {!isClientMode && (
            <div className="flex bg-black/5 p-1 rounded-[1rem] gap-1 shadow-inner border border-ink/5">
              <button onClick={() => setIsLaserMode(!isLaserMode)} className={`p-2 rounded-xl transition-all ${isLaserMode ? 'bg-white shadow-sm text-red-500' : 'hover:bg-white text-ink/70'}`} title={isLaserMode ? "РћС‚РєР»СЋС‡РёС‚СЊ СѓРєР°Р·РєСѓ" : "Р›Р°Р·РµСЂРЅР°СЏ СѓРєР°Р·РєР° (РєР»РёРµРЅС‚ РІРёРґРёС‚ С‚РѕС‡РєСѓ)"}>
                <Crosshair size={16} />
              </button>
              <button onClick={takeScreenshot} className="p-2 rounded-xl transition-all hover:bg-white text-ink/70" title="РЎРєСЂРёРЅС€РѕС‚ СЃС‚РѕР»Р°">
                <Camera size={16} />
              </button>
              <button onClick={saveCurrentSession} className="p-2 rounded-xl transition-all hover:bg-white text-ink/70" title="РЎРѕС…СЂР°РЅРёС‚СЊ СЃРµСЃСЃРёСЋ">
                <Save size={16} />
              </button>
            </div>
          )}
          
          {!isClientMode && (
            <>
              <button onClick={() => setIsNotebookOpen(true)} className="relative p-2.5 rounded-[1rem] transition-all hover:scale-105 shadow-sm border" style={{ backgroundColor: '#E0F2FE', color: '#2563EB', borderColor: '#BFDBFE' }} title="РњРѕРё РўРµС…РЅРёРєРё (Р—Р°РїРёСЃРЅР°СЏ РєРЅРёР¶РєР°)">
                <BookOpen size={18} />
              </button>
              <button onClick={() => addElement('private-text', { text: "" })} className="relative p-2.5 rounded-[1rem] transition-all hover:scale-105 shadow-sm border" style={{ backgroundColor: '#F3E8FF', color: '#9333EA', borderColor: '#D8B4FE' }} title="РЎРєСЂС‹С‚Р°СЏ Р·Р°РјРµС‚РєР° (РЅРµ РІРёРґРЅР° РєР»РёРµРЅС‚Сѓ)">
                <Type size={18} />
                <EyeOff size={10} className="absolute bottom-1 right-1 opacity-70" />
              </button>
              <button onClick={() => addElement('text', { text: "" })} className="p-2.5 rounded-[1rem] transition-all hover:scale-105 shadow-sm border" style={{ backgroundColor: '#FFF9C4', color: COLORS.terra, borderColor: '#FDE047' }} title="Р”РѕР±Р°РІРёС‚СЊ РїСѓР±Р»РёС‡РЅСѓСЋ Р·Р°РјРµС‚РєСѓ">
                <Type size={18} />
              </button>
              <button onClick={() => setIsFieldModalOpen(true)} className="px-3 py-2.5 rounded-[1rem] border transition-all hover:bg-black/5 hover:scale-105 flex items-center gap-2" style={{ backgroundColor: 'white', color: COLORS.forest, borderColor: `${COLORS.forest}20` }} title="РќР°СЃС‚СЂРѕР№РєРё СЃС‚РѕР»Р° Рё РїРѕР»СЏ">
                <LayoutGrid size={14} />
                <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">РџРћР›Р•</span>
              </button>
              <button onClick={clearTable} className="p-2.5 rounded-[1rem] transition-all hover:bg-black/5" style={{ color: COLORS.terra }} title="РћС‡РёСЃС‚РёС‚СЊ СЃС‚РѕР»">
                <Trash2 size={18} />
              </button>
            </>
          )}

          <button onClick={() => setIsHelpOpen(true)} className="px-3 py-2.5 rounded-[1rem] border transition-all hover:bg-black/5 hover:scale-105 flex items-center gap-2 shadow-sm" style={{ backgroundColor: 'white', color: COLORS.plum, borderColor: `${COLORS.plum}30` }} title="РРЅСЃС‚СЂСѓРєС†РёСЏ">
            <HelpCircle size={14} />
            <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">РРќРЎРўР РЈРљР¦РРЇ</span>
          </button>

          <button onClick={() => window.location.reload()} className="p-2.5 rounded-[1rem] transition-all hover:bg-black/5" style={{ color: `${COLORS.ink}80` }} title="Р’С‹Р№С‚Рё">
            <LogOut size={18} />
          </button>
        </div>

        <div 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-white border border-t-0 rounded-b-lg flex items-center justify-center cursor-pointer shadow-sm md:hidden z-40 hover:bg-gray-50"
          style={{ borderColor: `${COLORS.ink}10` }}
        >
          <div className="w-5 h-1 rounded-full bg-gray-300" />
        </div>
      </header>

      <main className="flex-1 relative flex flex-col overflow-hidden pt-28 md:pt-24">
        
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
              {[6, 10, 12].map(type => (
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
            ) : diceType === 10 ? (
              <div className={`w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-md flex items-center justify-center border transition-all ${isAnimatingD10 ? 'animate-bounce scale-110' : ''}`} style={{ borderColor: `${COLORS.forest}30` }}>
                <span className="font-black text-2xl md:text-3xl" style={{ color: COLORS.forest }}>{visualDiceD10}</span>
              </div>
            ) : (
              <div className={`w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-md flex items-center justify-center border transition-all ${isAnimatingD12 ? 'animate-bounce scale-110' : ''}`} style={{ borderColor: `${COLORS.terra}30` }}>
                <span className="font-black text-2xl md:text-3xl" style={{ color: COLORS.terra }}>{visualDiceD12}</span>
              </div>
            )}
            <button onClick={async () => {
              if (diceType === 6) {
                if (isAnimating) return;
                const array = new Uint32Array(1);
                window.crypto.getRandomValues(array);
                const v = (array[0] % 6) + 1;
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_dice_state'), { value: v, timestamp: Date.now() });
              } else if (diceType === 10) {
                if (isAnimatingD10) return;
                const array = new Uint32Array(1);
                window.crypto.getRandomValues(array);
                const v = (array[0] % 10) + 1;
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_dice_d10_state'), { value: v, timestamp: Date.now() });
              } else if (diceType === 12) {
                if (isAnimatingD12) return;
                const array = new Uint32Array(1);
                window.crypto.getRandomValues(array);
                const v = (array[0] % 12) + 1;
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_dice_d12_state'), { value: v, timestamp: Date.now() });
              }
            }} disabled={diceType === 6 ? isAnimating : diceType === 10 ? isAnimatingD10 : isAnimatingD12} style={{ backgroundColor: COLORS.forest, color: 'white', border: 'none' }} className="w-full py-2 rounded-xl text-[10px] font-black uppercase shadow-md hover:scale-105 transition-all disabled:opacity-50">
              Р‘СЂРѕСЃРёС‚СЊ
            </button>
          </div>
        )}

        {isFiguresPanelOpen && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-4 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl md:rounded-full shadow-[0_10px_40px_rgb(0,0,0,0.15)] border border-white transition-all pointer-events-auto w-[95%] md:w-max" style={{ animation: 'popup 0.2s ease-out' }}>
            
            <div className="flex bg-[#F3F4F6] p-1 rounded-full">
              <button onClick={() => updateGlobalFigureView('side')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${figureViewMode === 'side' ? 'bg-white shadow-sm text-plum' : 'text-gray-500'}`}>РЎР±РѕРєСѓ</button>
              <button onClick={() => updateGlobalFigureView('top')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${figureViewMode === 'top' ? 'bg-white shadow-sm text-plum' : 'text-gray-500'}`}>РЎРІРµСЂС…Сѓ</button>
            </div>

            <div className="w-[1px] h-6 bg-gray-200 hidden md:block"></div>

            <input type="text" value={figureName} onChange={e => setFigureName(e.target.value)} placeholder="РРјСЏ" maxLength={12} className="w-20 md:w-24 px-3 py-1.5 rounded-full border-2 text-[10px] font-bold outline-none text-center transition-colors focus:border-plum/30" style={{ borderColor: '#F3F4F6', color: COLORS.ink }} />

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
                <span className="text-[10px] font-black uppercase text-gray-600 hidden lg:block">РњСѓР¶</span>
              </button>
              <button onClick={() => { addElement('figure', { gender: 'female', color: figureColor, name: figureName }); setFigureName(''); }} className="px-4 py-2 bg-white rounded-full border border-gray-100 hover:border-plum/30 flex items-center gap-2 transition-all shadow-sm hover:scale-105">
                <FigureIcon gender="female" color={figureColor} isMenu={true} className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase text-gray-600 hidden lg:block">Р–РµРЅ</span>
              </button>
              <button onClick={() => addElement('arrow', { color: figureColor })} className="px-4 py-2 bg-white rounded-full border border-gray-100 hover:border-plum/30 flex items-center gap-2 transition-all shadow-sm hover:scale-105">
                <ArrowElementIcon color={figureColor} className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase text-gray-600 hidden lg:block">РЎС‚СЂРµР»РєР°</span>
              </button>
            </div>

            <button onClick={() => setIsFiguresPanelOpen(false)} className="ml-1 p-2 text-gray-400 hover:text-terra hover:bg-gray-100 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        <div ref={scrollContainerRef} className="absolute inset-0 overflow-auto custom-scrollbar transition-colors duration-500" style={{ backgroundColor: tableBg.bgColor }}>
          <div ref={boardRef} className="relative min-w-[3000px] min-h-[3000px] bg-transparent" onMouseMove={handleMouseMove} onTouchMove={handleMouseMove}>
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-500" style={{ backgroundColor: tableBg.blendMode ? tableBg.bgColor : 'transparent', backgroundImage: tableBg.value === 'none' ? 'none' : (tableBg.type === 'css' ? tableBg.value : `url('${tableBg.value}')`), backgroundSize: tableBg.bgSize, backgroundPosition: 'center', backgroundRepeat: tableBg.repeat || 'repeat', backgroundBlendMode: tableBg.blendMode || 'normal', opacity: tableBg.opacity }}></div>
            
            {cardsOnTable
              .filter(elem => !undoStack?.cards.some(c => c.id === elem.id))
              .filter(elem => !(isClientMode && elem.type === 'private-text'))
              .map((elem) => (
                <DraggableElement key={elem.id} element={elem} globalFigureView={figureViewMode} isClientMode={isClientMode} isMuted={isMuted} isLaserMode={isLaserMode} playSound={playSound} maxZIndex={Math.max(0, ...cardsOnTable.map(c => c.zIndex || 0))} onUpdate={(d) => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, elem.id), d)} onRemove={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, elem.id))} onPreview={() => elem.type === 'card' && setPreviewCard(elem)} currentUser={user} currentUserName={userName} onNotify={notify} boardRef={boardRef} />
              ))}
            
            {Object.entries(cursors).map(([id, cur]) => {
              const isMasterCursor = cur.name?.includes('(РњР°СЃС‚РµСЂ)');
              if (isClientMode && isMasterCursor && !cur.isLaser) return null;
              if (cur.isLaser) {
                return (
                  <div key={id} className="absolute pointer-events-none z-[2000] transition-all duration-150 ease-out" style={{ left: cur.x, top: cur.y, transform: 'translate(-50%, -50%)' }}>
                    <div className="w-4 h-4 rounded-full bg-red-500/80 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] border-2 border-white/50" />
                    <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded shadow-md bg-red-500/80 whitespace-nowrap">{cur.name || 'Р“РѕСЃС‚СЊ'}</span>
                  </div>
                );
              }
              return (
                <div key={id} className="absolute pointer-events-none z-[2000] flex flex-col items-center transition-all duration-150 ease-out" style={{ left: cur.x, top: cur.y }}>
                  <MousePointer2 size={24} fill={cur.color} color="white" strokeWidth={2} className="drop-shadow-md -rotate-12 transform -translate-x-2 -translate-y-2" />
                  <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded mt-1 shadow-md" style={{ backgroundColor: cur.color }}>{cur.name || 'Р“РѕСЃС‚СЊ'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {undoStack && (
          <div className="fixed z-[110] flex items-center gap-3 px-5 py-3 rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.2)] border" style={{ bottom: isLibraryOpen ? '320px' : '80px', left: '50%', transform: 'translateX(-50%)', backgroundColor: COLORS.ink, borderColor: `${COLORS.terra}40`, transition: 'bottom 0.4s ease' }}>
            <Undo2 size={16} color={COLORS.terra} />
            <span className="text-white text-sm font-bold whitespace-nowrap">{undoStack.cards.length} {undoStack.cards.length === 1 ? 'РѕР±СЉРµРєС‚' : 'РѕР±СЉРµРєС‚РѕРІ'} СѓРґР°Р»РµРЅРѕ</span>
            <button onClick={undoClear} className="px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-all" style={{ backgroundColor: COLORS.plum, color: 'white' }}>РћРўРњР•РќРђ</button>
            <UndoTimer expiresAt={undoStack.expiresAt} />
          </div>
        )}

        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-700 pointer-events-none ${isLibraryOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}`}>
          <div className={`bg-white/90 backdrop-blur-2xl rounded-t-[3rem] shadow-[0_-10px_50px_rgba(0,0,0,0.1)] border-t border-white flex flex-col transition-all duration-500 pointer-events-auto ${isLibraryFullscreen ? 'h-[95vh]' : 'h-[75vh] md:h-80'}`}>
            
            <div className="relative w-full flex justify-center py-2 h-12">
              <button onClick={toggleLibrary} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition-colors rounded-t-[3rem]">
                <div className="w-12 h-1.5 bg-ink/10 rounded-full mb-1"></div>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none text-plum flex items-center gap-2">
                  <Layers size={14} /> {isClientMode ? "Р’С‹Р±РѕСЂ РєР°СЂС‚С‹" : "Р‘РёР±Р»РёРѕС‚РµРєР° РњР°СЃС‚РµСЂР°"}
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
                    <button onClick={() => setActiveTab('platform')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeTab === 'platform' ? 'bg-white shadow-sm text-plum' : 'hover:opacity-70 text-ink/60'}`}>Р‘РђР—Рђ</button>
                    <button onClick={() => setActiveTab('cloud')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeTab === 'cloud' ? 'bg-white shadow-sm text-plum' : 'hover:opacity-70 text-ink/60'}`}>РћР‘Р›РђРљРћ</button>
                    <button onClick={() => setActiveTab('local')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeTab === 'local' ? 'bg-white shadow-sm text-plum' : 'hover:opacity-70 text-ink/60'}`}>РњРћР</button>
                    <button onClick={() => setActiveTab('sessions')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeTab === 'sessions' ? 'bg-white shadow-sm text-forest' : 'hover:opacity-70 text-ink/60'}`}>РЎР•РЎРЎРР</button>
                  </div>

                  {activeTab === 'sessions' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <div className="text-[10px] font-bold text-center mb-2" style={{ color: COLORS.ink }}>РЎРћРҐР РђРќР•РќРќР«Р• Р РђРЎРЎРўРђРќРћР’РљР</div>
                      {savedSessions.length === 0 && <div className="text-[9px] text-center opacity-50">РќРµС‚ СЃРѕС…СЂР°РЅРµРЅРЅС‹С… СЃРµСЃСЃРёР№</div>}
                      {savedSessions.map(session => (
                        <div key={session.id} className="group flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:bg-black/5 transition-colors">
                           <div>
                              <div className="text-[10px] font-bold" style={{ color: COLORS.ink }}>{session.name}</div>
                              <div className="text-[8px] text-gray-500">{new Date(session.createdAt).toLocaleDateString()}</div>
                           </div>
                           <div className="flex gap-1">
                              <button onClick={() => loadSavedSession(session)} className="p-2 text-forest hover:bg-forest/10 rounded-lg transition-colors" title="Р—Р°РіСЂСѓР·РёС‚СЊ РЅР° СЃС‚РѕР»"><UploadCloud size={14}/></button>
                              <button onClick={async () => {
                                const ok = await askConfirm('РЈРґР°Р»РёС‚СЊ СЌС‚Сѓ СЃРµСЃСЃРёСЋ РЅР°РІСЃРµРіРґР°?');
                                if(ok) await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saved_sessions', session.id));
                              }} className="p-2 text-terra hover:bg-terra/10 rounded-lg transition-colors" title="РЈРґР°Р»РёС‚СЊ СЃРµСЃСЃРёСЋ"><Trash2 size={14}/></button>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeTab === 'local' && (
                    <div className="flex flex-col gap-3 flex-shrink-0">
                      <div className="rounded-2xl p-3 text-[9px] leading-relaxed" style={{ backgroundColor: `${COLORS.forest}12`, color: COLORS.forest, border: `1px solid ${COLORS.forest}25` }}>
                        <div className="font-black uppercase tracking-widest mb-2 flex items-center gap-1"><FolderOpen size={11} /> РљР°Рє РґРѕР±Р°РІРёС‚СЊ РєРѕР»РѕРґСѓ СЃ Google Р”РёСЃРєР°:</div>
                        <div className="space-y-1 font-medium" style={{ color: `${COLORS.ink}99` }}>
                          <div>1. РћС‚РєСЂРѕР№С‚Рµ РїР°РїРєСѓ СЃ РєР°СЂС‚Р°РјРё РЅР° Google Р”РёСЃРєРµ</div>
                          <div>2. РџСЂР°РІР°СЏ РєРЅРѕРїРєР° в†’ <b>"РџРѕРґРµР»РёС‚СЊСЃСЏ"</b></div>
                          <div>3. Р’ СЂР°Р·РґРµР»Рµ РґРѕСЃС‚СѓРїР° РІС‹Р±РµСЂРёС‚Рµ <b>"Р’СЃРµ, Сѓ РєРѕРіРѕ РµСЃС‚СЊ СЃСЃС‹Р»РєР°"</b></div>
                          <div>4. РќР°Р¶РјРёС‚Рµ <b>"РљРѕРїРёСЂРѕРІР°С‚СЊ СЃСЃС‹Р»РєСѓ"</b> Рё РІСЃС‚Р°РІСЊС‚Рµ РЅРёР¶Рµ</div>
                          <div>5. <b>Важно:</b> "1-1" станет рубашкой карты "1", "2-1" - карты "2". Файл с "коробк" будет картинкой коробки колоды.</div>
                        </div>
                      </div>
                      <button onClick={addDeckByLinks} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black transition-all uppercase hover:opacity-80 shadow-sm" style={{ backgroundColor: COLORS.forest, color: 'white', border: 'none' }}>
                        <LinkIcon size={16} /> Р’СЃС‚Р°РІРёС‚СЊ СЃСЃС‹Р»РєСѓ РЅР° РїР°РїРєСѓ
                      </button>
                    </div>
                  )}

                  {activeTab === 'platform' && isPlatformDecksLoading && <div className="flex justify-center py-4 flex-shrink-0"><Loader2 size={20} className="animate-spin" style={{ color: COLORS.plum }} /></div>}
                  {activeTab === 'cloud' && isBaseDecksLoading && <div className="flex justify-center py-4 flex-shrink-0"><Loader2 size={20} className="animate-spin" style={{ color: COLORS.plum }} /></div>}
                  
                  {activeTab !== 'sessions' && (activeTab === 'platform' ? platformDecks : activeTab === 'local' ? localDecks : [...baseDecks, ...cloudDecks]).map(item => (
                    <div key={item.id} className={`group flex items-center gap-3 p-3 rounded-2xl transition-all relative border flex-shrink-0 ${selectedDeckId === item.id ? 'bg-white shadow-sm border-white' : 'border-transparent hover:bg-black/5'}`}>
                      <button onClick={() => selectDeck(item)} className="flex-1 flex items-center gap-3 text-left overflow-hidden hover:opacity-70">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden border flex-shrink-0 shadow-sm" style={{ borderColor: `${COLORS.ink}10` }}>
                          {(item.boxImage || item.backImage) ? <img src={item.boxImage || item.backImage} className="w-full h-full object-contain" alt="" /> : <FolderOpen size={16} color={`${COLORS.ink}4D`} />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[10px] font-bold truncate uppercase" style={{ color: COLORS.ink }}>{item.name}</span>
                          {item.isPlatformDeck && <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: COLORS.forest }}>РџР»Р°С‚С„РѕСЂРјР°</span>}
                          {item.isBaseDeck && <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: `${COLORS.ink}50` }}>Google Drive</span>}
                        </div>
                      </button>
                      {!item.isBaseDeck && !item.isPlatformDeck && (
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                          <button onClick={async () => {
                            const newName = await askPrompt("РќРѕРІРѕРµ РёРјСЏ РєРѕР»РѕРґС‹:", item.name);
                            if (!newName || !newName.trim()) return;
                            const trimmed = newName.trim();
                            if (activeTab === 'local') {
                              setLocalDecks(p => p.map(d => d.id === item.id ? { ...d, name: trimmed } : d));
                              notify("РРјСЏ РѕР±РЅРѕРІР»РµРЅРѕ вњ“");
                            } else {
                              try {
                                await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saved_decks', item.id), { name: trimmed });
                                notify("РРјСЏ РѕР±РЅРѕРІР»РµРЅРѕ вњ“");
                              } catch (e) {
                                notify("РћС€РёР±РєР°: " + e.message);
                              }
                            }
                          }} className="p-2 rounded-xl transition-colors hover:bg-black/5" style={{ color: COLORS.plum }} title="РџРµСЂРµРёРјРµРЅРѕРІР°С‚СЊ">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={async () => {
                            const ok = await askConfirm("РЈРґР°Р»РёС‚СЊ РєРѕР»РѕРґСѓ?");
                            if (ok) {
                              if (activeTab === 'local') setLocalDecks(p => p.filter(d => d.id !== item.id));
                              else await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saved_decks', item.id));
                              notify("РЈРґР°Р»РµРЅРѕ");
                            }
                          }} className="p-2 rounded-xl transition-colors hover:bg-black/5" style={{ color: COLORS.terra }} title="РЈРґР°Р»РёС‚СЊ">
                            <Trash2 size={16} />
                          </button>
                        </div>
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
                          {isLibraryDeckFlipped ? "РЎРєСЂС‹С‚СЊ РєР°СЂС‚С‹" : "РћС‚РєСЂС‹С‚СЊ РєРѕР»РѕРґСѓ"}
                        </button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex gap-4 content-start flex-wrap pb-8 pr-2">
                      <button onClick={() => {
                        const availableCards = activeDeckData.cards.filter(img => !usedImages.has(img));
                        if (availableCards.length === 0) return notify("Р’ РєРѕР»РѕРґРµ Р±РѕР»СЊС€Рµ РЅРµС‚ СЃРІРѕР±РѕРґРЅС‹С… РєР°СЂС‚!");
                        
                        const array = new Uint32Array(1);
                        window.crypto.getRandomValues(array);
                        const randomIndex = array[0] % availableCards.length;
                        const randomCard = availableCards[randomIndex];
                        addElement('card', { img: randomCard, backImg: getDeckCardBackImage(activeDeckData, randomCard) });
                        if (isLibraryFullscreen) toggleLibrary();
                      }} className="flex-shrink-0 w-24 h-36 md:w-28 md:h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all shadow-sm" style={{ borderColor: `${COLORS.plum}4D`, backgroundColor: `${COLORS.plum}10`, color: COLORS.plum }}>
                        <Plus size={28} /><span className="text-[9px] font-black uppercase">РќР°СѓРіР°Рґ</span>
                      </button>
                      
                      {activeDeckData.cards.map((img, idx) => {
                        const isUsed = usedImages.has(img);
                        const cardBackImage = getDeckCardBackImage(activeDeckData, img, idx);
                        return (
                          <button key={idx} onClick={() => {
                            if (isUsed) return notify("Р­С‚Р° РєР°СЂС‚Р° СѓР¶Рµ Р»РµР¶РёС‚ РЅР° СЃС‚РѕР»Рµ!");
                            addElement('card', { img, backImg: cardBackImage });
                            if (isLibraryFullscreen) toggleLibrary();
                          }} className={`relative flex-shrink-0 h-36 md:h-40 rounded-2xl group transition-all flex items-center justify-center ${isUsed ? 'opacity-40 cursor-not-allowed grayscale' : 'shadow-sm hover:shadow-lg hover:scale-105'}`}>
                            {isLibraryDeckFlipped
                              ? <img src={img} className="h-full w-auto min-w-[5rem] md:min-w-[6rem] object-contain rounded-2xl bg-white shadow-sm" alt={`РљР°СЂС‚Р° ${idx + 1}`} />
                              : <div className="h-full w-24 md:w-28 flex items-center justify-center rounded-2xl overflow-hidden relative shadow-sm border border-white/20" style={{ backgroundImage: `linear-gradient(to bottom right, ${COLORS.forest}, ${COLORS.ink})` }}>
                                {cardBackImage ? <img src={cardBackImage} className="w-full h-full object-cover absolute inset-0 pointer-events-none" alt="Р СѓР±Р°С€РєР°" /> : <Layers size={40} className="text-white opacity-30" />}
                              </div>}
                            <div className="absolute top-2 left-2 text-white text-[10px] font-black px-2 py-0.5 rounded-md z-10 pointer-events-none backdrop-blur-md bg-black/40 border border-white/20 shadow-sm">{idx + 1}</div>
                            {isUsed && (
                              <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center pointer-events-none">
                                <CheckCircle size={32} className="text-white drop-shadow-md" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center font-bold uppercase tracking-widest leading-none text-center px-4" style={{ color: `${COLORS.ink}33` }}>
                    {isClientMode ? "РњР°СЃС‚РµСЂ РµС‰Рµ РЅРµ РІС‹Р±СЂР°Р» РєРѕР»РѕРґСѓ" : "Р’С‹Р±РµСЂРёС‚Рµ РєРѕР»РѕРґСѓ СЃР»РµРІР°"}
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
            <h3 className="text-xl font-black mb-2 uppercase italic" style={{ color: COLORS.ink }}>РРњРЇ РљРћР›РћР”Р«</h3>
            <p className="text-[10px] mb-6 font-medium" style={{ color: `${COLORS.ink}66` }}>Выбрано файлов: {pendingFiles.length}. "1-1" станет рубашкой карты "1"; файл с "рубашка" останется общей обложкой.</p>
            <input autoFocus value={tempDeckName} onChange={e => setTempDeckName(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmUpload()} placeholder="РќР°РїСЂ: Р­РјРѕС†РёРё" className="w-full px-6 py-4 rounded-2xl border-2 mb-8 outline-none font-bold text-base" style={{ borderColor: COLORS.haze, color: COLORS.ink }} />
            {isUploading && (
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold mb-2" style={{ color: `${COLORS.ink}66` }}>
                  <span>Р—Р°РіСЂСѓР·РєР° РІ РѕР±Р»Р°РєРѕ...</span><span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${COLORS.ink}10` }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%`, backgroundColor: COLORS.plum }} />
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <button onClick={() => { setIsNamingDeck(false); setPendingFiles([]); }} disabled={isUploading} className="flex-1 font-bold uppercase text-xs hover:opacity-70 transition-colors disabled:opacity-30" style={{ color: `${COLORS.ink}66` }}>РћС‚РјРµРЅР°</button>
              <button onClick={confirmUpload} disabled={isUploading} style={{ backgroundColor: COLORS.plum, color: 'white', border: 'none' }} className="flex-[2] py-4 rounded-2xl font-black shadow-lg uppercase text-xs disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2">
                {isUploading ? <><Loader2 size={14} className="animate-spin" /> Р—Р°РіСЂСѓР·РєР° {uploadProgress}%</> : "Р“РѕС‚РѕРІРѕ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewCard && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}F2` }} onClick={() => setPreviewCard(null)}>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white font-black tracking-widest uppercase bg-black/50 px-6 py-2 rounded-full backdrop-blur-md text-xs text-center w-[90%] md:w-auto">
            {previewCard.isFlipped ? "Р­С‚Сѓ РєР°СЂС‚Сѓ СЃРµР№С‡Р°СЃ РІРёРґРёС‚Рµ С‚РѕР»СЊРєРѕ РІС‹" : "Р­С‚Р° РєР°СЂС‚Р° РѕС‚РєСЂС‹С‚Р° РґР»СЏ РІСЃРµС…"}
          </div>
          <button className="absolute top-6 right-6 text-white p-2 rounded-full transition-all hover:opacity-70" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <X size={40} />
          </button>
          <img src={previewCard.img} className="max-h-[85vh] max-w-[90vw] h-auto w-auto rounded-2xl shadow-2xl bg-white object-contain" style={{ animation: 'scaleIn 0.2s ease-out' }} alt="РљР°СЂС‚Р°" />
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
          title="РќР°Р¶РјРёС‚Рµ РЅР° РєСЂСѓРі, С‡С‚РѕР±С‹ РїРѕРІРµСЂРЅСѓС‚СЊ"
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
          {!isField && <button onClick={(e) => { e.stopPropagation(); onUpdate({ zIndex: maxZIndex + 1 }); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-black/5 text-ink/70" title="РќР° РїРµСЂРµРґРЅРёР№ РїР»Р°РЅ"><ArrowUpToLine size={16} /></button>}
          
          {element.type === 'figure' && (
            <button onClick={(e) => { e.stopPropagation(); onUpdate({ isLaying: !element.isLaying }); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-black/5 text-ink/70" title={element.isLaying ? "РћС‚РєСЂС‹С‚СЊ РіР»Р°Р·Р° / РџРѕРґРЅСЏС‚СЊ С„РёРіСѓСЂРєСѓ" : "Р—Р°РєСЂС‹С‚СЊ РіР»Р°Р·Р° (СЃРѕРЅ/СЃРјРµСЂС‚СЊ)"}>
              {element.isLaying ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          )}

          {element.type === 'figure' && (
            <button onClick={(e) => { e.stopPropagation(); onUpdate({ isFallen: !element.isFallen }); }} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 ${element.isFallen ? 'bg-terra/10 text-terra' : 'hover:bg-black/5 text-ink/70'}`} title={element.isFallen ? "РџРѕРґРЅСЏС‚СЊ С„РёРіСѓСЂРєСѓ" : "РЈСЂРѕРЅРёС‚СЊ РЅР° РїРѕР»"}>
              <UserMinus size={16} />
            </button>
          )}

          {element.type === 'card' && element.isFlipped && (
            <button onClick={(e) => {
              e.stopPropagation();
              if (!element.owner) {
                if (isClientMode) {
                   onUpdate({ owner: currentUser?.uid, ownerName: currentUserName || 'РРіСЂРѕРє' });
                   onNotify("РљР°СЂС‚Р° Р·Р°РєСЂРµРїР»РµРЅР° Р·Р° РІР°РјРё. РўРѕР»СЊРєРѕ РІС‹ Рё РџСЃРёС…РѕР»РѕРі РјРѕР¶РµС‚Рµ РµС‘ РІРёРґРµС‚СЊ Рё РїРµСЂРµРІРѕСЂР°С‡РёРІР°С‚СЊ.");
                }
                onPreview();
              } else if (element.owner === currentUser?.uid || !isClientMode) {
                onPreview();
              } else {
                onNotify(`Р­С‚Р° РєР°СЂС‚Р° РїСЂРёРЅР°РґР»РµР¶РёС‚: ${element.ownerName}. РџРѕРґСЃРјР°С‚СЂРёРІР°С‚СЊ РЅРµР»СЊР·СЏ! рџ¤«`);
              }
            }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 bg-forest/10 text-forest" title={!element.owner ? "Р’Р·СЏС‚СЊ СЃРµР±Рµ Рё РїРѕРґСЃРјРѕС‚СЂРµС‚СЊ" : (element.owner === currentUser?.uid ? "РџРѕРґСЃРјРѕС‚СЂРµС‚СЊ СЃРІРѕСЋ РєР°СЂС‚Сѓ" : "РџРѕРґСЃРјРѕС‚СЂРµС‚СЊ (С‚РѕР»СЊРєРѕ РґР»СЏ РІР»Р°РґРµР»СЊС†Р° Рё РџСЃРёС…РѕР»РѕРіР°)")}>
              <Eye size={16} />
            </button>
          )}
          
          {element.type === 'card' && (
            <button onClick={(e) => {
              e.stopPropagation();
              if (element.owner && element.owner !== currentUser?.uid && isClientMode) {
                onNotify(`РўРѕР»СЊРєРѕ ${element.ownerName} РёР»Рё РџСЃРёС…РѕР»РѕРі РјРѕРіСѓС‚ РїРµСЂРµРІРµСЂРЅСѓС‚СЊ РєР°СЂС‚Сѓ`); return;
              }
              playSound('flip', isMuted); onUpdate({ isFlipped: !element.isFlipped });
            }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-black/5 text-ink/70" title="РџРµСЂРµРІРµСЂРЅСѓС‚СЊ">
              <RefreshCw size={16} />
            </button>
          )}
          
          {(isField || (element.type === 'card' && element.isFlipped)) && (
            <button onClick={(e) => { e.stopPropagation(); onPreview(); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-black/5 text-ink/70" title="РЈРІРµР»РёС‡РёС‚СЊ"><Maximize2 size={16} /></button>
          )}
          
          {(!isClientMode || !isField) && !isFigureOrArrow && (
            <div className="flex bg-gray-100 rounded-full p-0.5 shadow-inner border border-gray-200/50 ml-1">
              <button onClick={(e) => { e.stopPropagation(); onUpdate({ rotation: (element.rotation - 90 + 360) % 360 }); }} className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white text-ink/70 shadow-sm" title={`РџРѕРІРµСЂРЅСѓС‚СЊ РІР»РµРІРѕ (90В°)`}>
                <RotateCcw size={14} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onUpdate({ rotation: (element.rotation + 90) % 360 }); }} className="w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white text-ink/70 shadow-sm" title={`РџРѕРІРµСЂРЅСѓС‚СЊ РІРїСЂР°РІРѕ (90В°)`}>
                <RotateCw size={14} />
              </button>
            </div>
          )}

          {!isClientMode && !isField && (
            <button onClick={(e) => { e.stopPropagation(); onUpdate({ isLocked: !isLocked }); }} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 ${isLocked ? 'bg-terra/10 text-terra' : 'hover:bg-black/5 text-ink/70'}`} title={isLocked ? "РћС‚РєСЂРµРїРёС‚СЊ" : "Р—Р°РєСЂРµРїРёС‚СЊ"}>
              {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
          )}

          {!isClientMode && element.owner && (
            <button onClick={(e) => {
              e.stopPropagation();
              onUpdate({ owner: null, ownerName: null });
              onNotify("РЎР±СЂРѕС€РµРЅР° РїСЂРёРІСЏР·РєР° РєР°СЂС‚С‹ Рє РёРіСЂРѕРєСѓ");
            }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-black/5 text-ink/70" title="РћС‚РІСЏР·Р°С‚СЊ РІР»Р°РґРµР»СЊС†Р°">
              <UserMinus size={16} />
            </button>
          )}

          {!isClientMode && (
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-terra/10 text-terra" title="РЈРґР°Р»РёС‚СЊ"><Trash2 size={16} /></button>
          )}
        </div>
      )}

      {(!isClientMode && isField && !(isLaserMode && !isClientMode)) && (
        <div className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-20" style={{ left: 'calc(100% + 12px)' }}>
          <button onClick={(e) => { e.stopPropagation(); onUpdate({ isLocked: !isLocked }); }} className="p-3 rounded-full transition-colors hover:opacity-80 shadow-xl border bg-white/90 backdrop-blur-md" style={{ color: isLocked ? COLORS.terra : `${COLORS.ink}80`, borderColor: isLocked ? COLORS.terra : `${COLORS.ink}20` }} title={isLocked ? "РћС‚РєСЂРµРїРёС‚СЊ РїРѕР»Рµ" : "Р—Р°РєСЂРµРїРёС‚СЊ РїРѕР»Рµ"}>
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
                <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); document.execCommand('bold', false, null); handleTextInput(); }} className={`p-1 rounded transition-colors ${isPrivate ? 'hover:bg-purple-300/50' : 'hover:bg-yellow-300/50'}`} title="Р–РёСЂРЅС‹Р№"><Bold size={12} strokeWidth={3} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); document.execCommand('italic', false, null); handleTextInput(); }} className={`p-1 rounded transition-colors ${isPrivate ? 'hover:bg-purple-300/50' : 'hover:bg-yellow-300/50'}`} title="РљСѓСЂСЃРёРІ"><Italic size={12} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); document.execCommand('underline', false, null); handleTextInput(); }} className={`p-1 rounded transition-colors ${isPrivate ? 'hover:bg-purple-300/50' : 'hover:bg-yellow-300/50'}`} title="РџРѕРґС‡РµСЂРєРЅСѓС‚С‹Р№"><Underline size={12} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); document.execCommand('strikeThrough', false, null); handleTextInput(); }} className={`p-1 rounded transition-colors ${isPrivate ? 'hover:bg-purple-300/50' : 'hover:bg-yellow-300/50'}`} title="Р—Р°С‡РµСЂРєРЅСѓС‚С‹Р№"><Strikethrough size={12} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); document.execCommand('insertUnorderedList', false, null); handleTextInput(); }} className={`p-1 rounded transition-colors ${isPrivate ? 'hover:bg-purple-300/50' : 'hover:bg-yellow-300/50'}`} title="РЎРїРёСЃРѕРє"><List size={12} /></button>
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
              data-placeholder="Р—Р°РјРµС‚РєР°..."
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
              <img src={element.img} className="w-full h-full object-contain pointer-events-none" alt="РРіСЂРѕРІРѕРµ РїРѕР»Рµ" />
            ) : (
              <>
                <div className="absolute inset-0 rounded-[1rem] overflow-hidden flex items-center justify-center bg-white border border-black/5" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                  <img src={element.img} className="w-full h-full object-contain pointer-events-none" alt="РљР°СЂС‚Р°" />
                </div>
                <div className="absolute inset-0 rounded-[1rem] overflow-hidden flex items-center justify-center border border-white/10" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundImage: `linear-gradient(to bottom right, ${COLORS.forest}, ${COLORS.ink})` }}>
                  {element.backImg
                    ? <img src={element.backImg} className="w-full h-full object-cover absolute inset-0 pointer-events-none" alt="Р СѓР±Р°С€РєР°" />
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
