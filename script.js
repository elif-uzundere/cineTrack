// ---------- Ayarlar ----------
const API_KEY = "5b3bbb85c2447e11063aeda45bad25d9";
const API_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const LANGUAGE = "tr-TR";

const STORAGE_KEYS = {
    favorites: "movieProject_favorites",
    watched: "movieProject_watched"
};

const GENRE_TITLES = {
    top: "🔥 Top Rated Movies",
    28: "Action Movies",
    53: "Thriller Movies",
    35: "Comedy Movies",
    27: "Horror Movies",
    878: "Sci-Fi Movies",
    10749: "Romance Movies"
};

// ---------- Durum ----------
let currentMovies = [];          // Browse görünümünde API'den gelen filmler
let state = { view: "browse", genre: "top", query: "" };
let requestCounter = 0;          // Eski isteklerin yeni sonucu ezmesini engeller
let searchTimer = null;

const store = {
    favorites: loadList(STORAGE_KEYS.favorites),
    watched: loadList(STORAGE_KEYS.watched)
};

// ---------- Elemanlar ----------
const movieBox = document.getElementById("movieBox");
const movieInput = document.getElementById("movieInput");
const sortSelect = document.getElementById("sortSelect");
const randomBtn = document.getElementById("randomBtn");
const randomMovieBox = document.getElementById("randomMovieBox");
const sectionTitle = document.getElementById("sectionTitle");
const favCount = document.getElementById("favCount");
const watchedCount = document.getElementById("watchedCount");
const genreButtons = document.querySelectorAll(".genre-btn");
const navButtons = document.querySelectorAll(".nav-btn");

