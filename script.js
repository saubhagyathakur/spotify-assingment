document.addEventListener("DOMContentLoaded", () => {
  // --- Data: Your songs and playlists ---
  const songs = [
    {
      id: 0,
      title: "Forest Lullaby",
      artist: "Lesfm",
      file: "assets/audio/song1.mp3",
      art: "assets/images/art1.png",
    },
    {
      id: 1,
      title: "Lost in the City",
      artist: "Cosmo Sheldrake",
      file: "assets/audio/song2.mp3",
      art: "assets/images/art2.png",
    },
    {
      id: 2,
      title: "Ambient Gold",
      artist: "Alex Productions",
      file: "assets/audio/song3.mp3",
      art: "assets/images/art3.png",
    },
    {
      id: 3,
      title: "The Wanderer",
      artist: "Bonobo",
      file: "assets/audio/song4.mp3",
      art: "assets/images/art4.png",
    },
    {
      id: 4,
      title: "Sunset Drive",
      artist: "Tycho",
      file: "assets/audio/song5.mp3",
      art: "assets/images/art5.png",
    },
    {
      id: 5,
      title: "Midnight City",
      artist: "M83",
      file: "assets/audio/song6.mp3",
      art: "assets/images/art6.png",
    },
  ];

  const playlists = {
    focus: [0, 2],
    spotify: [1, 3, 4, 5],
  };

  // --- DOM Elements ---
  const audio = new Audio();
  const playPauseBtn = document.getElementById("play-pause-btn");
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");
  const progress = document.getElementById("progress");
  const volume = document.getElementById("volume");
  const songTitleEl = document.getElementById("song-title");
  const songArtistEl = document.getElementById("song-artist");
  const songArtEl = document.getElementById("song-art");
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");
  const focusContainer = document.getElementById("focus-playlists");
  const spotifyContainer = document.getElementById("spotify-playlists");

  // --- Player State ---
  let currentSongIndex = 0;
  let isPlaying = false;

  // --- Functions ---

  // Load and display playlists on the page
  function loadPlaylists() {
    if (focusContainer) {
      playlists.focus.forEach((songId) => {
        const song = songs.find((s) => s.id === songId);
        createPlaylistItem(song, focusContainer);
      });
    }
    if (spotifyContainer) {
      playlists.spotify.forEach((songId) => {
        const song = songs.find((s) => s.id === songId);
        createPlaylistItem(song, spotifyContainer);
      });
    }
  }

  // Create a playlist card element
  function createPlaylistItem(song, container) {
    const item = document.createElement("div");
    item.classList.add("item");
    item.innerHTML = `
            <img src="${song.art}" alt="${song.title}">
            <div class="play-icon"><i class="fa fa-play"></i></div>
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        `;
    item.addEventListener("click", () => {
      const songIndex = songs.findIndex((s) => s.id === song.id);
      loadSong(songIndex);
      playSong();
    });
    container.appendChild(item);
  }

  // Load a song's details into the player
  function loadSong(index) {
    currentSongIndex = index;
    const song = songs[currentSongIndex];
    songTitleEl.textContent = song.title;
    songArtistEl.textContent = song.artist;
    songArtEl.src = song.art;
    audio.src = song.file;

    // Save current song to local storage
    localStorage.setItem("spotifyClone_currentSong", JSON.stringify(song.id));
  }

  // Play the currently loaded song
  function playSong() {
    isPlaying = true;
    audio.play();
    playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
  }

  // Pause the currently playing song
  function pauseSong() {
    isPlaying = false;
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
  }

  // Play or pause toggle
  function togglePlayPause() {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  }

  // Go to the next song
  function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    playSong();
  }

  // Go to the previous song
  function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    playSong();
  }

  // Update progress bar and time display
  function updateProgress() {
    const { duration, currentTime } = audio;
    const progressPercent = (currentTime / duration) * 100;
    progress.value = isNaN(progressPercent) ? 0 : progressPercent;

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
      return `${minutes}:${seconds}`;
    };

    if (duration) {
      durationEl.textContent = formatTime(duration);
    }
    currentTimeEl.textContent = formatTime(currentTime);

    // Save current time to local storage
    localStorage.setItem("spotifyClone_currentTime", currentTime);
  }

  // Set audio position when progress bar is clicked
  function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
  }

  // Set volume
  function setVolume(e) {
    audio.volume = e.target.value / 100;
    localStorage.setItem("spotifyClone_volume", audio.volume);
  }

  // Load player state from local storage on page load
  function loadFromLocalStorage() {
    const savedSongId = JSON.parse(
      localStorage.getItem("spotifyClone_currentSong")
    );
    const savedTime = parseFloat(
      localStorage.getItem("spotifyClone_currentTime")
    );
    const savedVolume = parseFloat(localStorage.getItem("spotifyClone_volume"));

    if (savedSongId !== null) {
      const songIndex = songs.findIndex((s) => s.id === savedSongId);
      if (songIndex !== -1) {
        loadSong(songIndex);
        if (savedTime) {
          audio.currentTime = savedTime;
        }
      }
    }

    if (savedVolume) {
      audio.volume = savedVolume;
      volume.value = savedVolume * 100;
    }
  }

  // --- Event Listeners ---
  playPauseBtn.addEventListener("click", togglePlayPause);
  nextBtn.addEventListener("click", nextSong);
  prevBtn.addEventListener("click", prevSong);
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("ended", nextSong);
  progress.addEventListener("input", setProgress);
  volume.addEventListener("input", setVolume);

  // --- Initialisation ---
  loadPlaylists();
  loadFromLocalStorage();
});
