// Global variables
let songs = [];               // Array to store song filenames from tracklist.json
let audio = new Audio();      // HTML5 Audio object
let currentIndex = 0;         // Current index of the playing song
let currentFolderPath = "songs"; // default path

// Load albums dynamically
async function loadAlbums() {
  const res = await fetch('songs/albums.json');
  const albums = await res.json();

  const albumContainer = document.getElementById("albumContainer");
  albumContainer.innerHTML = "";

  albums.forEach(album => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-folder", album.folder);

    card.innerHTML = `
      <div class="play">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill="#1DB954" stroke="#1DB954" stroke-width="2" />
          <path d="M20 16L32 24L20 32V16Z" fill="black" />
        </svg>
      </div>
      <img src="${album.cover}" alt="${album.title} cover" />
      <h2>${album.title}</h2>
      <p>${album.description}</p>
    `;

    card.addEventListener("click", () => {
      loadSongs(album.folder);
      document.querySelector(".left").style.left = "0px";
    });

    albumContainer.appendChild(card);
  });
}

// Load songs from a JSON file in the album folder
async function loadSongs(folder = "") {
  const folderPath = folder ? `songs/${folder}` : `songs`;
  const res = await fetch(`${folderPath}/tracklist.json`);
  songs = await res.json();
  renderSongs(folderPath);
}

// Play a song by index
function playSong(index) {
  if (!songs[index]) return;

  currentIndex = index;
  audio.src = `${currentFolderPath}/${songs[index]}`;
  audio.currentTime = 0;
  audio.play();

  document.getElementById("nowPlaying").textContent = decodeURIComponent(songs[index]);
  playPauseIcon.src = "svg/pause.svg";
}

// Render the list of songs dynamically
function renderSongs(folderPath = "songs") {
  currentFolderPath = folderPath;
  const ul = document.getElementById("songList");
  ul.innerHTML = "";

  songs.forEach((song, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <img src="svg/music.svg" class="invert" width="34" alt="Music Icon">
      <div class="info">
        <div>${decodeURIComponent(song)}</div>
        <div>UnKnown Artist</div>
      </div>
      <div class="playnow">
        <span>Play Now</span>
        <img src="svg/play.svg" class="invert" width="24" alt="Play Icon">
      </div>
    `;

    li.addEventListener("click", () => playSong(index));
    ul.appendChild(li);
  });
}

// Toggle play/pause
const playPauseBtn = document.getElementById("playPause");


playPauseBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.src = "svg/pause.svg";
  } else {
    audio.pause();
    playPauseBtn.src = "svg/play.svg";
  }
});

// Format time in MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Time update handler
audio.addEventListener("timeupdate", () => {
  const current = audio.currentTime;
  const duration = audio.duration || 0;
  document.getElementById("timeDisplay").textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  document.getElementById("seekbar").value = (current / duration) * 100 || 0;
});

// Next control
document.getElementById("nextBtn").addEventListener("click", () => {
  playSong((currentIndex + 1) % songs.length);
});
//Previous controls
document.getElementById("prevBtn").addEventListener("click", () => {
  playSong((currentIndex - 1 + songs.length) % songs.length);
});

// Seekbar control
document.getElementById("seekbar").addEventListener("input", (e) => {
  const duration = audio.duration;
  if (duration) {
    const percent = e.target.value;
    audio.currentTime = (percent / 100) * duration;
  }
});

// Volume control
const volumeBtn = document.getElementById("volumeBtn");
const volumeSlider = document.getElementById("volumeSlider");

let previousVolume = 0.5; // store last non-zero volume
audio.volume = previousVolume;
volumeSlider.value = previousVolume * 100;

// Volume slider change
volumeSlider.addEventListener("input", (e) => {
  const volume = parseInt(e.target.value) / 100;
  audio.volume = volume;

  if (volume === 0) {
    volumeBtn.src = "svg/mute.svg";
  } else {
    volumeBtn.src = "svg/volume.svg";
    previousVolume = volume;
  }
});

// Mute/unmute toggle on icon click
volumeBtn.addEventListener("click", () => {
  if (audio.volume > 0) {
    previousVolume = audio.volume;
    audio.volume = 0;
    volumeSlider.value = 0;
    volumeBtn.src = "svg/mute.svg";
  } else {
    audio.volume = previousVolume || 0.5;
    volumeSlider.value = audio.volume * 100;
    volumeBtn.src = "svg/volume.svg";
  }
});

// Auto play next song
audio.addEventListener("ended", () => {
  playSong((currentIndex + 1) % songs.length);
});

// Hamburger toggle
document.querySelector('.hamburger').addEventListener('click', () => {
  const leftSidebar = document.querySelector('.left');
  leftSidebar.style.left = leftSidebar.style.left === "0px" ? "-100%" : "0px";
});

// Close button in sidebar
document.querySelector('.close').addEventListener('click', () => {
  document.querySelector(".left").style.left = "-100%";
});

// Load albums on page load
window.onload = loadAlbums;