// ---------- Yardımcı fonksiyonlar ----------
function loadList(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

function saveList(name) {
    try {
        localStorage.setItem(STORAGE_KEYS[name], JSON.stringify(store[name]));
    } catch (error) {
        console.error("Kayıt yapılamadı:", error);
    }
}

function isIn(name, id) {
    return store[name].some(movie => movie.id === id);
}

function toggleIn(name, movie) {
    const index = store[name].findIndex(item => item.id === movie.id);

    if (index >= 0) {
        store[name].splice(index, 1);
    } else {
        // Sadece gerekli alanları sakla, böylece Favorites ve Watched API'siz de açılır
        store[name].push({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date
        });
    }

    saveList(name);
}

function findMovie(id) {
    return (
        currentMovies.find(movie => movie.id === id) ||
        store.favorites.find(movie => movie.id === id) ||
        store.watched.find(movie => movie.id === id)
    );
}

function escapeHTML(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function formatRating(movie) {
    return movie.vote_average ? movie.vote_average.toFixed(1) : "–";
}

// ---------- API ----------
async function loadBrowse() {
    const requestId = ++requestCounter;
    let url;

    if (state.query.length >= 2) {
        url = `${API_BASE}/search/movie?api_key=${API_KEY}&language=${LANGUAGE}&include_adult=false&query=${encodeURIComponent(state.query)}`;
    } else if (state.genre === "top") {
        url = `${API_BASE}/movie/top_rated?api_key=${API_KEY}&language=${LANGUAGE}`;
    } else {
        // vote_count.gte: sadece birkaç oyla 10 puan almış belirsiz filmleri eler
        url = `${API_BASE}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}&with_genres=${state.genre}&sort_by=vote_average.desc&vote_count.gte=300`;
    }

    movieBox.innerHTML = `<p class="message">Loading movies...</p>`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("HTTP " + response.status);

        const data = await response.json();
        if (requestId !== requestCounter) return; // Daha yeni bir istek başladı

        currentMovies = data.results || [];
        render();
    } catch (error) {
        if (requestId !== requestCounter) return;
        console.error(error);
        movieBox.innerHTML = `<p class="message">Movies could not be loaded. Check your internet connection and API key, then try again.</p>`;
    }
}

// ---------- Listeleme ----------
function getVisibleMovies() {
    let list;

    if (state.view === "favorites") list = store.favorites;
    else if (state.view === "watched") list = store.watched;
    else return currentMovies;

    // Favorites ve Watched görünümünde arama kayıtlı liste içinde yapılır
    const query = state.query.toLowerCase();
    return query ? list.filter(movie => movie.title.toLowerCase().includes(query)) : list;
}

function sortMovies(movies) {
    const sorted = [...movies];

    switch (sortSelect.value) {
        case "rating-desc":
            sorted.sort((a, b) => b.vote_average - a.vote_average);
            break;
        case "rating-asc":
            sorted.sort((a, b) => a.vote_average - b.vote_average);
            break;
        case "date-desc":
            sorted.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
            break;
    }

    return sorted;
}

function getSectionTitle() {
    if (state.view === "favorites") return "❤️ My Favorites";
    if (state.view === "watched") return "✅ Watched Movies";
    if (state.query.length >= 2) return `Results for “${state.query}”`;
    return GENRE_TITLES[state.genre];
}

function getEmptyMessage() {
    if (state.view === "favorites") return "No favorites yet. Tap the heart on a poster to add one.";
    if (state.view === "watched") return "Nothing here yet. Tap the eye on a poster to mark it as watched.";
    return "No movies found. Try a different search or genre.";
}

function cardHTML(movie) {
    const isFav = isIn("favorites", movie.id);
    const isSeen = isIn("watched", movie.id);
    const title = escapeHTML(movie.title);
    const year = movie.release_date ? movie.release_date.slice(0, 4) : "";

    const poster = movie.poster_path
        ? `<img src="${IMG_BASE}${movie.poster_path}" alt="${title}" loading="lazy">`
        : `<div class="no-poster">🎬</div>`;

    return `
    <article class="movie-card ${isSeen ? "is-watched" : ""}" data-id="${movie.id}">
        <div class="poster">
            ${poster}

            <button class="icon-btn fav-btn ${isFav ? "active" : ""}"
                data-action="favorites"
                aria-label="${isFav ? "Remove from favorites" : "Add to favorites"}"
                title="${isFav ? "Remove from favorites" : "Add to favorites"}">
                ${isFav ? "❤️" : "🤍"}
            </button>

            <button class="icon-btn watch-btn ${isSeen ? "active" : ""}"
                data-action="watched"
                aria-label="${isSeen ? "Mark as not watched" : "Mark as watched"}"
                title="${isSeen ? "Mark as not watched" : "Mark as watched"}">
                ${isSeen ? "✅" : "👁️"}
            </button>

            <div class="overlay">
                <h3>${title}</h3>
                <p>⭐ ${formatRating(movie)}${year ? " &nbsp;|&nbsp; " + year : ""}</p>
            </div>
        </div>
    </article>`;
}

function updateCounts() {
    favCount.textContent = store.favorites.length;
    watchedCount.textContent = store.watched.length;
}

function render() {
    const movies = sortMovies(getVisibleMovies());

    sectionTitle.textContent = getSectionTitle();
    updateCounts();

    movieBox.innerHTML = movies.length
        ? movies.map(cardHTML).join("")
        : `<p class="message">${getEmptyMessage()}</p>`;
}

// ---------- Olaylar ----------

// Kart üzerindeki kalp ve izledim butonları (tek dinleyici ile)
movieBox.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const card = button.closest(".movie-card");
    const movie = findMovie(Number(card.dataset.id));
    if (!movie) return;

    toggleIn(button.dataset.action, movie);
    render();
});

// Tür butonları
genreButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        genreButtons.forEach(b => b.classList.remove("active"));
        button.classList.add("active");

        state.genre = button.dataset.genre;
        state.view = "browse";
        state.query = "";
        movieInput.value = "";
        randomMovieBox.textContent = "";

        setActiveNav("browse");
        loadBrowse();
    });
});

// Üst menü: Browse / Favorites / Watched
navButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        state.view = button.dataset.view;
        randomMovieBox.textContent = "";
        setActiveNav(state.view);
        render();
    });
});

function setActiveNav(view) {
    navButtons.forEach(b => b.classList.toggle("active", b.dataset.view === view));
}

// Arama: Browse'da TMDB'de arar, diğer görünümlerde kayıtlı listede filtreler
movieInput.addEventListener("input", function () {
    state.query = movieInput.value.trim();
    clearTimeout(searchTimer);

    if (state.view === "browse") {
        searchTimer = setTimeout(loadBrowse, 400); // Her tuşta istek atmamak için bekle
    } else {
        render();
    }
});

