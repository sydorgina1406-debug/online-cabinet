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
  Plus, Layers, RotateCw, Trash2, Maximize2, Minimize2, X, ChevronUp,
  FolderOpen, LayoutGrid, Move, Cloud, Copy, CheckCircle,
  Users, LogOut, AlertCircle, ExternalLink, Image as ImageIcon,
  Volume2, VolumeX, ArrowUp, Save, MousePointer2, UserCircle,
  Key, Edit2, Loader2, CloudUpload, RefreshCw, Link as LinkIcon, FileJson,
  Eye, Lock, Unlock, Type, Gamepad2
} from 'lucide-react';

// --- НАСТРОЙКИ FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBUPWtHxkVVoXZK5V_WeCEAQjBaYjf9uwY",
  authDomain: "mak-space-yulia.firebaseapp.com",
  projectId: "mak-space-yulia",
  storageBucket: "mak-space-yulia.firebasestorage.app",
  messagingSenderId: "324239633120",
  appId: "1:324239633120:web:b581fdd4a1ff79f92ffe85",
  measurementId: "G-ZGQQFDQL3G"
};

const appId = "mak-space-yulia-sudorgina";
// Ссылка на экспорт вашей конкретной таблицы в формате CSV
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1H65cuAhJ6rUKIvhuDthQCU8OWQ2RqdGgJOqhV24AqVs/export?format=csv&gid=402059779";

const ROOT_DRIVE_FOLDER_ID = "19-ZI-4tzVgRntc34yJTPGAVzZpyKksHl";
const DRIVE_API_KEY = "AIzaSyDXSTiw-Sd2jZve2Yv7bnbVRIAYcPre3N4";

