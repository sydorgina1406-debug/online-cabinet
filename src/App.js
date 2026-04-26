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
  getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject
} from 'firebase/storage';
import {
  Plus, Layers, RotateCw, Trash2, Maximize2, Minimize2, X, ChevronUp,
  FolderOpen, LayoutGrid, Move, Cloud, Copy, CheckCircle,
  Users, LogOut, AlertCircle, ExternalLink, Image as ImageIcon,
  Volume2, VolumeX, ArrowUp, Save, MousePointer2, UserCircle,
  Key, Edit2, Loader2, CloudUpload, RefreshCw, Link as LinkIcon, FileJson,
  Eye, Lock, Unlock, Type, Gamepad2, Shield, Download, Search, ArrowLeft
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

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1H65cuAhJ6rUKIvhuDthQCU8OWQ2RqdGgJOqhV24AqVs/export?format=csv&gid=402059779";
const ROOT_DRIVE_FOLDER_ID = "19-ZI-4tzVgRntc34yJTPGAVzZpyKksHl";
const DRIVE_API_KEY = "AIzaSyDXSTiw-Sd2jZve2Yv7bnbVRIAYcPre3N4";

// Пароль владельца платформы (вы)
const OWNER_PASSWORD = "owner777";
const OWNER_EMAIL = "yulia";

const COLORS = {
  plum: '#8B3252',
  forest: '#2D4A3E',
  terra: '#C4714A',
  ink: '#1C1020',
  haze: '#F2EFF5',
  green: '#1e7b4b'
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

const loadBaseDecksFromDrive = async () => {
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
        if (cards.length > 0) loadedDecks.push({ id: folder.id, name: folder.name, cards, backImage, isBaseDeck: true, source: 'drive' });
      }
    } else if (images.length > 0) {
      let backImage = null;
      const cards = [];
      for (const file of images) {
        const fileUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`;
        if (file.name.toLowerCase().includes('рубашка')) backImage = fileUrl;
        else cards.push(fileUrl);
      }
      if (cards.length > 0) loadedDecks.push({ id: ROOT_DRIVE_FOLDER_ID, name: "Базовая колода", cards, backImage, isBaseDeck: true, source: 'drive' });
    }
    return loadedDecks;
  } catch (e) {
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
    if (type === 'drop') { osc.frequency.setValueAtTime(200, globalAudioCtx.currentTime); gain.gain.setValueAtTime(0.1, globalAudioCtx.currentTime); osc.start(); osc.stop(globalAudioCtx.currentTime + 0.1); }
    else if (type === 'flip') { osc.frequency.setValueAtTime(400, globalAudioCtx.currentTime); gain.gain.setValueAtTime(0.05, globalAudioCtx.currentTime); osc.start(); osc.stop(globalAudioCtx.currentTime + 0.05); }
    else if (type === 'dice') { osc.frequency.setValueAtTime(150, globalAudioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(400, globalAudioCtx.currentTime + 0.2); gain.gain.setValueAtTime(0.1, globalAudioCtx.currentTime); osc.start(); osc.stop(globalAudioCtx.currentTime + 0.2); }
  } catch (e) {}
};

// Сжатие Blob/File через canvas
const compressBlob = (blob, maxWidth = 800, maxHeight = 800) => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > h) { if (w > maxWidth) { h = h * maxWidth / w; w = maxWidth; } }
      else { if (h > maxHeight) { w = w * maxHeight / h; h = maxHeight; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob(out => resolve(out || blob), 'image/jpeg', 0.7);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(blob); };
    img.src = url;
  });
};

// Загрузка сжатого blob в Firebase Storage
const uploadBlobToStorage = async (blob, path) => {
  const ref = storageRef(storage, path);
  const compressed = await compressBlob(blob);
  await uploadBytes(ref, compressed, { contentType: 'image/jpeg' });
  return await getDownloadURL(ref);
};

// Загрузка большого поля (без сжатия до 800px)
const uploadFieldToStorage = async (blob, path) => {
  const ref = storageRef(storage, path);
  const compressed = await compressBlob(blob, 2000, 2000);
  await uploadBytes(ref, compressed, { contentType: 'image/jpeg' });
  return await getDownloadURL(ref);
};

const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement('textarea');
    el.value = text; el.style.position = 'fixed'; el.style.opacity = '0';
    document.body.appendChild(el); el.focus(); el.select();
    document.execCommand('copy'); document.body.removeChild(el);
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
  const [isOwner, setIsOwner] = useState(false); // Юлия — владелец платформы

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
  const [baseDecks, setBaseDecks] = useState([]); // Общие (Firebase)
  const [driveDecks, setDriveDecks] = useState([]); // Из Google Drive
  const [isBaseDecksLoading, setIsBaseDecksLoading] = useState(false);

  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [activeDeckData, setActiveDeckData] = useState(null);

  const [isBrowsingDecks, setIsBrowsingDecks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('base'); // 'base' | 'my'

  const [dice, setDice] = useState({ value: 1, timestamp: 0 });
  const [visualDice, setVisualDice] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevDiceTime = useRef(0);

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
  const [isUploadingBase, setIsUploadingBase] = useState(false); // загружаем как общую?
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [savingDeckId, setSavingDeckId] = useState(null);

  const notify = (text, time = 4000) => { setNotification(text); setTimeout(() => setNotification(""), time); };

  useEffect(() => {
    if (dice.timestamp > prevDiceTime.current) {
      if (prevDiceTime.current !== 0) {
        playSound('dice', isMuted);
        setIsAnimating(true);
        const interval = setInterval(() => setVisualDice(Math.floor(Math.random() * 6) + 1), 80);
        const timeout = setTimeout(() => { clearInterval(interval); setVisualDice(dice.value); setIsAnimating(false); }, 600);
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
      if (roomParam) { setRoomId(roomParam); setIsClientMode(true); }
    };
    init();
    const t = setTimeout(() => setAppLoading(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Загрузка общих колод из Firebase
  useEffect(() => {
    if (!inRoom || isClientMode || !isDbConnected) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'base_decks', '_list');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data().decks) setBaseDecks(snap.data().decks);
      else setBaseDecks([]);
    });
    return () => unsub();
  }, [inRoom, isClientMode, isDbConnected]);

  // Загрузка колод с Google Drive (для всех психологов)
  useEffect(() => {
    if (!inRoom || isClientMode) return;
    setIsBaseDecksLoading(true);
    loadBaseDecksFromDrive().then(decks => {
      setDriveDecks(decks);
      setIsBaseDecksLoading(false);
    });
  }, [inRoom, isClientMode]);

  // Загрузка личных колод из Firebase
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
        else if (d.id === '_active_deck') setActiveDeckData(d.data());
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
      const rect = board.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}_cursors`, user.uid), {
        x: clientX - rect.left, y: clientY - rect.top, color: myCursorColor, timestamp: now, name: userName
      }).catch(() => {});
    }
  };

  const editPlatformName = async () => {
    const newName = prompt("Название вашего кабинета:", platformName);
    if (newName && newName.trim() !== "") {
      const val = newName.trim();
      setPlatformName(val);
      if (isDbConnected && user && roomId)
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_settings'), { platformName: val }, { merge: true });
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

  const toggleLibrary = () => { const n = !isLibraryOpen; setIsLibraryOpen(n); syncLibraryUI({ isOpen: n }); };
  const toggleFullscreen = () => { const n = !isLibraryFullscreen; setIsLibraryFullscreen(n); syncLibraryUI({ isFullscreen: n }); };
  const toggleDeckFlip = () => { const n = !isLibraryDeckFlipped; setIsLibraryDeckFlipped(n); syncLibraryUI({ isFlipped: n }); };

  const selectDeck = async (deck) => {
    if (isClientMode) return;
    setSelectedDeckId(deck.id);
    setActiveDeckData(deck);
    setIsBrowsingDecks(false);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, '_active_deck'), {
      id: deck.id, name: deck.name, cards: deck.cards, backImage: deck.backImage
    });
    syncLibraryUI({ isFlipped: false });
  };

  const handleLogin = async () => {
    if (!emailInput || !passwordInput) return notify("Введите Email и Пароль");
    const inputEmail = emailInput.trim().toLowerCase();
    const inputPwd = passwordInput.trim();

    const enterRoom = (name, owner = false) => {
      if (!roomId) setRoomId(`session_${Math.random().toString(36).substr(2, 6)}`);
      setUserName(name + (owner ? " (Мастер)" : " (Мастер)"));
      setIsOwner(owner);
      setIsClientMode(false);
      setIsAuthorized(true);
      setInRoom(true);
      setShowKeyPrompt(false);
      notify(`Привет, ${name}!`);
    };

    if ((inputEmail === OWNER_EMAIL || inputEmail === "юлия") && inputPwd === OWNER_PASSWORD) {
      enterRoom("Юлия", true);
      return;
    }

    setIsCheckingKey(true);
    try {
      const response = await fetch(GOOGLE_SHEET_CSV_URL, { mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const csvText = await response.text();
      const rows = csvText.split('\n').map(row => {
        const result = []; let current = ''; let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
          if (row[i] === '"') inQuotes = !inQuotes;
          else if (row[i] === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
          else current += row[i];
        }
        result.push(current.trim());
        return result;
      });
      let found = null; let valid = false;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].length >= 4 && rows[i][0].trim().toLowerCase() === inputEmail && rows[i][1].trim() === inputPwd) {
          found = rows[i][2].trim();
          const expiry = new Date(rows[i][3].trim()).getTime();
          if (expiry && Date.now() < (expiry + 86400000)) valid = true;
          break;
        }
      }
      setIsCheckingKey(false);
      if (found && valid) enterRoom(found);
      else notify(found ? "Подписка истекла" : "Неверный Email или Пароль");
    } catch (e) {
      setIsCheckingKey(false);
      notify("Ошибка связи с таблицей.");
    }
  };

  const handleClientLogin = () => {
    if (!clientNameInput.trim()) return notify("Укажите ваше имя");
    setUserName(clientNameInput.trim());
    setIsAuthorized(true);
    setInRoom(true);
  };

  // Сохранить общую колоду в Мои колоды
  const saveBaseDeckToMine = async (deck) => {
    if (!user || !isDbConnected) return;
    setSavingDeckId(deck.id);
    try {
      const existing = cloudDecks.find(d => d.name === deck.name);
      if (existing) { notify(`Колода "${deck.name}" уже есть в ваших колодах`); return; }
      const newDeck = { ...deck, id: `deck_${Date.now()}`, isBaseDeck: false, savedFromBase: true, createdAt: Date.now() };
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), newDeck);
      notify(`Колода "${deck.name}" сохранена в Мои колоды ✓`);
      setActiveTab('my');
    } catch (e) {
      notify("Ошибка сохранения колоды");
    } finally {
      setSavingDeckId(null);
    }
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
    let spawnX = 200, spawnY = 150;
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      if (isField) { spawnX = container.scrollLeft + 50; spawnY = container.scrollTop + 50; }
      else {
        spawnX = container.scrollLeft + (container.clientWidth / 2) - (width / 2) + (Math.random() * 40 - 20);
        spawnY = container.scrollTop + (container.clientHeight / 2) - (height / 2) + (Math.random() * 40 - 20);
      }
    }
    const elem = { id, type, ...data, x: spawnX, y: spawnY, width, height, rotation: 0, isFlipped: type !== 'token' && type !== 'text' && !isField, zIndex: isField ? 0 : maxZ + 1, isLocked: false };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, id), elem);
  };

  const clearTable = async () => {
    if (!window.confirm("Очистить стол?")) return;
    try {
      const batch = writeBatch(db);
      cardsOnTable.forEach(card => { if (!card.isLocked) batch.delete(doc(db, 'artifacts', appId, 'public', 'data', `room_${roomId}`, card.id)); });
      await batch.commit();
      notify("Стол очищен");
    } catch (e) { notify("Ошибка при очистке стола"); }
  };

  // Загрузка колоды через uploadBytes (надёжно работает)
  const confirmUpload = async () => {
    if (pendingFiles.length === 0 || !tempDeckName.trim()) return notify("Укажите название колоды");
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const deckId = `deck_${Date.now()}`;
      const storagePath = isUploadingBase
        ? `artifacts/${appId}/public/base_decks/${deckId}`
        : `artifacts/${appId}/users/${user.uid}/decks/${deckId}`;

      const fileList = Array.from(pendingFiles);
      const backFile = fileList.find(f => f.name.toLowerCase().includes('рубашка'));
      const cardFiles = fileList.filter(f => !f.name.toLowerCase().includes('рубашка'))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      const total = fileList.length;
      let completed = 0;
      let backImage = null;
      const cardUrls = [];

      const onProgress = () => { completed++; setUploadProgress(Math.round((completed / total) * 100)); };

      // Загружаем рубашку
      if (backFile) {
        try {
          backImage = await uploadBlobToStorage(backFile, `${storagePath}/back.jpg`);
        } catch (e) { console.error("Ошибка рубашки:", e); }
        onProgress();
      }

      // Загружаем карты параллельно (5 одновременно)
      const CONCURRENCY = 5;
      let idx = 0;
      const worker = async () => {
        while (idx < cardFiles.length) {
          const i = idx++;
          const file = cardFiles[i];
          const safeId = String(i).padStart(3, '0');
          try {
            const url = await uploadBlobToStorage(file, `${storagePath}/card_${safeId}.jpg`);
            cardUrls[i] = url;
          } catch (e) { console.error(`Ошибка карты ${i}:`, e); }
          onProgress();
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

      const cards = cardUrls.filter(Boolean);
      setUploadProgress(100);

      if (cards.length === 0) { notify("Не удалось загрузить ни одной карты."); return; }

      const newDeck = {
        id: deckId,
        name: tempDeckName.trim(),
        cards,
        backImage: backImage || null,
        createdAt: Date.now(),
        cardCount: cards.length
      };

      if (isUploadingBase) {
        // Сохраняем как общую колоду в Firestore
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'base_decks', '_list');
        const snap = await getDoc(docRef);
        const current = snap.exists() && snap.data().decks ? snap.data().decks : [];
        await setDoc(docRef, { decks: [...current, { ...newDeck, isBaseDeck: true }] });
        notify(`Общая колода "${newDeck.name}" опубликована (${cards.length} карт) ✓`);
        setActiveTab('base');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), newDeck);
        notify(`Колода "${newDeck.name}" сохранена (${cards.length} карт) ✓`);
        setActiveTab('my');
      }
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      notify("Ошибка загрузки: " + err.message);
    } finally {
      setIsNamingDeck(false);
      setIsUploading(false);
      setUploadProgress(0);
      setTempDeckName("");
      setPendingFiles([]);
      setIsUploadingBase(false);
    }
  };

  const deleteBaseDeck = async (deckId) => {
    if (!isOwner) return;
    if (!window.confirm("Удалить эту общую колоду для всех?")) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'base_decks', '_list');
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().decks) {
        await setDoc(docRef, { decks: snap.data().decks.filter(d => d.id !== deckId) });
        notify("Общая колода удалена");
      }
    } catch (e) { notify("Ошибка удаления"); }
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
        let backImage = null; const cards = [];
        for (const file of files) {
          const url = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`;
          if (file.name.toLowerCase().includes('рубашка')) backImage = url;
          else cards.push(url);
        }
        if (cards.length === 0) return notify("Карты не найдены");
        const newDeck = { name, cards, backImage: backImage || null, createdAt: Date.now() };
        if (isDbConnected && user && !isClientMode) {
          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_decks'), newDeck);
          notify(`Колода "${name}": ${cards.length} карт ✓`);
          setActiveTab('my');
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
        setActiveTab('my');
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
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 space-y-8 relative z-10 text-center pb-12" style={{ color: COLORS.ink }}>
        <div className="relative">
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
              <button onClick={() => setShowKeyPrompt(true)} style={{ backgroundColor: COLORS.plum, color: 'white' }} className="w-full font-black py-5 rounded-2xl text-xs uppercase tracking-widest shadow-lg flex flex-col items-center gap-2 transition-all hover:opacity-90">
                <Key size={24} /> ВОЙТИ КАК ПСИХОЛОГ
              </button>
            ) : (
              <div className="space-y-3">
                <input type="text" value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Email" autoFocus className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center" style={{ borderColor: COLORS.plum, color: COLORS.plum, backgroundColor: `${COLORS.plum}10` }} />
                <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Пароль" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center" style={{ borderColor: COLORS.plum, color: COLORS.plum, backgroundColor: `${COLORS.plum}10` }} />
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowKeyPrompt(false)} className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors" style={{ color: `${COLORS.ink}80` }}>Назад</button>
                  <button onClick={handleLogin} disabled={isCheckingKey} style={{ backgroundColor: COLORS.forest, color: 'white' }} className="flex-[2] font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-md disabled:opacity-50">
                    {isCheckingKey ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Проверка...</span> : "Войти"}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <p className="font-bold text-[10px] uppercase text-center" style={{ color: `${COLORS.ink}80` }}>Представьтесь, чтобы зайти за стол:</p>
              <input type="text" value={clientNameInput} onChange={e => setClientNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleClientLogin()} placeholder="Ваше Имя" className="w-full px-6 py-3.5 rounded-2xl border-2 outline-none font-bold text-center" style={{ borderColor: COLORS.forest, color: COLORS.forest, backgroundColor: `${COLORS.forest}10` }} />
              <button onClick={handleClientLogin} style={{ backgroundColor: COLORS.forest, color: 'white' }} className="w-full font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-md transition-all hover:opacity-90">
                Войти в кабинет
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Что показывать на вкладке Общие
  const allBaseDecks = [...baseDecks, ...driveDecks];
  const myDecks = [...localDecks, ...cloudDecks];
  const displayDecks = activeTab === 'base' ? allBaseDecks : myDecks;
  const filteredDecks = searchQuery ? displayDecks.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())) : displayDecks;

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans select-none relative" style={{ backgroundColor: COLORS.haze }}>
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] text-white px-8 py-3 rounded-full shadow-2xl text-sm font-bold flex items-center gap-2 border" style={{ backgroundColor: COLORS.ink, borderColor: `${COLORS.plum}33` }}>
          <CheckCircle size={16} color={COLORS.terra} /> {notification}
        </div>
      )}

      {/* ШАПКА */}
      <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-3 bg-white/90 backdrop-blur-md border-b z-30 shadow-sm gap-2" style={{ borderColor: `${COLORS.ink}10` }}>
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundImage: `linear-gradient(to bottom right, ${COLORS.plum}, ${COLORS.forest})` }}>
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black leading-none uppercase flex items-center gap-2" style={{ color: COLORS.ink }}>
                {platformName}
                {!isClientMode && <button onClick={editPlatformName} className="transition-colors hover:opacity-70" style={{ color: COLORS.plum }}><Edit2 size={12} /></button>}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {isOwner && (
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1" style={{ backgroundColor: `${COLORS.plum}15`, color: COLORS.plum }}>
                    <Shield size={9} /> Владелец
                  </span>
                )}
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
              <label className="p-2.5 rounded-xl cursor-pointer border transition-all hover:opacity-80" style={{ backgroundColor: COLORS.haze, color: COLORS.forest, borderColor: `${COLORS.forest}20` }} title="Загрузить поле">
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  notify("Загрузка поля...", 10000);
                  try {
                    const url = await uploadFieldToStorage(f, `artifacts/${appId}/public/fields/field_${Date.now()}.jpg`);
                    await addElement('field', { img: url });
                    notify("Игровое поле загружено! ✓");
                  } catch (err) { notify("Ошибка загрузки поля: " + err.message); }
                  finally { e.target.value = ''; }
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
          <div className="fixed top-[120px] md:top-24 right-4 md:right-10 z-40 flex flex-col items-center gap-3 bg-white/60 backdrop-blur-md p-4 rounded-[2.5rem] shadow-xl border border-white pointer-events-auto">
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
            }} disabled={isAnimating} style={{ backgroundColor: COLORS.forest, color: 'white' }} className="px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-md hover:opacity-90 disabled:opacity-50">
              Бросить
            </button>
          </div>
        )}

        <div ref={scrollContainerRef} className="flex-1 overflow-auto custom-scrollbar relative bg-[#F2EFF5]">
          <div ref={boardRef} className="relative min-w-[3000px] min-h-[3000px] bg-transparent" onMouseMove={handleMouseMove} onTouchMove={handleMouseMove}>
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, ${COLORS.plum} 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>
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
                boardRef={boardRef}
              />
            ))}
            {Object.entries(cursors).map(([id, cur]) => (
              <div key={id} className="absolute pointer-events-none z-[2000] flex flex-col items-center transition-all duration-150 ease-out" style={{ left: cur.x, top: cur.y }}>
                <MousePointer2 size={24} fill={cur.color} color="white" strokeWidth={2} className="drop-shadow-md -rotate-12 transform -translate-x-2 -translate-y-2" />
                <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded mt-1 shadow-md" style={{ backgroundColor: cur.color }}>{cur.name || 'Гость'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* БИБЛИОТЕКА */}
        <div className={`fixed bottom-0 left-0 right-0 z-[60] transition-transform duration-700 pointer-events-none ${isLibraryOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'}`}>
          <div className={`bg-white/95 backdrop-blur-xl rounded-t-[3rem] shadow-2xl border-t border-gray-100 flex flex-col transition-all duration-500 pointer-events-auto ${isLibraryFullscreen ? 'h-[95vh]' : 'h-[85vh]'}`}>
            <div className="relative w-full flex justify-center py-2" style={{ color: COLORS.ink }}>
              <button onClick={toggleLibrary} className="flex flex-col items-center gap-1 w-full cursor-pointer hover:opacity-70 transition-opacity">
                <ChevronUp size={24} className={`transition-transform duration-500 ${isLibraryOpen ? 'rotate-180' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none text-gray-500">
                  {isClientMode ? "Выбор карты" : "Библиотека колод"}
                </span>
              </button>
              {isLibraryOpen && !isClientMode && (
                <button onClick={toggleFullscreen} className="absolute right-8 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors hover:bg-gray-100 text-gray-500">
                  <Maximize2 size={20} />
                </button>
              )}
            </div>

            <div className="flex flex-1 flex-col px-4 pb-4 md:px-8 md:pb-6 pt-0 min-h-0 overflow-hidden max-w-7xl mx-auto w-full">
              {!isClientMode ? (
                isBrowsingDecks ? (
                  /* ШАГ 1: ВЫБОР КОЛОДЫ */
                  <div className="flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-center mb-3 text-gray-800">Выбор колоды</h2>
                    <div className="flex flex-col md:flex-row gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск колоды..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none text-gray-700 bg-white focus:border-gray-400 transition-colors" />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {/* Кнопка загрузки Общей колоды — только для Юлии */}
                        {activeTab === 'base' && isOwner && (
                          <label className="text-white px-5 py-3 rounded-xl font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 whitespace-nowrap text-sm" style={{ backgroundColor: COLORS.plum }}>
                            <Shield size={16} /> Загрузить общую колоду
                            <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                              const files = Array.from(e.target.files);
                              if (!files.length) return;
                              setIsUploadingBase(true);
                              setPendingFiles(files);
                              setIsNamingDeck(true);
                              e.target.value = '';
                            }} />
                          </label>
                        )}
                        {/* Кнопка загрузки своей колоды */}
                        {activeTab === 'my' && (
                          <label className="text-white px-5 py-3 rounded-xl font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 whitespace-nowrap text-sm" style={{ backgroundColor: COLORS.green }}>
                            <Plus size={16} /> Загрузить свою колоду
                            <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                              const files = Array.from(e.target.files);
                              if (!files.length) return;
                              setIsUploadingBase(false);
                              setPendingFiles(files);
                              setIsNamingDeck(true);
                              e.target.value = '';
                            }} />
                          </label>
                        )}
                        {activeTab === 'my' && (
                          <button onClick={addDeckByLinks} className="px-5 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm whitespace-nowrap">
                            <LinkIcon size={16} /> Ссылка (Диск)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Вкладки */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-4">
                      <button onClick={() => setActiveTab('base')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'base' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-800'}`}>
                        Общие колоды
                      </button>
                      <button onClick={() => setActiveTab('my')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'my' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-800'}`}>
                        Мои колоды
                      </button>
                    </div>

                    {/* Сетка колод */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8">
                      {(activeTab === 'base' && isBaseDecksLoading) && (
                        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                          <Loader2 size={24} className="animate-spin" style={{ color: COLORS.plum }} />
                          <span className="font-bold text-sm">Загружаю колоды из Google Drive...</span>
                        </div>
                      )}
                      {filteredDecks.length === 0 && !(activeTab === 'base' && isBaseDecksLoading) ? (
                        <div className="text-center py-16">
                          <Layers size={48} className="mx-auto mb-4 opacity-20" />
                          <p className="text-gray-400 font-bold">
                            {activeTab === 'base' ? 'Общих колод пока нет' : 'У вас нет личных колод'}
                          </p>
                          {activeTab === 'base' && (
                            <p className="text-gray-300 text-sm mt-2">Колоды загружаются из Google Drive или добавляются владельцем</p>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                          {filteredDecks.map(deck => (
                            <div key={deck.id} className="aspect-[2.5/3.5] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all relative group flex flex-col">
                              <div onClick={() => selectDeck(deck)} className="w-full h-full">
                                {deck.backImage ? (
                                  <img src={deck.backImage} className="w-full h-full object-cover" alt={deck.name} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                    <Layers size={40} />
                                  </div>
                                )}
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-12 pointer-events-none">
                                <p className="text-white font-bold text-[11px] leading-tight text-center drop-shadow-md">{deck.name}</p>
                                {deck.source === 'drive' && <p className="text-white/60 text-[9px] text-center">Google Drive</p>}
                              </div>
                              {deck.savedFromBase && (
                                <div className="absolute top-2 left-2 bg-white/90 rounded-lg px-1.5 py-0.5 text-[8px] font-black uppercase" style={{ color: COLORS.forest }}>Из общих</div>
                              )}
                              <div className="absolute top-2 right-2 flex flex-col gap-1">
                                {/* Кнопка "Сохранить в Мои" на вкладке Общие */}
                                {activeTab === 'base' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); saveBaseDeckToMine(deck); }}
                                    disabled={savingDeckId === deck.id}
                                    className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 backdrop-blur-sm rounded-lg transition-all shadow-sm hover:bg-green-50"
                                    style={{ color: COLORS.forest }} title="Сохранить в Мои колоды"
                                  >
                                    {savingDeckId === deck.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                  </button>
                                )}
                                {/* Удалить общую — только владелец, и только если из Firebase (не Drive) */}
                                {activeTab === 'base' && isOwner && !deck.source && (
                                  <button onClick={(e) => { e.stopPropagation(); deleteBaseDeck(deck.id); }} className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:bg-red-50 transition-all shadow-sm" title="Удалить">
                                    <Trash2 size={16} />
                                  </button>
                                )}
                                {/* Удалить свою */}
                                {activeTab === 'my' && (
                                  <button onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm("Удалить колоду?")) {
                                      if (localDecks.some(d => d.id === deck.id)) setLocalDecks(p => p.filter(d => d.id !== deck.id));
                                      else deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'saved_decks', deck.id));
                                      notify("Удалено");
                                    }
                                  }} className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:bg-red-50 transition-all shadow-sm">
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeDeckData ? (
                  /* ШАГ 2: КАРТЫ ВНУТРИ КОЛОДЫ */
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0 border-b pb-3 border-gray-100">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setIsBrowsingDecks(true)} className="flex items-center gap-2 font-bold hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors text-gray-700">
                          <ArrowLeft size={18} /> К списку
                        </button>
                        <span className="text-xl font-black uppercase text-gray-800 hidden sm:block">{activeDeckData.name}</span>
                      </div>
                      <button onClick={toggleDeckFlip} style={{ backgroundColor: COLORS.plum, color: 'white' }} className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:opacity-90 transition-all">
                        {isLibraryDeckFlipped ? "Скрыть карты" : "Открыть колоду"}
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex gap-6 content-start flex-wrap pb-8 pr-2">
                      <button onClick={() => {
                        const array = new Uint32Array(1);
                        window.crypto.getRandomValues(array);
                        addElement('card', { img: activeDeckData.cards[array[0] % activeDeckData.cards.length], backImg: activeDeckData.backImage });
                        if (isLibraryFullscreen) toggleLibrary();
                      }} className="flex-shrink-0 w-28 h-40 md:w-36 md:h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm border-gray-300 text-gray-500">
                        <Plus size={36} /><span className="text-[10px] font-black uppercase">Наугад</span>
                      </button>
                      {activeDeckData.cards.map((img, idx) => (
                        <button key={idx} onClick={() => { addElement('card', { img, backImg: activeDeckData.backImage }); if (isLibraryFullscreen) toggleLibrary(); }}
                          className="relative flex-shrink-0 h-40 md:h-52 w-auto rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center bg-white border border-gray-100 overflow-hidden">
                          {isLibraryDeckFlipped
                            ? <img src={img} className="h-full w-auto min-w-[7rem] object-cover" alt={`Карта ${idx + 1}`} />
                            : <div className="h-full w-28 md:w-36 flex items-center justify-center relative bg-gray-50">
                              {activeDeckData.backImage
                                ? <img src={activeDeckData.backImage} className="w-full h-full object-cover absolute inset-0" alt="Рубашка" />
                                : <Layers size={32} className="text-gray-300" />}
                            </div>}
                          <div className="absolute top-2 left-2 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm z-10 pointer-events-none bg-black/50 backdrop-blur-sm">{idx + 1}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null
              ) : (
                /* ПАНЕЛЬ КЛИЕНТА */
                <div className="flex-1 flex flex-col overflow-hidden">
                  {activeDeckData ? (
                    <div className="flex flex-col h-full">
                      <div className="mb-4 flex-shrink-0 border-b pb-3 border-gray-100 text-center">
                        <span className="text-xl font-black uppercase text-gray-800">{activeDeckData.name}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar flex gap-6 content-start justify-center flex-wrap pb-8 pr-2">
                        <button onClick={() => {
                          const array = new Uint32Array(1);
                          window.crypto.getRandomValues(array);
                          addElement('card', { img: activeDeckData.cards[array[0] % activeDeckData.cards.length], backImg: activeDeckData.backImage });
                          if (isLibraryFullscreen) toggleLibrary();
                        }} className="flex-shrink-0 w-28 h-40 md:w-36 md:h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-all border-gray-300 text-gray-500">
                          <Plus size={36} /><span className="text-[10px] font-black uppercase">Вытянуть</span>
                        </button>
                        {activeDeckData.cards.map((img, idx) => (
                          <button key={idx} onClick={() => { addElement('card', { img, backImg: activeDeckData.backImage }); if (isLibraryFullscreen) toggleLibrary(); }}
                            className="relative flex-shrink-0 h-40 md:h-52 w-auto rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center bg-white border border-gray-100 overflow-hidden">
                            {isLibraryDeckFlipped
                              ? <img src={img} className="h-full w-auto min-w-[7rem] object-cover" alt={`Карта ${idx + 1}`} />
                              : <div className="h-full w-28 md:w-36 flex items-center justify-center relative bg-gray-50">
                                {activeDeckData.backImage
                                  ? <img src={activeDeckData.backImage} className="w-full h-full object-cover absolute inset-0" alt="Рубашка" />
                                  : <Layers size={32} className="text-gray-300" />}
                              </div>}
                            <div className="absolute top-2 left-2 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm z-10 pointer-events-none bg-black/50 backdrop-blur-sm">{idx + 1}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-center px-4">
                      Психолог выбирает колоду...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* МОДАЛЬНОЕ ОКНО НАЗВАНИЯ КОЛОДЫ */}
      {isNamingDeck && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm p-4" style={{ backgroundColor: `${COLORS.ink}CC` }}>
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl border-4" style={{ borderColor: COLORS.haze }}>
            <h3 className="text-xl font-black mb-2 uppercase italic" style={{ color: COLORS.ink }}>ИМЯ КОЛОДЫ</h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-4 text-[10px] font-black uppercase tracking-widest"
              style={{ backgroundColor: isUploadingBase ? `${COLORS.plum}15` : `${COLORS.green}15`, color: isUploadingBase ? COLORS.plum : COLORS.green }}>
              {isUploadingBase ? <><Shield size={12} /> Общая колода — для всех психологов</> : <><UserCircle size={12} /> Моя колода — только для вас</>}
            </div>
            <p className="text-[10px] mb-6 font-medium" style={{ color: `${COLORS.ink}66` }}>
              Выбрано файлов: {pendingFiles.length}. Файл с «рубашка» в названии станет обложкой.
            </p>
            <input
              autoFocus value={tempDeckName}
              onChange={e => setTempDeckName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmUpload()}
              placeholder="Напр: Эмоции"
              className="w-full px-6 py-4 rounded-2xl border-2 mb-8 outline-none font-bold focus:border-gray-400 transition-colors"
              style={{ borderColor: COLORS.haze, color: COLORS.ink }}
            />
            {isUploading && (
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold mb-2" style={{ color: `${COLORS.ink}66` }}>
                  <span>{uploadProgress < 100 ? `Загружаю карты... ${uploadProgress}%` : "Сохраняю колоду..."}</span>
                  <span className="font-black" style={{ color: isUploadingBase ? COLORS.plum : COLORS.green }}>{uploadProgress}%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${COLORS.ink}10` }}>
                  <div className="h-full rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%`, backgroundColor: isUploadingBase ? COLORS.plum : COLORS.green }} />
                </div>
                <p className="text-center text-[9px] mt-2 opacity-40 font-medium">Не закрывайте вкладку браузера</p>
              </div>
            )}
            <div className="flex gap-4">
              <button onClick={() => { setIsNamingDeck(false); setPendingFiles([]); setIsUploadingBase(false); }} disabled={isUploading} className="flex-1 font-bold uppercase text-xs hover:opacity-70 transition-colors disabled:opacity-30 text-gray-500">Отмена</button>
              <button onClick={confirmUpload} disabled={isUploading || !tempDeckName.trim()} style={{ backgroundColor: isUploadingBase ? COLORS.plum : COLORS.green, color: 'white' }} className="flex-[2] py-4 rounded-2xl font-black shadow-lg uppercase text-xs disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2">
                {isUploading ? <><Loader2 size={14} className="animate-spin" /> {uploadProgress}%</> : "Готово"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ПРЕДПРОСМОТР КАРТЫ */}
      {previewCard && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: `${COLORS.ink}F2` }} onClick={() => setPreviewCard(null)}>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white font-black tracking-widest uppercase bg-black/50 px-6 py-2 rounded-full backdrop-blur-md text-xs text-center w-[90%] md:w-auto shadow-lg">
            {previewCard.isFlipped ? "Эта карта открыта для всех" : "Эту карту сейчас видите только вы"}
          </div>
          <button className="absolute top-6 right-6 text-white p-3 rounded-full transition-all hover:bg-white/20 bg-white/10 backdrop-blur-md shadow-lg"><X size={32} /></button>
          <img src={previewCard.img} className="max-h-[85vh] max-w-[90vw] h-auto w-auto rounded-2xl shadow-2xl bg-white object-contain" style={{ animation: 'scaleIn 0.2s ease-out' }} alt="Карта" />
        </div>
      )}

      <style>{`
        .backface-hidden { backface-visibility: hidden; }
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 50, 82, 0.2); border-radius: 10px; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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
    if (isResizing || isLocked) return;
    if (isField && isClientMode) return;
    if (isText && e.target.tagName.toLowerCase() === 'textarea') return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setIsDragging(true); hasMoved.current = false; clickTimestamp.current = Date.now();
    initialMousePos.current = { x: cx, y: cy };
    startPos.current = { x: cx - element.x, y: cy - element.y };
    if (!isField) onUpdate({ zIndex: maxZIndex + 1 });
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    if (isLocked || (isField && isClientMode)) return;
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
      window.removeEventListener('touchmove', move); window.removeEventListener('touchend', end);
    };
  }, [isDragging, isResizing, element, onUpdate, playSound, isMuted, isLocked, isText]);

  return (
    <div
      className={`absolute group touch-none ${isDragging ? 'z-[1000]' : ''}`}
      style={{ left: element.x, top: element.y, width: element.width, height: element.height, zIndex: isField ? 0 : (element.zIndex || 1), transform: `rotate(${element.rotation}deg)`, transition: (isDragging || isResizing) ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
    >
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white/95 backdrop-blur-sm rounded-xl px-1.5 py-1 shadow-xl z-20 border border-gray-100">
        {!isField && <button onClick={(e) => { e.stopPropagation(); onUpdate({ zIndex: maxZIndex + 1 }); }} className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 text-gray-600" title="На передний план"><ArrowUp size={14} /></button>}
        {element.type === 'card' && !element.isFlipped && (
          <button onClick={(e) => {
            e.stopPropagation();
            if (!element.owner) { if (isClientMode) onUpdate({ owner: currentUser?.uid, ownerName: currentUserName || 'Игрок' }); onPreview(); }
            else if (element.owner === currentUser?.uid || !isClientMode) onPreview();
            else onNotify(`Эта карта принадлежит: ${element.ownerName}. Подсматривать нельзя! 🤫`);
          }} className="p-1.5 rounded-lg transition-colors hover:opacity-70 font-bold" style={{ color: COLORS.forest, backgroundColor: `${COLORS.forest}20` }} title="Подсмотреть">
            <Eye size={14} />
          </button>
        )}
        {element.type === 'card' && (
          <button onClick={(e) => {
            e.stopPropagation();
            if (element.owner && element.owner !== currentUser?.uid && isClientMode) { onNotify(`Только ${element.ownerName} или Психолог могут перевернуть карту`); return; }
            playSound('flip', isMuted); onUpdate({ isFlipped: !element.isFlipped });
          }} className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 text-gray-600" title="Перевернуть"><RefreshCw size={14} /></button>
        )}
        {(isField || (element.type === 'card' && element.isFlipped)) && (
          <button onClick={(e) => { e.stopPropagation(); onPreview(); }} className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 text-gray-600" title="На весь экран"><Maximize2 size={14} /></button>
        )}
        {(!isClientMode || !isField) && (
          <button onClick={(e) => { e.stopPropagation(); onUpdate({ rotation: (element.rotation + 90) % 360 }); }} className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 text-gray-600" title="Повернуть"><RotateCw size={14} /></button>
        )}
        {!isClientMode && (
          <button onClick={(e) => { e.stopPropagation(); onUpdate({ isLocked: !isLocked }); }} className="p-1.5 rounded-lg transition-colors hover:bg-gray-100" style={{ color: isLocked ? COLORS.terra : '#4B5563' }} title={isLocked ? "Открепить" : "Закрепить"}>
            {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
        )}
        {!isClientMode && <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1.5 rounded-lg transition-colors hover:bg-red-50 text-red-500" title="Удалить"><Trash2 size={14} /></button>}
      </div>

      <div
        className={`w-full h-full relative ${isLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} transition-transform ${isDragging ? 'scale-105 shadow-2xl' : isField ? '' : 'shadow-lg'} ${isText ? 'rounded-lg bg-[#FFF9C4] border-2 border-[#FDE047] flex flex-col overflow-hidden' : 'rounded-2xl bg-white'}`}
        onMouseDown={handleDragStart} onTouchStart={handleDragStart}
        style={{ perspective: '1000px' }}
      >
        {isText ? (
          <>
            <div className="w-full h-6 bg-[#FDE047] border-b border-[#EAB308] flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing">
              <div className="flex gap-1 opacity-50"><div className="w-1 h-1 rounded-full bg-black" /><div className="w-1 h-1 rounded-full bg-black" /><div className="w-1 h-1 rounded-full bg-black" /></div>
            </div>
            <textarea className="flex-1 w-full p-2.5 bg-transparent resize-none outline-none text-[13px] font-bold text-gray-800 custom-scrollbar" value={element.text || ''} onChange={(e) => onUpdate({ text: e.target.value })} placeholder="Заметка..." />
          </>
        ) : element.type === 'token' ? (
          <div className="w-full h-full rounded-full shadow-inner border-2 border-white" style={{ backgroundColor: element.color }} />
        ) : (
          <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-100" style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s ease', transform: element.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
            <div className="absolute inset-0 bg-white flex items-center justify-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
              <img src={element.img} className="w-full h-full object-contain pointer-events-none" alt="Карта" />
            </div>
            {!isField && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundImage: `linear-gradient(to bottom right, ${COLORS.forest}, ${COLORS.ink})` }}>
                {element.backImg
                  ? <img src={element.backImg} className="w-full h-full object-cover pointer-events-none" alt="Рубашка" />
                  : <div className="flex flex-col items-center justify-center gap-1 opacity-20"><Layers size={32} className="text-white" /><span className="text-[8px] text-white font-black uppercase tracking-tighter leading-none">MAK SPACE</span></div>}
              </div>
            )}
          </div>
        )}
      </div>

      {(!isLocked && (!isClientMode || !isField)) && (
        <div onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} className="absolute -bottom-2 -right-2 w-8 h-8 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-30 drop-shadow-md bg-white/80 backdrop-blur-sm rounded-full scale-75 hover:scale-100 shadow-lg" style={{ color: COLORS.plum }}>
          <Move size={14} />
        </div>
      )}

      {element.owner && element.type === 'card' && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[9px] font-bold px-3 py-0.5 rounded-full z-10 whitespace-nowrap shadow-md pointer-events-none flex items-center gap-1">
          <UserCircle size={10} /> {element.ownerName}
        </div>
      )}
    </div>
  );
}
