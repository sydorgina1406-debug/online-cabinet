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
  Eye, Lock, Unlock, Type, Gamepad2, Timer, TimerOff, Undo2
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
    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-8 h-8">
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
  const roomIdRef = useRef('');
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

  const notifyTimeoutRef = useRef(null);
  const notify = (text, time = 4000) => {
    setNotification(text);
    if (notifyTimeoutRef.current) clearTimeout(notifyTimeoutRef.current);
    notifyTimeoutRef.current = setTimeout(() => setNotification(""), time);
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
    const unsub = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), (s) => {
      setCloudDecks(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
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
          if (d.data().isGameMode !== undefined) setIsGameMode(d.data().isGameMode);
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
    if (now - lastCursorSync.current > 200) {
      lastCursorSync.current = now;
      const board = boardRef.current;
      if (!board) return;
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
      notify("Ошибка связи с таблицей. Убедитесь что таблица опубликована.");
    }
  };

  const handleClientLogin = () => {
    if (!clientNameInput.trim()) return notify("Укажите ваше имя");
    setUserName(clientNameInput.trim());
    setIsAuthorized(true);
    setInRoom(true);
    window._isClientMode = true;
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
      rotation: 0,
      isFlipped: type !== 'token' && type !== 'text' && !isField,
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
    const input = prompt("Вставьте ссылку на папку Google Диска (или несколько ссылок на файлы):");
    if (!input || !input.trim()) return;
    const folderId = extractDriveFolderId(input.trim());
    if (folderId) {
      const name = prompt("Имя колоды:");
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
      const name = prompt("Имя колоды:");
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
                <input type="text" value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Email" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center" style={{ borderColor: COLORS.plum, color: COLORS.plum, backgroundColor: `${COLORS.plum}10` }} />
                <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Пароль" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center" style={{ borderColor: COLORS.plum, color: COLORS.plum, backgroundColor: `${COLORS.plum}10` }} />
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
              <input type="text" value={clientNameInput} onChange={e => setClientNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleClientLogin()} placeholder="Ваше Имя" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center" style={{ borderColor: COLORS.forest, color: COLORS.forest, backgroundColor: `${COLORS.forest}10` }} />
              <button onClick={handleClientLogin} style={{ backgroundColor: COLORS.forest, color: 'white', border: 'none' }} className="w-full font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-md transition-all hover:opacity-90 mt-2">Войти в кабинет</button>
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
                  <button onClick={toggleGameMode} className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1 shadow-sm border ${isGameMode ? 'text-white' : 'hover:opacity-70'}`} style={{ backgroundColor: isGameMode ? COLORS.plum : COLORS.haze, color: isGameMode ? 'white' : COLORS.ink, borderColor: isGameMode ? COLORS.plum : `${COLORS.ink}20` }}>
                    <Gamepad2 size={10} /> {isGameMode ? 'Игра' : 'Консультация'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end w-full md:w-auto">
          {timerDisplay ? (
            <div className="flex items-center gap-1.5">
              <div className="px-4 py-2 rounded-xl font-black text-sm tabular-nums tracking-widest flex items-center gap-2 border transition-all" style={{ backgroundColor: timerIsWarning ? '#FEE2E2' : `${COLORS.plum}12`, color: timerIsWarning ? '#DC2626' : COLORS.plum, borderColor: timerIsWarning ? '#FCA5A5' : `${COLORS.plum}30` }}>
                <Timer size={14} />{timerDisplay}
              </div>
              {!isClientMode && (
                <button onClick={stopTimer} className="p-2 rounded-xl hover:opacity-70 transition-colors" style={{ color: COLORS.terra, backgroundColor: `${COLORS.terra}15` }} title="Остановить таймер">
                  <TimerOff size={15} />
                </button>
              )}
            </div>
          ) : (
            !isClientMode && (
              <button onClick={() => startTimer(90)} className="px-3 py-2 rounded-xl text-[10px] font-black border flex items-center gap-1.5 shadow-sm hover:opacity-80 transition-all" style={{ borderColor: `${COLORS.plum}30`, color: COLORS.plum, backgroundColor: `${COLORS.plum}10` }} title="Запустить таймер на 90 минут">
                <Timer size={14} /> 90 МИН
              </button>
            )
          )}

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
              <button onClick={() => addElement('text', { text: "" })} className="p-2.5 rounded-xl transition-all hover:opacity-80 border" style={{ backgroundColor: '#FFF9C4', color: COLORS.terra, borderColor: '#FDE047' }} title="Добавить заметку">
                <Type size={18} />
              </button>

              <label className="p-2.5 rounded-xl cursor-pointer border transition-all hover:opacity-80" style={{ backgroundColor: COLORS.haze, color: COLORS.forest, borderColor: `${COLORS.forest}20` }} title="Загрузить игровое поле">
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  notify("Сжимаю изображение...", 5000);
                  try {
                    const data = await new Promise(r => {
                      const rd = new FileReader();
                      rd.onload = (ev) => r(ev.target.result);
                      rd.readAsDataURL(f);
                    });
                    let comp = await compressImage(data, 1200, 1200);
                    if (comp.length > 900000) comp = await compressImage(data, 900, 900);
                    if (comp.length > 900000) comp = await compressImage(data, 700, 700);
                    const sizeKB = Math.round(comp.length / 1024);
                    if (comp.length > 900000) {
                      return notify(`Файл слишком большой (${sizeKB}KB). Попробуйте другое изображение.`);
                    }
                    notify(`Размещаю поле на столе (${sizeKB}KB)...`, 4000);
                    await addElement('field', { img: comp });
                    notify("Игровое поле появилось на столе! ✓");
                  } catch (err) {
                    notify("Ошибка: " + err.message);
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

      <main className="flex-1 relative flex flex-col overflow-hidden">
        {isGameMode && (
          <div className="fixed top-[120px] md:top-24 right-4 md:right-10 z-40 flex flex-col items-center gap-3 bg-white/60 backdrop-blur-md p-4 rounded-[2.5rem] shadow-xl border border-white transition-all pointer-events-auto">
            <div className="flex gap-2 p-2 rounded-2xl border border-white" style={{ backgroundColor: `${COLORS.ink}10` }}>
              {['#8B3252', '#2D4A3E', '#C4714A', '#4A90E2', '#E2A94A'].map(color => (
                <button key={color} onClick={() => addElement('token', { color })} className="w-5 h-5 rounded-full shadow-md border border-white/50 hover:scale-125 transition-transform" style={{ backgroundColor: color }} />
              ))}
            </div>
            <div className="flex p-0.5 rounded-xl" style={{ backgroundColor: `${COLORS.ink}15` }}>
              {[6, 10].map(type => (
                <button key={type} onClick={async () => {
                  setDiceType(type);
                  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_dice_type'), { type }, { merge: true });
                }} className="px-3 py-1.5 rounded-lg text-[10px] font-black transition-all" style={{ backgroundColor: diceType === type ? 'white' : 'transparent', color: diceType === type ? COLORS.plum : `${COLORS.ink}60`, boxShadow: diceType === type ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                  d{type}
                </button>
              ))}
            </div>
            {diceType === 6 ? (
              <div className={`w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border-2 transition-all ${isAnimating ? 'animate-bounce scale-110' : ''}`} style={{ borderColor: `${COLORS.plum}20` }}>
                {renderDiceFace(visualDice, COLORS.plum)}
              </div>
            ) : (
              <div className={`w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border-2 transition-all ${isAnimatingD10 ? 'animate-bounce scale-110' : ''}`} style={{ borderColor: `${COLORS.forest}30` }}>
                <span className="font-black text-2xl" style={{ color: COLORS.forest }}>{visualDiceD10}</span>
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