const COLORS = {
  plum: '#8B3252',
  forest: '#2D4A3E',
  terra: '#C4714A',
  ink: '#1C1020',
  haze: '#F2EFF5'
};

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

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
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
          if (file.name.toLowerCase().includes('рубашка')) {
            backImage = fileUrl;
          } else {
            cards.push(fileUrl);
          }
        }
        
        if (cards.length > 0) {
          loadedDecks.push({
            id: folder.id,
            name: folder.name,
            cards,
            backImage,
            isBaseDeck: true 
          });
        }
      }
    } else if (images.length > 0) {
        let backImage = null;
        const cards = [];
        for (const file of images) {
          const fileUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`;
          if (file.name.toLowerCase().includes('рубашка')) {
            backImage = fileUrl;
          } else {
            cards.push(fileUrl);
          }
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
    if (!globalAudioCtx) {
      globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }
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
    el.focus();
    el.select();
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
    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-8 h-8">
      {dots[value]?.map((pos, i) => (
        <div key={i} className={`rounded-full shadow-sm w-full h-full ${pos}`} style={{ backgroundColor: dotColor }}></div>
      ))}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isClientMode, setIsClientMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  const [platformName, setPlatformName] = useState("ОНЛАЙН КАБИНЕТ");
  const [isGameMode, setIsGameMode] = useState(false); 
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [clientNameInput, setClientNameInput] = useState('');
  const [userName, setUserName] = useState('');
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);

  const [cardsOnTable, setCardsOnTable] = useState([]);
  const [localDecks, setLocalDecks] = useState([]);
  const [cloudDecks, setCloudDecks] = useState([]);
  const [baseDecks, setBaseDecks] = useState([]); 
  const [isBaseDecksLoading, setIsBaseDecksLoading] = useState(false);

  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [activeDeckData, setActiveDeckData] = useState(null);

  const [dice, setDice] = useState({ value: 1, timestamp: 0 });
  const [visualDice, setVisualDice] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevDiceTime = useRef(0);

  const [cursors, setCursors] = useState({});
  const lastCursorSync = useRef(0);
  
  // Рефы для работы с огромным пространством стола
  const scrollContainerRef = useRef(null);
  const boardRef = useRef(null);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isLibraryFullscreen, setIsLibraryFullscreen] = useState(false);
  const [isLibraryDeckFlipped, setIsLibraryDeckFlipped] = useState(false);

  const [previewCard, setPreviewCard] = useState(null);
  const [notification, setNotification] = useState("");
  const [isNamingDeck, setIsNamingDeck] = useState(false);
  const [tempDeckName, setTempDeckName] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState('cloud');
  const [isDbConnected, setIsDbConnected] = useState(false);

  const notify = (text, time = 4000) => { setNotification(text); setTimeout(() => setNotification(""), time); };

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
        setIsClientMode(true); 
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (inRoom && !isClientMode) {
      setIsBaseDecksLoading(true);
      loadBaseDecks((msg) => notify(msg, 6000)).then(decks => {
        setBaseDecks(decks);
        setIsBaseDecksLoading(false);
      });
    }
  }, [inRoom, isClientMode]);

  useEffect(() => {
    if (!user || !isDbConnected || isClientMode) return;
    const unsub = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), (s) => {
      setCloudDecks(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, isDbConnected, isClientMode]);

  useEffect(() => {
    if (!user || !isAuthorized || !roomId || !isDbConnected) return;
    const tUnsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`), (snap) => {
      const cards = [];
      snap.docs.forEach(d => {
        if (d.id === '_dice_state') setDice({ value: d.data().value, timestamp: d.data().timestamp });
        else if (d.id === '_settings') { 
          if (d.data().platformName) setPlatformName(d.data().platformName); 
          if (d.data().isGameMode !== undefined) setIsGameMode(d.data().isGameMode);
        }
        else if (d.id === '_library_state') {
          setIsLibraryOpen(d.data().isOpen);
          setIsLibraryFullscreen(d.data().isFullscreen);
          setIsLibraryDeckFlipped(d.data().isFlipped);
        }
        else if (d.id === '_active_deck') { setActiveDeckData(d.data()); }
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
  }, [user, isAuthorized, roomId, isDbConnected]);

  const handleMouseMove = (e) => {
    if (!isAuthorized || !isDbConnected || !user || !roomId) return;
    const now = Date.now();
    if (now - lastCursorSync.current > 200) {
      lastCursorSync.current = now;
      
      const board = boardRef.current;
      if (!board) return;
      
      // Вычисляем координаты относительно бесконечного стола, а не экрана
      const rect = board.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}_cursors`, user.uid), { 
        x, y, color: myCursorColor, timestamp: now, name: userName 
      }).catch(() => {});
    }
  };

  const editPlatformName = async () => {
    const newName = prompt("Название вашего кабинета:", platformName);
    if (newName && newName.trim() !== "") {
      const val = newName.trim();
      setPlatformName(val);
      if (isDbConnected && user && roomId) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { platformName: val }, { merge: true });
      }
    }
  };

  const toggleGameMode = async () => {
    if (isClientMode || !isDbConnected || !roomId) return;
    const newMode = !isGameMode;
    setIsGameMode(newMode);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { isGameMode: newMode }, { merge: true });
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
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_active_deck'), {
      id: deck.id, name: deck.name, cards: deck.cards, backImage: deck.backImage
    });
    syncLibraryUI({ isFlipped: false });
  };

  const handleLogin = async () => {
    if (!emailInput || !passwordInput) return notify("Введите Email и Пароль");
    const inputEmail = emailInput.trim().toLowerCase();
    const inputPwd = passwordInput.trim();

    const enterRoomAsPsy = (name) => {
      if (!roomId) {
        setRoomId(`session_${Math.random().toString(36).substr(2, 6)}`);
      }
      setUserName(name + " (Мастер)");
      setIsClientMode(false); setIsAuthorized(true); setInRoom(true); setShowKeyPrompt(false);
      notify(`Привет, ${name}! Базовые колоды загружаются...`);
    };

    if ((inputEmail === "yulia" || inputEmail === "юлия") && inputPwd === "owner777") {
      enterRoomAsPsy("Юлия");
      return;
    }

    setIsCheckingKey(true);
    try {
      const response = await fetch(GOOGLE_SHEET_CSV_URL, { mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const csvText = await response.text();
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
        if (rows[i].length >= 4 &&
          rows[i][0].trim().toLowerCase() === inputEmail &&
          rows[i][1].trim() === inputPwd) {
          found = rows[i][2].trim();
          const expiry = new Date(rows[i][3].trim()).getTime();
          if (expiry && Date.now() < (expiry + 86400000)) valid = true;
          break;
        }
      }
      setIsCheckingKey(false);
      if (found && valid) { enterRoomAsPsy(found); }
      else { notify(found ? "Подписка истекла" : "Неверный Email или Пароль"); }
    } catch (e) {
      setIsCheckingKey(false);
      console.error('Sheets error:', e);
      notify("Ошибка связи с таблицей. Убедитесь что таблица опубликована.");
    }
  };

  const handleClientLogin = () => {
    if (!clientNameInput.trim()) return notify("Укажите ваше имя");
    setUserName(clientNameInput.trim());
    setIsAuthorized(true);
    setInRoom(true);
  };

  const addElement = async (type, data) => {
    if (!isAuthorized || !roomId) return;
    playSound('drop', isMuted);
    const id = `elem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const maxZ = cardsOnTable.reduce((m, c) => Math.max(m, c.zIndex || 0), 0);
    const isField = type === 'field';

    let width = isField ? 800 : (type === 'token' ? 45 : (type === 'text' ? 200 : 160));
    let height = isField ? 600 : (type === 'token' ? 45 : (type === 'text' ? 100 : 240));

    if (type === 'card' && data.img) {
      try {
        const dims = await new Promise((resolve) => {
          const i = new Image();
          i.onload = () => resolve({ w: i.width, h: i.height });
          i.onerror = () => resolve(null);
          i.src = data.img;
        });
        if (dims && dims.w > dims.h) {
          width = 240; 
          height = 160;
        }
      } catch (e) {}
    }

    // Вычисляем местоположение: бросаем в центр видимого экрана
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
      x: spawnX,
      y: spawnY,
      width, height,
      rotation: 0, isFlipped: type !== 'token' && type !== 'text' && !isField, 
      zIndex: isField ? 0 : maxZ + 1,
      isLocked: false
    };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, id), elem);
  };

  const clearTable = async () => {
    if (!window.confirm("Очистить стол? Все незакрепленные карты и токены будут удалены.")) return;
    try {
      const batch = writeBatch(db);
      cardsOnTable.forEach(card => {
        if (!card.isLocked) {
          const ref = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, card.id);
          batch.delete(ref);
        }
      });
      await batch.commit();
      notify("Стол очищен");
    } catch (e) {
      notify("Ошибка при очистке стола");
      console.error(e);
    }
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
      console.error(err);
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
    const input = prompt("Вставьте ссылку на папку Google Диска (или несколько ссылок на файлы):");
    if (!input || !input.trim()) return;

    const folderId = extractDriveFolderId(input.trim());

    if (folderId) {
      const name = prompt("Имя колоды:");
      if (!name) return;

      notify("Загружаю список файлов из папки...");
      try {
        const files = await loadDriveFolderFiles(folderId, DRIVE_API_KEY);
        if (files.length === 0) {
          return notify("В папке нет изображений. Убедитесь что папка открыта по ссылке.");
        }

        let backImage = null;
        const cards = [];

        for (const file of files) {
          const url = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`;
          if (file.name.toLowerCase().includes('рубашка')) {
            backImage = url;
          } else {
            cards.push(url);
          }
        }

        if (cards.length === 0) return notify("Карты не найдены (все файлы — рубашка?)");

        const newDeck = { name, cards, backImage: backImage || null, createdAt: Date.now() };

        if (isDbConnected && user && !isClientMode) {
          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), newDeck);
          notify(`Колода "${name}": ${cards.length} карт${backImage ? ' + рубашка' : ''} ✓`);
          setActiveTab('cloud');
        } else {
          setLocalDecks(p => [...p, { ...newDeck, id: Date.now().toString() }]);
        }

      } catch (e) {
        console.error(e);
        if (e.message.includes('403') || e.message.includes('400')) {
          notify("Ошибка доступа. Убедитесь: 1) папка открыта по ссылке, 2) Drive API подключён.");
        } else {
          notify("Ошибка загрузки папки: " + e.message);
        }
      }

    } else {
      const name = prompt("Имя колоды:");
      if (!name) return;

      const linkArray = input
        .split(/[\n\r,\s]+/)
        .map(l => l.trim())
        .filter(l => l.length > 10)
        .map(l => convertDriveLink(l))
        .filter(Boolean);

      if (linkArray.length === 0) return notify("Не найдено ни одной ссылки");

      const newDeck = { name, cards: linkArray, backImage: null, createdAt: Date.now() };

      if (isDbConnected && user && !isClientMode) {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), newDeck);
        notify(`Колода "${name}" сохранена: ${linkArray.length} карт ✓`);
        setActiveTab('cloud');
      } else {
        setLocalDecks(p => [...p, { ...newDeck, id: Date.now().toString() }]);
        notify(`Колода "${name}" добавлена: ${linkArray.length} карт`);
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
                <button
                  onClick={() => setShowKeyPrompt(true)}
                  style={{ backgroundColor: COLORS.plum, color: 'white', border: 'none' }}
                  className="w-full font-black py-5 rounded-2xl text-xs uppercase tracking-widest shadow-lg flex flex-col items-center gap-2 transition-all hover:opacity-90"
                >
                  <Key size={24} /> ВОЙТИ КАК ПСИХОЛОГ
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text" value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Email"
                  className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center"
                  style={{ borderColor: COLORS.plum, color: COLORS.plum, backgroundColor: `${COLORS.plum}10` }}
                />
                <input
                  type="password" value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Пароль"
                  className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center"
                  style={{ borderColor: COLORS.plum, color: COLORS.plum, backgroundColor: `${COLORS.plum}10` }}
                />
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowKeyPrompt(false)} className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors" style={{ color: `${COLORS.ink}80` }}>Назад</button>
                  <button onClick={handleLogin} disabled={isCheckingKey} style={{ backgroundColor: COLORS.forest, color: 'white', border: 'none' }} className="flex-[2] font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-md disabled:opacity-50">
                    {isCheckingKey ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Проверка...</span> : "Войти"}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <p className="font-bold text-[10px] uppercase text-center mb-4" style={{ color: COLORS.ink }}>Представьтесь, чтобы зайти за стол:</p>
              <input
                type="text" value={clientNameInput}
                onChange={e => setClientNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleClientLogin()}
                placeholder="Ваше Имя"
                className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center"
                style={{ borderColor: COLORS.forest, color: COLORS.forest, backgroundColor: `${COLORS.forest}10` }}
              />
              <button onClick={handleClientLogin} style={{ backgroundColor: COLORS.forest, color: 'white', border: 'none' }} className="w-full font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-md transition-all hover:opacity-90 mt-2">
                Войти в кабинет
              </button>
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

      {/* ШАПКА - Адаптивная */}
      <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-3 bg-white/90 backdrop-blur-md border-b z-30 shadow-sm gap-2" style={{ borderColor: `${COLORS.ink}10` }}>
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
                {!isClientMode && (
                  <button 
                    onClick={toggleGameMode} 
                    className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1 shadow-sm border ${isGameMode ? 'text-white' : 'hover:opacity-70'}`}
                    style={{ backgroundColor: isGameMode ? COLORS.plum : COLORS.haze, color: isGameMode ? 'white' : COLORS.ink, borderColor: isGameMode ? COLORS.plum : `${COLORS.ink}20` }}
                    title={isGameMode ? "Скрыть кубик и фишки" : "Показать кубик и фишки"}
                  >
                    <Gamepad2 size={10} /> {isGameMode ? 'Игра' : 'Консультация'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Панель инструментов - переносится на мобильных */}
        <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end w-full md:w-auto">
          
          <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 rounded-xl transition-colors hover:opacity-70" style={{ backgroundColor: COLORS.haze, color: COLORS.ink }}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          {!isClientMode && (
            <button onClick={async () => {
              const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
              await copyToClipboard(url);
              setCopyFeedback(true);
              setTimeout(() => setCopyFeedback(false), 2000);
            }} className="px-4 py-2.5 rounded-xl text-[10px] font-black bg-white border flex items-center gap-2 shadow-sm transition-all hover:opacity-70" style={{ borderColor: `${COLORS.ink}20`, color: COLORS.ink }}>
              {copyFeedback ? <CheckCircle size={14} color={COLORS.forest} /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copyFeedback ? "СКОПИРОВАНО" : "ССЫЛКА"}</span>
            </button>
          )}
          {!isClientMode && (
            <>
              <button onClick={() => addElement('text', { text: "" })} className="p-2.5 rounded-xl transition-all hover:opacity-80 border" style={{ backgroundColor: '#FFF9C4', color: COLORS.terra, borderColor: '#FDE047' }} title="Добавить пустую заметку">
                <Type size={18} />
              </button>
              
              <label className="p-2.5 rounded-xl cursor-pointer border transition-all hover:opacity-80" style={{ backgroundColor: COLORS.haze, color: COLORS.forest, borderColor: `${COLORS.forest}20` }} title="Загрузить поле с компьютера">
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  notify("Загрузка поля, подождите...", 5000);
                  try {
                    const data = await new Promise(r => { const rd = new FileReader(); rd.onload = (ev) => r(ev.target.result); rd.readAsDataURL(f); });
                    const comp = await compressImage(data, 2000, 2000);
                    const path = `fields/${user.uid}/field_${Date.now()}.jpg`;
                    const url = await uploadImageToStorage(comp, path);
                    await addElement('field', { img: url });
                    notify("Игровое поле успешно загружено! ✓");
                  } catch (err) {
                    console.error("Ошибка загрузки поля:", err);
                    notify("Ошибка загрузки: " + err.message);
                  } finally {
                    e.target.value = '';
                  }
                }} />
                <ImageIcon size={18} />
              </label>
              <button onClick={clearTable} className="p-2.5 rounded-xl transition-colors hover:opacity-70" style={{ color: COLORS.terra }} title="Очистить стол">
                <Trash2 size={18} />
              </button>
            </>
          )}
          <button onClick={() => window.location.reload()} className="p-2.5 transition-colors hover:opacity-70" style={{ color: `${COLORS.ink}80` }} title="Выйти">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ОГРОМНОЕ ПОЛЕ С ПРОКРУТКОЙ */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        
        {/* Фиксированная плавающая панель Игры */}
        {isGameMode && (
          <div className="fixed top-[120px] md:top-24 right-4 md:right-10 z-40 flex flex-col items-center gap-3 bg-white/60 backdrop-blur-md p-4 rounded-[2.5rem] shadow-xl border border-white transition-all animate-in slide-in-from-right-4 fade-in duration-300 pointer-events-auto">
            <div className="flex gap-2 p-2 rounded-2xl border border-white" style={{ backgroundColor: `${COLORS.ink}10` }}>
              {['#8B3252', '#2D4A3E', '#C4714A', '#4A90E2', '#E2A94A'].map(color => (
                <button key={color} onClick={() => addElement('token', { color })} className="w-5 h-5 rounded-full shadow-md border border-white/50 hover:scale-125 transition-transform" style={{ backgroundColor: color }} />
              ))}
            </div>
            <div className={`w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border-2 transition-all ${isAnimating ? 'animate-bounce scale-110' : ''}`} style={{ borderColor: `${COLORS.plum}20` }}>
              {renderDiceFace(visualDice, COLORS.plum)}
            </div>
            <button onClick={async () => {
              if (isAnimating) return;
              const array = new Uint32Array(1);
              window.crypto.getRandomValues(array);
              const v = (array[0] % 6) + 1;
              await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_dice_state'), { value: v, timestamp: Date.now() });
            }} disabled={isAnimating} style={{ backgroundColor: COLORS.forest, color: 'white', border: 'none' }} className="px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-md hover:opacity-90 transition-colors disabled:opacity-50">
              Бросить
            </button>
          </div>
        )}

        {/* Область, которая скроллится */}
        <div ref={scrollContainerRef} className="flex-1 overflow-auto custom-scrollbar relative bg-[#F2EFF5]">
          <div 
            ref={boardRef}
            className="relative min-w-[3000px] min-h-[3000px] bg-transparent"
            onMouseMove={handleMouseMove} 
            onTouchMove={handleMouseMove}
          >
            {/* Сетка фона */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, ${COLORS.plum} 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>
            
            {/* Карты и объекты на столе */}
            {cardsOnTable.map((elem) => (
              <DraggableElement
                key={elem.id}
                element={elem}
                isClientMode={isClientMode}
                isMuted={isMuted}
                playSound={playSound}
                maxZIndex={Math.max(0, ...cardsOnTable.map(c => c.zIndex || 0))}
                onUpdate={(d) => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, elem.id), d)}
                onRemove={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, elem.id))}
                onPreview={() => elem.type === 'card' && setPreviewCard(elem)}
                currentUser={user}
                currentUserName={userName}
                onNotify={notify}
                boardRef={boardRef} // Прокидываем ссылку на доску
              />
            ))}

            {/* Курсоры других игроков */}
            {Object.entries(cursors).map(([id, cur]) => (
              <div key={id} className="absolute pointer-events-none z-[2000] flex flex-col items-center transition-all duration-150 ease-out" style={{ left: cur.x, top: cur.y }}>
                <MousePointer2 size={24} fill={cur.color} color="white" strokeWidth={2} className="drop-shadow-md -rotate-12 transform -translate-x-2 -translate-y-2" />
                <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded mt-1 shadow-md" style={{ backgroundColor: cur.color }}>{cur.name || 'Гость'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* БИБЛИОТЕКА - Адаптивная (снизу) */}
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-700 pointer-events-none ${isLibraryOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'}`}>
          <div className={`bg-white/95 backdrop-blur-xl rounded-t-[3rem] shadow-2xl border-t border-white flex flex-col transition-all duration-500 pointer-events-auto ${isLibraryFullscreen ? 'h-[90vh]' : 'h-[75vh] md:h-80'}`}>
            <div className="relative w-full flex justify-center py-3" style={{ color: COLORS.plum }}>
              <button onClick={toggleLibrary} className="flex flex-col items-center gap-1 w-full cursor-pointer hover:opacity-70 transition-opacity">
                <ChevronUp size={24} className={`transition-transform duration-500 ${isLibraryOpen ? 'rotate-180' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{isClientMode ? "Выбор карты" : "Библиотека Мастера"}</span>
              </button>
              {isLibraryOpen && !isClientMode && (
                <button onClick={toggleFullscreen} className="absolute right-8 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors hover:opacity-70" style={{ backgroundColor: COLORS.haze, color: COLORS.ink }}>
                  <Maximize2 size={20} />
                </button>
              )}
            </div>
            
            {/* Содержимое библиотеки перестроено для мобильных */}
            <div className="flex flex-1 flex-col md:flex-row p-4 md:p-8 pt-0 gap-4 md:gap-8 min-h-0 overflow-hidden">
              {!isClientMode && (
                <div className="w-full md:w-72 border-b md:border-b-0 md:border-r pb-4 md:pb-0 pr-0 md:pr-6 h-[30%] md:h-auto flex-shrink-0 overflow-y-auto custom-scrollbar flex flex-col gap-3" style={{ borderColor: `${COLORS.ink}10` }}>
                  <div className="flex p-1 rounded-xl mb-1 flex-shrink-0" style={{ backgroundColor: COLORS.haze }}>
                    <button onClick={() => setActiveTab('cloud')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeTab === 'cloud' ? 'bg-white shadow-sm' : 'hover:opacity-70'}`} style={{ color: activeTab === 'cloud' ? COLORS.plum : `${COLORS.ink}99` }}>ОБЛАКО</button>
                    <button onClick={() => setActiveTab('local')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${activeTab === 'local' ? 'bg-white shadow-sm' : 'hover:opacity-70'}`} style={{ color: activeTab === 'local' ? COLORS.plum : `${COLORS.ink}99` }}>СЕССИЯ</button>
                  </div>
                  
                  {activeTab === 'local' && (
                    <div className="space-y-2 flex-shrink-0">
                      <label className="flex items-center justify-center gap-2 py-4 border-2 border-dashed rounded-2xl text-[10px] font-black cursor-pointer transition-all uppercase hover:opacity-70" style={{ borderColor: `${COLORS.ink}20`, color: `${COLORS.ink}80` }}>
                        <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => { setPendingFiles(Array.from(e.target.files)); setIsNamingDeck(true); }} />
                        <Plus size={18} /> Загрузить с ПК
                      </label>
                      <button onClick={addDeckByLinks} className="w-full flex items-center justify-center gap-2 py-3 border-2 rounded-2xl text-[9px] font-black transition-all uppercase hover:opacity-70" style={{ borderColor: `${COLORS.ink}10`, color: `${COLORS.ink}80` }}>
                        <FileJson size={16} /> Ссылки (Диск)
                      </button>
                    </div>
                  )}

                  {activeTab === 'cloud' && isBaseDecksLoading && (
                    <div className="flex justify-center py-4 flex-shrink-0">
                      <Loader2 size={20} className="animate-spin" style={{ color: COLORS.plum }} />
                    </div>
                  )}

                  {(activeTab === 'local' ? localDecks : [...baseDecks, ...cloudDecks]).map(item => (
                    <div key={item.id} className={`group flex items-center gap-3 p-3 rounded-2xl transition-all relative border flex-shrink-0 ${selectedDeckId === item.id ? 'shadow-sm' : 'border-transparent'}`} style={{ backgroundColor: selectedDeckId === item.id ? `${COLORS.plum}10` : 'transparent', borderColor: selectedDeckId === item.id ? `${COLORS.plum}33` : 'transparent' }}>
                      <button onClick={() => selectDeck(item)} className="flex-1 flex items-center gap-3 text-left overflow-hidden hover:opacity-70">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden border flex-shrink-0" style={{ borderColor: `${COLORS.ink}10` }}>
                          {item.backImage ? <img src={item.backImage} className="w-full h-full object-contain" alt="" /> : <FolderOpen size={16} color={`${COLORS.ink}4D`} />}
                        </div>
                        <span className="text-[10px] font-bold truncate uppercase" style={{ color: COLORS.ink }}>
                          {item.name} {item.isBaseDeck && <span className="opacity-50">(База)</span>}
                        </span>
                      </button>
                      {!item.isBaseDeck && (
                        <button onClick={async () => {
                          if (window.confirm("Удалить колоду?")) {
                            if (activeTab === 'local') setLocalDecks(p => p.filter(d => d.id !== item.id));
                            else await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saved_decks', item.id));
                            notify("Удалено");
                          }
                        }} className="opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-colors hover:opacity-70" style={{ color: COLORS.terra }}>
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
                        <button onClick={toggleDeckFlip} style={{ backgroundColor: COLORS.plum, color: 'white', border: 'none' }} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:opacity-90 transition-all">
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
                      }} className="flex-shrink-0 w-24 h-36 md:w-28 md:h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:opacity-70 transition-all shadow-md" style={{ borderColor: `${COLORS.plum}4D`, backgroundColor: `${COLORS.plum}10`, color: COLORS.plum }}>
                        <Plus size={28} /><span className="text-[9px] font-black uppercase">Наугад</span>
                      </button>
                      {activeDeckData.cards.map((img, idx) => (
                        <button key={idx} onClick={() => {
                          addElement('card', { img, backImg: activeDeckData.backImage });
                          if (isLibraryFullscreen) toggleLibrary();
                        }} className="relative flex-shrink-0 h-36 md:h-40 rounded-2xl group shadow-sm hover:shadow-md transition-all flex items-center justify-center">
                          {isLibraryDeckFlipped
                            ? <img src={img} className="h-full w-auto min-w-[5rem] md:min-w-[6rem] object-contain rounded-2xl bg-white shadow-sm" alt={`Карта ${idx + 1}`} />
                            : <div className="h-full w-24 md:w-28 flex items-center justify-center rounded-2xl overflow-hidden relative shadow-sm" style={{ backgroundImage: `linear-gradient(to bottom right, ${COLORS.forest}, ${COLORS.ink})` }}>
                              {activeDeckData.backImage
                                ? <img src={activeDeckData.backImage} className="w-full h-full object-cover absolute inset-0" alt="Рубашка" />
                                : <Layers size={20} className="text-white/20" />}
                            </div>}
                          <div className="absolute top-2 left-2 text-white text-[10px] font-black px-2 py-0.5 rounded z-10 pointer-events-none" style={{ backgroundColor: `${COLORS.ink}99` }}>{idx + 1}</div>
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
            <input
              autoFocus value={tempDeckName}
              onChange={e => setTempDeckName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmUpload()}
              placeholder="Напр: Эмоции"
              className="w-full px-6 py-4 rounded-2xl border-2 mb-8 outline-none font-bold"
              style={{ borderColor: COLORS.haze, color: COLORS.ink }}
            />
            {isUploading && (
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold mb-2" style={{ color: `${COLORS.ink}66` }}>
                  <span>Загрузка в облако...</span>
                  <span>{uploadProgress}%</span>
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
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center backdrop-blur-md p-4"
          style={{ backgroundColor: `${COLORS.ink}F2` }}
          onClick={() => setPreviewCard(null)}
        >
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white font-black tracking-widest uppercase bg-black/50 px-6 py-2 rounded-full backdrop-blur-md text-xs text-center w-[90%] md:w-auto">
            {previewCard.isFlipped ? "Эта карта открыта для всех" : "Эту карту сейчас видите только вы"}
          </div>
          <button className="absolute top-6 right-6 text-white p-2 rounded-full transition-all hover:opacity-70" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <X size={40} />
          </button>
          <img
            src={previewCard.img}
            className="max-h-[85vh] max-w-[90vw] h-auto w-auto rounded-2xl shadow-2xl bg-white object-contain"
            style={{ animation: 'scaleIn 0.2s ease-out' }}
            alt="Карта"
          />
        </div>
      )}

      <style>{`
        .backface-hidden { backface-visibility: hidden; }
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 50, 82, 0.2); border-radius: 10px; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

function DraggableElement({ element, onUpdate, onRemove, onPreview, maxZIndex, playSound, isMuted, isClientMode, currentUser, currentUserName, onNotify, boardRef }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const initialMousePos = useRef({ x: 0, y: 0 });
  const startDim = useRef({ w: 0, h: 0 });
  const hasMoved = useRef(false);
  const clickTimestamp = useRef(0);

  const COLORS = { plum: '#8B3252', forest: '#2D4A3E', terra: '#C4714A', ink: '#1C1020', haze: '#F2EFF5' };
  
  const isField = element.type === 'field';
  const isText = element.type === 'text';
  const isLocked = element.isLocked;

  const handleDragStart = (e) => {
    if (isResizing) return;
    if (isLocked) return; 
    if (isField && isClientMode) return; 
    
    if (isText && e.target.tagName.toLowerCase() === 'textarea') return;

    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setIsDragging(true); hasMoved.current = false; clickTimestamp.current = Date.now();
    initialMousePos.current = { x: cx, y: cy };
    startPos.current = { x: cx - element.x, y: cy - element.y };
    
    if (!isField) {
      onUpdate({ zIndex: maxZIndex + 1 });
    }
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    if (isLocked) return;
    if (isField && isClientMode) return; 
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setIsResizing(true); startPos.current = { x: cx, y: cy }; startDim.current = { w: element.width, h: element.height };
  };

  useEffect(() => {
    const move = (e) => {
      if (isLocked) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      if (isDragging) {
        if (Math.sqrt(Math.pow(cx - initialMousePos.current.x, 2) + Math.pow(cy - initialMousePos.current.y, 2)) > 5) hasMoved.current = true;
        onUpdate({ x: cx - startPos.current.x, y: cy - startPos.current.y });
      } else if (isResizing) {
        const dx = cx - startPos.current.x;
        const ratio = startDim.current.w / startDim.current.h;
        const nw = Math.max(element.type === 'token' ? 25 : (isText ? 100 : 80), startDim.current.w + dx);
        onUpdate({ width: nw, height: nw / ratio });
      }
    };
    const end = () => {
      if (isDragging) {
        setIsDragging(false);
        if (hasMoved.current) playSound('drop', isMuted);
        if (!hasMoved.current && (Date.now() - clickTimestamp.current < 250) && element.type !== 'token' && !isField && !isText) {
          playSound('flip', isMuted); onUpdate({ isFlipped: !element.isFlipped });
        }
      }
      setIsResizing(false);
    };
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', move); window.addEventListener('mouseup', end);
      window.addEventListener('touchmove', move, { passive: true }); window.addEventListener('touchend', end);
    }
    return () => {
      window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', move); window.removeEventListener('touchmove', end); // Исправлена опечатка в снятии слушателя
    };
  }, [isDragging, isResizing, element, onUpdate, playSound, isMuted, isLocked, isText]);

  return (
    <div
      className={`absolute group touch-none ${isDragging ? 'z-[1000]' : ''}`}
      style={{
        left: element.x, top: element.y,
        width: element.width, height: element.height,
        zIndex: isField ? 0 : (element.zIndex || 1),
        transform: `rotate(${element.rotation}deg)`,
        transition: (isDragging || isResizing) ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white/95 backdrop-blur-sm rounded-xl px-1.5 py-1 shadow-xl z-20 border" style={{ borderColor: `${COLORS.ink}10` }}>
        {!isField && <button onClick={(e) => { e.stopPropagation(); onUpdate({ zIndex: maxZIndex + 1 }); }} className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{ color: `${COLORS.ink}80`, backgroundColor: COLORS.haze }} title="На передний план"><ArrowUp size={14} /></button>}

        {element.type === 'card' && !element.isFlipped && (
          <button onClick={(e) => { 
            e.stopPropagation(); 
            if (!element.owner) {
              if (isClientMode) {
                onUpdate({ owner: currentUser?.uid, ownerName: currentUserName || 'Игрок' });
              }
              onPreview();
            } else if (element.owner === currentUser?.uid || !isClientMode) {
              onPreview();
            } else {
              onNotify(`Эта карта принадлежит: ${element.ownerName}. Подсматривать нельзя! 🤫`);
            }
          }} className="p-1.5 rounded-lg transition-colors hover:opacity-70 font-bold" style={{ color: COLORS.forest, backgroundColor: `${COLORS.forest}20` }} title="Подсмотреть карту (вижу только я)">
            <Eye size={14} />
          </button>
        )}

        {element.type === 'card' && (
          <button onClick={(e) => { 
            e.stopPropagation(); 
            if (element.owner && element.owner !== currentUser?.uid && isClientMode) {
              onNotify(`Только ${element.ownerName} или Психолог могут перевернуть карту`);
              return;
            }
            playSound('flip', isMuted); 
            onUpdate({ isFlipped: !element.isFlipped }); 
          }} className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{ color: `${COLORS.ink}80`, backgroundColor: COLORS.haze }} title="Перевернуть (для всех)">
            <RefreshCw size={14} />
          </button>
        )}

        {(isField || (element.type === 'card' && element.isFlipped)) && (
           <button onClick={(e) => { e.stopPropagation(); onPreview(); }} className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{ color: `${COLORS.ink}80`, backgroundColor: COLORS.haze }} title="Увеличить на весь экран"><Maximize2 size={14} /></button>
        )}

        {(!isClientMode || !isField) && (
          <button onClick={(e) => { e.stopPropagation(); onUpdate({ rotation: (element.rotation + 90) % 360 }); }} className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{ color: `${COLORS.ink}80`, backgroundColor: COLORS.haze }} title="Повернуть"><RotateCw size={14} /></button>
        )}
        
        {!isClientMode && (
          <button onClick={(e) => { e.stopPropagation(); onUpdate({ isLocked: !isLocked }); }} className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{ color: isLocked ? COLORS.terra : `${COLORS.ink}80`, backgroundColor: COLORS.haze }} title={isLocked ? "Открепить" : "Закрепить"}>
            {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
        )}

        {!isClientMode && <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{ color: COLORS.terra }} title="Удалить"><Trash2 size={14} /></button>}
      </div>

      <div
        className={`w-full h-full relative ${isLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} transition-transform ${isDragging ? 'scale-105 shadow-2xl' : isField ? '' : 'shadow-lg'} ${isText ? 'rounded-lg bg-[#FFF9C4] border-2 border-[#FDE047] flex flex-col overflow-hidden' : 'rounded-2xl'}`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{ perspective: '1000px' }}
      >
        {isText ? (
           <>
             <div className="w-full h-6 bg-[#FDE047] border-b border-[#EAB308] flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing" title="Хватайте здесь, чтобы переместить">
               <div className="flex gap-1 opacity-50">
                 <div className="w-1 h-1 rounded-full bg-black" />
                 <div className="w-1 h-1 rounded-full bg-black" />
                 <div className="w-1 h-1 rounded-full bg-black" />
               </div>
             </div>
             <textarea
               className="flex-1 w-full p-2.5 bg-transparent resize-none outline-none text-[13px] font-bold text-gray-800 custom-scrollbar"
               value={element.text || ''}
               onChange={(e) => onUpdate({ text: e.target.value })}
               placeholder="Заметка..."
             />
           </>
        ) : element.type === 'token' ? (
          <div className="w-full h-full rounded-full shadow-inner border-2 border-white" style={{ backgroundColor: element.color }} />
        ) : (
            <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s ease', transform: element.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              <div className="absolute inset-0 rounded-2xl overflow-hidden flex items-center justify-center bg-white" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                <img src={element.img} className="w-full h-full object-contain pointer-events-none" alt="Карта" />
              </div>
              {!isField && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden flex items-center justify-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundImage: `linear-gradient(to bottom right, ${COLORS.forest}, ${COLORS.ink})` }}>
                  {element.backImg
                    ? <img src={element.backImg} className="w-full h-full object-contain pointer-events-none" alt="Рубашка" />
                    : <div className="flex flex-col items-center justify-center gap-1 opacity-20"><Layers size={32} className="text-white" /><span className="text-[8px] text-white font-black uppercase tracking-tighter leading-none">MAK SPACE</span></div>}
                </div>
              )}
            </div>
        )}
      </div>

      {(!isLocked && (!isClientMode || !isField)) && (
        <div
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          className="absolute -bottom-2 -right-2 w-8 h-8 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-30 drop-shadow-md bg-white/80 backdrop-blur-sm rounded-full scale-75 hover:scale-100 shadow-lg"
          style={{ color: COLORS.plum }}
        >
          <Move size={14} />
        </div>
      )}

      {element.owner && element.type === 'card' && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[9px] font-bold px-3 py-0.5 rounded-full z-10 whitespace-nowrap shadow-md pointer-events-none flex items-center gap-1 transition-all">
          <UserCircle size={10} /> {element.ownerName}
        </div>
      )}
    </div>
  );
}