// Sıralama
sortSelect.addEventListener("change", render);

// Rastgele tek film önerisi
randomBtn.addEventListener("click", function () {
    const movies = getVisibleMovies();

    if (movies.length === 0) {
        randomMovieBox.textContent = "There are no movies to pick from yet.";
        return;
    }

    const pick = movies[Math.floor(Math.random() * movies.length)];
    randomMovieBox.innerHTML = `🎬 <strong>${escapeHTML(pick.title)}</strong> &nbsp;⭐ ${formatRating(pick)}`;

    document.querySelectorAll(".movie-card.highlight")
        .forEach(card => card.classList.remove("highlight"));

    const card = movieBox.querySelector(`[data-id="${pick.id}"]`);
    if (card) {
        card.classList.add("highlight");
        card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
});

// ---------- Başlangıç ----------
updateCounts();
loadBrowse();
// ---------- Film Detay ve Fragman Modalı ----------
const movieModal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalBackdrop = document.getElementById("modalBackdrop");

function closeModal() {
    movieModal.classList.add("hidden");
    modalBody.innerHTML = ""; // Videonun arka planda çalmaya devam etmesini durdurur
}

closeModalBtn.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !movieModal.classList.contains("hidden")) {
        closeModal();
    }
});

// Kartın kendisine tıklandığında (kalp/göz butonları hariç) detayları aç
movieBox.addEventListener("click", async function (event) {
    if (event.target.closest("[data-action]")) return;

    const card = event.target.closest(".movie-card");
    if (!card) return;

    const movieId = card.dataset.id;
    openMovieDetails(movieId);
});

async function openMovieDetails(movieId) {
    movieModal.classList.remove("hidden");
    modalBody.innerHTML = `<p class="message">Film detayları ve fragman yükleniyor...</p>`;

    try {
        // Türkçe detay ve videoları çek
        const resTr = await fetch(`${API_BASE}/movie/${movieId}?api_key=${API_KEY}&language=tr-TR&append_to_response=videos`);
        const movie = await resTr.json();

        // Türkçe özet veya Türkçe fragman yoksa İngilizce yedek veriyi çek
        let overview = movie.overview;
        let videos = movie.videos?.results || [];

        if (!overview || videos.length === 0) {
            const resEn = await fetch(`${API_BASE}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=videos`);
            const movieEn = await resEn.json();
            if (!overview) overview = movieEn.overview;
            if (videos.length === 0) videos = movieEn.videos?.results || [];
        }

        // YouTube üzerinden resmi Trailer veya Teaser bul
        const trailer = videos.find(v => v.site === "YouTube" && v.type === "Trailer")
                     || videos.find(v => v.site === "YouTube");

        const posterHTML = movie.poster_path
            ? `<img class="modal-poster" src="${IMG_BASE}${movie.poster_path}" alt="${escapeHTML(movie.title)}">`
            : "";

        const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
        const runtime = movie.runtime ? `${movie.runtime} dk` : "";
        const genresHTML = (movie.genres || [])
            .map(g => `<span class="genre-tag">${escapeHTML(g.name)}</span>`)
            .join("");

        const trailerHTML = trailer
            ? `<div class="trailer-container">
                   <iframe src="https://www.youtube.com/embed/${trailer.key}" 
                           title="${escapeHTML(movie.title)} Trailer" 
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowfullscreen></iframe>
               </div>`
            : `<p class="message">Bu film için fragman bulunamadı.</p>`;

        modalBody.innerHTML = `
            <div class="modal-header">
                ${posterHTML}
                <div class="modal-info">
                    <h2 id="modalTitle">${escapeHTML(movie.title)}</h2>
                    <p class="modal-meta">⭐ ${formatRating(movie)} &nbsp;|&nbsp; 📅 ${year} ${runtime ? `&nbsp;|&nbsp; ⏱️ ${runtime}` : ""}</p>
                    <div class="modal-genres">${genresHTML}</div>
                </div>
            </div>
            <p class="modal-overview">${escapeHTML(overview || "Bu film için özet bilgisi bulunmuyor.")}</p>
            ${trailerHTML}
        `;
    } catch (error) {
        console.error(error);
        modalBody.innerHTML = `<p class="message">Film detayları yüklenirken bir hata oluştu.</p>`;
    }
}