"use client"

import { createContext, useContext } from "react"

export type Language = {
  code: string
  name: string
  flag: string
}

export const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
]

export type Translations = {
  [key: string]: {
    [key: string]: string
  }
}

// Translations for all supported languages
export const translations: Translations = {
  en: {
    // App
    appName: "MoodPlaylist",
    appDescription: "Generate personalized music playlists based on your mood, powered by AI",

    // Mood selector
    selectMood: "Select your mood",
    happy: "Happy",
    chill: "Chill",
    energetic: "Energetic",
    melancholic: "Melancholic",
    focus: "Focus",
    romantic: "Romantic",
    angry: "Angry",
    sleepy: "Sleepy",

    // Duration slider
    playlistDuration: "Playlist duration",
    minutes: "min",
    hour: "hr",

    // Filters
    advancedFilters: "Advanced filters",
    bpmRange: "BPM Range",
    energyLevel: "Energy Level",
    genres: "Genres",

    // Generate button
    generatePlaylist: "Generate Playlist",
    generating: "Generating...",

    // Auth
    connectAccounts: "Connect Your Accounts",
    connectedAccounts: "Connected Accounts",
    connectSpotify: "Connect with Spotify",
    connectYouTube: "Connect with YouTube",
    disconnectSpotify: "Disconnect Spotify",
    disconnectYouTube: "Disconnect YouTube",
    connected: "Connected",
    spotifyAccountConnected: "Your Spotify account is connected",
    youtubeAccountConnected: "Your YouTube account is connected",
    spotifyUser: "Spotify User",
    authRequired: "Authentication Required",
    youtubeAuthRequired: "You need to connect your YouTube account to search for videos",

    // Playlist display
    noPlaylist: "No playlist generated yet",
    noPlaylistDesc:
      'Select your mood and preferences, then click "Generate Playlist" to create your personalized music experience.',
    playlist: "Playlist",
    songs: "songs",
    shuffle: "Shuffle",
    saveToSpotify: "Save to Spotify",

    // Music player
    musicPlayer: "Music Player",
    connectYouTubeAccount: "Connect your YouTube account to play videos",
    selectVideoToPlay: "Select a video to play",
    search: "Search",
    searching: "Searching...",
    searchYouTube: "Search YouTube videos...",
    noResults: "No results found",
    history: "History",
    noHistory: "No watch history",
    searchError: "Search Error",
    youtubeSearchError: "Failed to search YouTube videos. Please try again.",
    playbackError: "Playback Error",
    youtubePlaybackError: "Failed to play the video. Please try another one.",
    // Nouvelles traductions pour l'anglais
    nowPlayingFromPlaylist: "Now playing from playlist",
    selectSongFromPlaylist: "Select a song from the playlist",
    connectToPlay: "Connect to Play",
    connectYouTubeToPlaySongs: "Connect your YouTube account to play songs from this playlist",
    playSong: "Play Song",
    addToPlaylist: "Add to Playlist",
    viewArtist: "View Artist",
    likeSong: "Like song",
    unlikeSong: "Unlike song",
    deleteSong: "Delete Song",
    deleteSongConfirmTitle: "Delete Song",
    deleteSongConfirmDescription: 'Are you sure you want to delete "{title}" by {artist} from your playlist?',
    delete: "Delete",
    cancel: "Cancel",
    songDeleted: "Song deleted from playlist",
    repeatEnabled: "Repeat playlist: On",
    repeatDisabled: "Repeat playlist: Off",
    songAdded: "Song Added",
    songAddedToPlaylist: "{title} has been added to your playlist",
    generatePlaylistFirst: "Please generate a playlist first before adding songs",

    // Language
    language: "Language",

    // Theme
    theme: "Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",

    // Alerts
    playlistFillAlert:
      "This playlist fills {percentage}% of your requested {duration} minute duration. Connect to a music service for more songs.",

    // Block titles
    moodAndFilters: "Mood & Filters",
    yourPlaylist: "Your Playlist",

    // Drag and drop
    dragToReorder: "Drag to reorder",
    songReordered: "Song reordered",
    playlistReordered: "Playlist reordered",
  },
  fr: {
    // App
    appName: "MoodPlaylist",
    appDescription: "Générez des playlists musicales personnalisées selon votre humeur, alimentées par l'IA",

    // Mood selector
    selectMood: "Sélectionnez votre humeur",
    happy: "Joyeux",
    chill: "Détendu",
    energetic: "Énergique",
    melancholic: "Mélancolique",
    focus: "Concentration",
    romantic: "Romantique",
    angry: "En colère",
    sleepy: "Somnolent",

    // Duration slider
    playlistDuration: "Durée de la playlist",
    minutes: "min",
    hour: "h",

    // Filters
    advancedFilters: "Filtres avancés",
    bpmRange: "Plage de BPM",
    energyLevel: "Niveau d'énergie",
    genres: "Genres",

    // Generate button
    generatePlaylist: "Générer la Playlist",
    generating: "Génération en cours...",

    // Auth
    connectAccounts: "Connectez vos comptes",
    connectedAccounts: "Comptes connectés",
    connectSpotify: "Connecter avec Spotify",
    connectYouTube: "Connecter avec YouTube",
    disconnectSpotify: "Déconnecter Spotify",
    disconnectYouTube: "Déconnecter YouTube",
    connected: "Connecté",
    spotifyAccountConnected: "Votre compte Spotify est connecté",
    youtubeAccountConnected: "Votre compte YouTube est connecté",
    spotifyUser: "Utilisateur Spotify",
    authRequired: "Authentification Requise",
    youtubeAuthRequired: "Vous devez connecter votre compte YouTube pour rechercher des vidéos",

    // Playlist display
    noPlaylist: "Aucune playlist générée",
    noPlaylistDesc:
      'Sélectionnez votre humeur et vos préférences, puis cliquez sur "Générer la Playlist" pour créer votre expérience musicale personnalisée.',
    playlist: "Playlist",
    songs: "morceaux",
    shuffle: "Aléatoire",
    saveToSpotify: "Enregistrer sur Spotify",

    // Music player
    musicPlayer: "Lecteur de musique",
    connectYouTubeAccount: "Connectez votre compte YouTube pour lire des vidéos",
    selectVideoToPlay: "Sélectionnez une vidéo à lire",
    search: "Rechercher",
    searching: "Recherche en cours...",
    searchYouTube: "Rechercher des vidéos YouTube...",
    noResults: "Aucun résultat trouvé",
    history: "Historique",
    noHistory: "Aucun historique de visionnage",
    searchError: "Erreur de recherche",
    youtubeSearchError: "Échec de la recherche de vidéos YouTube. Veuillez réessayer.",
    playbackError: "Erreur de lecture",
    youtubePlaybackError: "Échec de la lecture de la vidéo. Veuillez en essayer une autre.",
    // Nouvelles traductions pour le français
    nowPlayingFromPlaylist: "Lecture depuis la playlist",
    selectSongFromPlaylist: "Sélectionnez un morceau de la playlist",
    connectToPlay: "Connecter pour lire",
    connectYouTubeToPlaySongs: "Connectez votre compte YouTube pour lire les morceaux de cette playlist",
    playSong: "Lire le morceau",
    addToPlaylist: "Ajouter à la playlist",
    viewArtist: "Voir l'artiste",
    likeSong: "Aimer le morceau",
    unlikeSong: "Ne plus aimer le morceau",
    deleteSong: "Supprimer le morceau",
    deleteSongConfirmTitle: "Supprimer le morceau",
    deleteSongConfirmDescription: 'Êtes-vous sûr de vouloir supprimer "{title}" par {artist} de votre playlist ?',
    delete: "Supprimer",
    cancel: "Annuler",
    songDeleted: "Morceau supprimé de la playlist",
    repeatEnabled: "Répéter la playlist: Activé",
    repeatDisabled: "Répéter la playlist: Désactivé",
    songAdded: "Morceau ajouté",
    songAddedToPlaylist: "{title} a été ajouté à votre playlist",
    generatePlaylistFirst: "Veuillez d'abord générer une playlist avant d'ajouter des morceaux",

    // Language
    language: "Langue",

    // Theme
    theme: "Thème",
    lightMode: "Mode clair",
    darkMode: "Mode sombre",

    // Alerts
    playlistFillAlert:
      "Cette playlist remplit {percentage}% des {duration} minutes demandées. Connectez un service de musique pour plus de chansons.",

    // Block titles
    moodAndFilters: "Humeur et filtres",
    yourPlaylist: "Votre playlist",

    // Drag and drop
    dragToReorder: "Glisser pour réorganiser",
    songReordered: "Morceau réorganisé",
    playlistReordered: "Playlist réorganisée",
  },
  // Keep other languages as they were...
  es: {
    // App
    appName: "MoodPlaylist",
    appDescription: "Genera listas de reproducción personalizadas según tu estado de ánimo, impulsadas por IA",

    // Mood selector
    selectMood: "Selecciona tu estado de ánimo",
    happy: "Feliz",
    chill: "Relajado",
    energetic: "Enérgico",
    melancholic: "Melancólico",
    focus: "Concentración",
    romantic: "Romántico",
    angry: "Enfadado",
    sleepy: "Soñoliento",

    // Duration slider
    playlistDuration: "Duración de la lista",
    minutes: "min",
    hour: "h",

    // Filters
    advancedFilters: "Filtros avanzados",
    bpmRange: "Rango de BPM",
    energyLevel: "Nivel de energía",
    genres: "Géneros",

    // Generate button
    generatePlaylist: "Generar Lista",
    generating: "Generando...",

    // Auth
    connectAccounts: "Conecta tus cuentas",
    connectedAccounts: "Cuentas conectadas",
    connectSpotify: "Conectar con Spotify",
    connectYouTube: "Conectar con YouTube",
    disconnectSpotify: "Desconectar Spotify",
    disconnectYouTube: "Desconectar YouTube",
    connected: "Conectado",
    spotifyAccountConnected: "Tu cuenta de Spotify está conectada",
    youtubeAccountConnected: "Tu cuenta de YouTube está conectada",
    spotifyUser: "Usuario de Spotify",
    authRequired: "Autenticación Requerida",
    youtubeAuthRequired: "Necesitas conectar tu cuenta de YouTube para buscar videos",

    // Playlist display
    noPlaylist: "No hay lista de reproducción generada",
    noPlaylistDesc:
      'Selecciona tu estado de ánimo y preferencias, luego haz clic en "Generar Lista" para crear tu experiencia musical personalizada.',
    playlist: "Lista",
    songs: "canciones",
    shuffle: "Aleatorio",
    saveToSpotify: "Guardar en Spotify",

    // Music player
    musicPlayer: "Reproductor de música",
    connectYouTubeAccount: "Conecta tu cuenta de YouTube para reproducir videos",
    selectVideoToPlay: "Selecciona un video para reproducir",
    search: "Buscar",
    searching: "Buscando...",
    searchYouTube: "Buscar videos de YouTube...",
    noResults: "No se encontraron resultados",
    history: "Historial",
    noHistory: "Sin historial de visualización",
    searchError: "Error de búsqueda",
    youtubeSearchError: "Error al buscar videos de YouTube. Inténtalo de nuevo.",
    playbackError: "Error de reproducción",
    youtubePlaybackError: "Error al reproducir el video. Prueba con otro.",
    likeSong: "Me gusta esta canción",
    unlikeSong: "Ya no me gusta esta canción",
    repeatEnabled: "Repetir lista: Activado",
    repeatDisabled: "Repetir lista: Desactivado",
    songAdded: "Canción añadida",
    songAddedToPlaylist: "{title} ha sido añadida a tu lista de reproducción",
    generatePlaylistFirst: "Por favor, genera una lista de reproducción antes de añadir canciones",

    // Language
    language: "Idioma",

    // Theme
    theme: "Tema",
    lightMode: "Modo claro",
    darkMode: "Modo oscuro",

    // Alerts
    playlistFillAlert:
      "Esta lista de reproducción cubre el {percentage}% de los {duration} minutos solicitados. Conecta un servicio de música para más canciones.",

    // Block titles
    moodAndFilters: "Estado de ánimo y filtros",
    yourPlaylist: "Tu lista de reproducción",

    // Drag and drop
    dragToReorder: "Arrastra para reordenar",
    songReordered: "Canción reordenada",
    playlistReordered: "Lista reordenada",
  },
  de: {
    // App
    appName: "MoodPlaylist",
    appDescription: "Generiere personalisierte Musikplaylists basierend auf deiner Stimmung, unterstützt durch KI",

    // Mood selector
    selectMood: "Wähle deine Stimmung",
    happy: "Glücklich",
    chill: "Entspannt",
    energetic: "Energiegeladen",
    melancholic: "Melancholisch",
    focus: "Fokussiert",
    romantic: "Romantisch",
    angry: "Wütend",
    sleepy: "Schläfrig",

    // Duration slider
    playlistDuration: "Playlist-Dauer",
    minutes: "Min",
    hour: "Std",

    // Filters
    advancedFilters: "Erweiterte Filter",
    bpmRange: "BPM-Bereich",
    energyLevel: "Energie-Level",
    genres: "Genres",

    // Generate button
    generatePlaylist: "Playlist erstellen",
    generating: "Wird erstellt...",

    // Auth
    connectAccounts: "Verbinde deine Konten",
    connectedAccounts: "Verbundene Konten",
    connectSpotify: "Mit Spotify verbinden",
    connectYouTube: "Mit YouTube verbinden",
    disconnectSpotify: "Spotify trennen",
    disconnectYouTube: "YouTube trennen",
    connected: "Verbunden",
    spotifyAccountConnected: "Dein Spotify-Konto ist verbunden",
    youtubeAccountConnected: "Dein YouTube-Konto ist verbunden",
    spotifyUser: "Spotify-Benutzer",
    authRequired: "Authentifizierung erforderlich",
    youtubeAuthRequired: "Du musst dein YouTube-Konto verbinden, um Videos zu suchen",

    // Playlist display
    noPlaylist: "Noch keine Playlist erstellt",
    noPlaylistDesc:
      'Wähle deine Stimmung und Präferenzen, dann klicke auf "Playlist erstellen" um dein personalisiertes Musikerlebnis zu erstellen.',
    playlist: "Playlist",
    songs: "Lieder",
    shuffle: "Zufallswiedergabe",
    saveToSpotify: "Bei Spotify speichern",

    // Music player
    musicPlayer: "Musik-Player",
    connectYouTubeAccount: "Verbinde dein YouTube-Konto, um Videos abzuspielen",
    selectVideoToPlay: "Wähle ein Video zum Abspielen",
    search: "Suchen",
    searching: "Suche läuft...",
    searchYouTube: "YouTube-Videos suchen...",
    noResults: "Keine Ergebnisse gefunden",
    history: "Verlauf",
    noHistory: "Kein Wiedergabeverlauf",
    searchError: "Suchfehler",
    youtubeSearchError: "Fehler bei der Suche nach YouTube-Videos. Bitte versuche es erneut.",
    playbackError: "Wiedergabefehler",
    youtubePlaybackError: "Fehler beim Abspielen des Videos. Bitte versuche ein anderes.",
    likeSong: "Lied liken",
    unlikeSong: "Like entfernen",
    repeatEnabled: "Playlist wiederholen: An",
    repeatDisabled: "Playlist wiederholen: Aus",
    songAdded: "Lied hinzugefügt",
    songAddedToPlaylist: "{title} wurde zu deiner Playlist hinzugefügt",
    generatePlaylistFirst: "Bitte erstelle zuerst eine Playlist, bevor du Lieder hinzufügst",

    // Language
    language: "Sprache",

    // Theme
    theme: "Thema",
    lightMode: "Heller Modus",
    darkMode: "Dunkler Modus",

    // Alerts
    playlistFillAlert:
      "Diese Playlist füllt {percentage}% der angeforderten {duration} Minuten. Verbinde einen Musikdienst für mehr Lieder.",

    // Block titles
    moodAndFilters: "Stimmung & Filter",
    yourPlaylist: "Deine Playlist",

    // Drag and drop
    dragToReorder: "Ziehen zum Neuordnen",
    songReordered: "Lied neu angeordnet",
    playlistReordered: "Playlist neu angeordnet",
  },
  ja: {
    // App
    appName: "MoodPlaylist",
    appDescription: "AIを活用して、あなたの気分に合わせたパーソナライズされた音楽プレイリストを生成します",

    // Mood selector
    selectMood: "気分を選択",
    happy: "ハッピー",
    chill: "リラックス",
    energetic: "エネルギッシュ",
    melancholic: "メランコリック",
    focus: "集中",
    romantic: "ロマンチック",
    angry: "怒り",
    sleepy: "眠気",

    // Duration slider
    playlistDuration: "プレイリストの長さ",
    minutes: "分",
    hour: "時間",

    // Filters
    advancedFilters: "詳細フィルター",
    bpmRange: "BPM範囲",
    energyLevel: "エネルギーレベル",
    genres: "ジャンル",

    // Generate button
    generatePlaylist: "プレイリストを生成",
    generating: "生成中...",

    // Auth
    connectAccounts: "アカウントを接続",
    connectedAccounts: "接続済みアカウント",
    connectSpotify: "Spotifyと接続",
    connectYouTube: "YouTubeと接続",
    disconnectSpotify: "Spotifyを切断",
    disconnectYouTube: "YouTubeを切断",
    connected: "接続済み",
    spotifyAccountConnected: "Spotifyアカウントが接続されています",
    youtubeAccountConnected: "YouTubeアカウントが接続されています",
    spotifyUser: "Spotifyユーザー",
    authRequired: "認証が必要です",
    youtubeAuthRequired: "動画を検索するにはYouTubeアカウントを接続する必要があります",

    // Playlist display
    noPlaylist: "プレイリストがまだ生成されていません",
    noPlaylistDesc:
      "気分と好みを選択し、「プレイリストを生成」をクリックして、パーソナライズされた音楽体験を作成してください。",
    playlist: "プレイリスト",
    songs: "曲",
    shuffle: "シャッフル",
    saveToSpotify: "Spotifyに保存",

    // Music player
    musicPlayer: "ミュージックプレーヤー",
    connectYouTubeAccount: "動画を再生するにはYouTubeアカウントを接続してください",
    selectVideoToPlay: "再生する動画を選択してください",
    search: "検索",
    searching: "検索中...",
    searchYouTube: "YouTube動画を検索...",
    noResults: "結果が見つかりません",
    history: "履歴",
    noHistory: "視聴履歴がありません",
    searchError: "検索エラー",
    youtubeSearchError: "YouTube動画の検索に失敗しました。もう一度お試しください。",
    playbackError: "再生エラー",
    youtubePlaybackError: "動画の再生に失敗しました。別の動画をお試しください。",
    likeSong: "曲をお気に入りに追加",
    unlikeSong: "お気に入りから削除",
    repeatEnabled: "プレイリストをリピート: オン",
    repeatDisabled: "プレイリストをリピート: オフ",
    songAdded: "曲が追加されました",
    songAddedToPlaylist: "{title}がプレイリストに追加されました",
    generatePlaylistFirst: "曲を追加する前にプレイリストを生成してください",

    // Language
    language: "言語",

    // Theme
    theme: "テーマ",
    lightMode: "ライトモード",
    darkMode: "ダークモード",

    // Alerts
    playlistFillAlert:
      "このプレイリストは要求された{duration}分の{percentage}%を満たしています。より多くの曲を取得するには音楽サービスに接続してください。",

    // Block titles
    moodAndFilters: "気分とフィルター",
    yourPlaylist: "あなたのプレイリスト",

    // Drag and drop
    dragToReorder: "ドラッグして並べ替え",
    songReordered: "曲が並べ替えられました",
    playlistReordered: "プレイリストが並べ替えられました",
  },
}

// Create a context for the language
type I18nContextType = {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string, params?: Record<string, string | number>) => string
  _forceUpdate: number
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Hook to use translations
export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider")
  }
  return context
}
