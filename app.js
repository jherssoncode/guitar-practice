/* =========================================================
   GUITAR PRACTICE V5.1
   ========================================================= */

/* =========================================================
   THEME — V5.1.1
   ========================================================= */

const THEME_STORAGE_KEY = "guitarPracticeTheme";

function applyTheme(theme) {
  const dark = theme === "dark";
  document.body.classList.toggle("dark-mode", dark);

  const button = $("themeToggleBtn");

  if (button) {
    button.textContent = dark ? "☀️ Claro" : "🌙 Oscuro";
    button.setAttribute(
      "aria-label",
      dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
    );
    button.title = dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');

  if (metaTheme) {
    metaTheme.setAttribute("content", dark ? "#111827" : "#2563eb");
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
    return;
  }

  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  applyTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains("dark-mode")
    ? "light"
    : "dark";

  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
}

/* =========================================================
   SCREEN WAKE LOCK — V5.1.2
   ========================================================= */

let wakeLock = null;

async function requestWakeLock() {
  if (!("wakeLock" in navigator)) {
    return false;
  }

  if (wakeLock && !wakeLock.released) {
    return true;
  }

  try {
    wakeLock = await navigator.wakeLock.request("screen");

    wakeLock.addEventListener("release", () => {
      wakeLock = null;
    });

    return true;
  } catch (error) {
    wakeLock = null;
    console.warn("No se pudo mantener la pantalla activa:", error);
    return false;
  }
}

async function releaseWakeLock() {
  if (!wakeLock) {
    return;
  }

  try {
    await wakeLock.release();
  } catch (error) {
    console.warn("No se pudo liberar Wake Lock:", error);
  }

  wakeLock = null;
}

async function refreshWakeLock() {
  if (document.visibilityState !== "visible") {
    return;
  }

  if (sessionRunning || metronomeRunning) {
    await requestWakeLock();
  }
}

const STORAGE_KEYS = {
  sessions: "guitarSessions",
  exercises: "guitarExercises",
  routines: "guitarRoutines",
  settings: "guitarSettings",
};

const DATA_VERSION = 5;

/* =========================================================
   GLOBAL STATE
   ========================================================= */

let timerInterval = null;

let elapsedSeconds = 0;

let sessionRunning = false;
let sessionPaused = false;

let currentSession = null;
let currentSegment = null;

let segmentStartSeconds = 0;

/* =========================================================
   METRONOME STATE
   ========================================================= */

let audioContext = null;

let metronomeInterval = null;

let metronomeRunning = false;

let currentBeat = 0;

let tapTimes = [];

let tapResetTimeout = null;

/* =========================================================
   ROUTINE STATE
   ========================================================= */

let activeRoutine = null;

let activeRoutineIndex = 0;

/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}

function generateId(prefix = "id") {
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

function showNotification(message) {
  const notification = $("notification");

  notification.textContent = message;

  notification.classList.add("show");

  clearTimeout(notification._timeout);

  notification._timeout = setTimeout(() => {
    notification.classList.remove("show");
  }, 2800);
}

function formatTime(totalSeconds) {
  totalSeconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}

function formatShortTime(totalSeconds) {
  totalSeconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

/* =========================================================
   STORAGE
   ========================================================= */

function readStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);

    return parsed;
  } catch (error) {
    console.error(`Error leyendo ${key}:`, error);

    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));

    return true;
  } catch (error) {
    console.error(`Error guardando ${key}:`, error);

    showNotification("No se pudieron guardar los datos.");

    return false;
  }
}

/* =========================================================
   SESSIONS
   ========================================================= */

function getSessions() {
  const sessions = readStorage(STORAGE_KEYS.sessions, []);

  if (!Array.isArray(sessions)) {
    return [];
  }

  return sessions.map(normalizeSession);
}

function saveSessions(sessions) {
  writeStorage(STORAGE_KEYS.sessions, sessions);
}

function normalizeSegments(session) {
  if (Array.isArray(session.segments) && session.segments.length > 0) {
    return session.segments.map((segment) => ({
      id: segment.id || generateId("segment"),

      exercise: segment.exercise || "Sin nombre",

      duration: Number(segment.duration) || 0,

      bpm: Number(segment.bpm) || 0,

      notes: segment.notes || "",

      startedAt:
        segment.startedAt || session.startedAt || new Date().toISOString(),

      endedAt: segment.endedAt || null,
    }));
  }

  /* Compatibilidad V1-V4 */

  if (session.exercise || session.duration) {
    return [
      {
        id: generateId("segment"),

        exercise: session.exercise || "Sin nombre",

        duration: Number(session.duration) || 0,

        bpm: Number(session.bpm) || 0,

        notes: session.notes || "",

        startedAt: session.startedAt || new Date().toISOString(),

        endedAt: session.endedAt || null,
      },
    ];
  }

  return [];
}

function normalizeSession(session) {
  const segments = normalizeSegments(session);

  const calculatedDuration = segments.reduce(
    (total, segment) => total + (Number(segment.duration) || 0),
    0,
  );

  return {
    id: session.id || generateId("session"),

    startedAt: session.startedAt || new Date().toISOString(),

    endedAt: session.endedAt || null,

    duration: calculatedDuration || Number(session.duration) || 0,

    segments,

    routineId: session.routineId || null,

    routineName: session.routineName || null,
  };
}

/* =========================================================
   EXERCISES
   ========================================================= */

function getExercises() {
  const exercises = readStorage(STORAGE_KEYS.exercises, []);

  return Array.isArray(exercises) ? exercises : [];
}

function saveExercises(exercises) {
  writeStorage(STORAGE_KEYS.exercises, exercises);
}

function createDefaultExercises() {
  const exercises = getExercises();

  if (exercises.length > 0) {
    return;
  }

  const defaults = [
    {
      id: generateId("exercise"),
      name: "Alternate Picking",
      category: "Técnica",
      difficulty: "Medio",
      startBpm: 60,
      targetBpm: 120,
      notes: "Practicar con metrónomo manteniendo precisión.",
      favorite: true,
      createdAt: new Date().toISOString(),
    },

    {
      id: generateId("exercise"),
      name: "Escala mayor",
      category: "Escalas",
      difficulty: "Fácil",
      startBpm: 60,
      targetBpm: 100,
      notes: "Practicar en diferentes tonalidades.",
      favorite: false,
      createdAt: new Date().toISOString(),
    },

    {
      id: generateId("exercise"),
      name: "Cambios de acordes",
      category: "Acordes",
      difficulty: "Fácil",
      startBpm: 50,
      targetBpm: 90,
      notes: "Trabajar cambios limpios y progresivos.",
      favorite: false,
      createdAt: new Date().toISOString(),
    },
  ];

  saveExercises(defaults);
}

function getExerciseById(id) {
  return getExercises().find((exercise) => exercise.id === id);
}

function getExerciseByName(name) {
  return getExercises().find(
    (exercise) => exercise.name.toLowerCase() === String(name).toLowerCase(),
  );
}

/* =========================================================
   EXERCISE PROGRESS
   ========================================================= */

function getExerciseStats(exerciseName) {
  const sessions = getSessions();

  let totalTime = 0;

  let sessionsCount = 0;

  let maxBpm = 0;

  let lastPractice = null;

  sessions.forEach((session) => {
    let sessionHasExercise = false;

    session.segments.forEach((segment) => {
      if (
        String(segment.exercise).toLowerCase() !==
        String(exerciseName).toLowerCase()
      ) {
        return;
      }

      sessionHasExercise = true;

      totalTime += Number(segment.duration) || 0;

      maxBpm = Math.max(maxBpm, Number(segment.bpm) || 0);

      const segmentDate = parseDate(segment.startedAt);

      if (segmentDate && (!lastPractice || segmentDate > lastPractice)) {
        lastPractice = segmentDate;
      }
    });

    if (sessionHasExercise) {
      sessionsCount++;
    }
  });

  return {
    totalTime,
    sessionsCount,
    maxBpm,
    lastPractice,
  };
}

/* =========================================================
   EXERCISE UI
   ========================================================= */

function updateExerciseSelectors() {
  const exercises = getExercises();

  const exerciseSelect = $("exercise");

  const nextExercise = $("nextExercise");

  const currentExercise = exerciseSelect.value;

  exerciseSelect.innerHTML = `
        <option value="">
            Selecciona un ejercicio
        </option>
    `;

  exercises.forEach((exercise) => {
    const option = document.createElement("option");

    option.value = exercise.name;

    option.textContent = `${exercise.favorite ? "⭐ " : ""}${exercise.name}`;

    exerciseSelect.appendChild(option);
  });

  if (exercises.some((exercise) => exercise.name === currentExercise)) {
    exerciseSelect.value = currentExercise;
  }

  nextExercise.innerHTML = "";

  exercises.forEach((exercise) => {
    const option = document.createElement("option");

    option.value = exercise.name;

    option.textContent = `${exercise.favorite ? "⭐ " : ""}${exercise.name}`;

    nextExercise.appendChild(option);
  });
}

function renderExerciseFilters() {
  const exercises = getExercises();

  const categorySelect = $("exerciseCategoryFilter");

  const current = categorySelect.value;

  const categories = [
    ...new Set(exercises.map((exercise) => exercise.category).filter(Boolean)),
  ].sort();

  categorySelect.innerHTML = `
        <option value="">
            Todas
        </option>
    `;

  categories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category;

    option.textContent = category;

    categorySelect.appendChild(option);
  });

  if (categories.includes(current)) {
    categorySelect.value = current;
  }
}

function renderExercises() {
  renderExerciseFilters();

  const container = $("exerciseList");

  const empty = $("emptyExercises");

  const search = $("exerciseSearch").value.trim().toLowerCase();

  const category = $("exerciseCategoryFilter").value;

  const favoritesOnly = $("favoriteFilter").checked;

  const exercises = getExercises().filter((exercise) => {
    const matchesSearch =
      !search ||
      exercise.name.toLowerCase().includes(search) ||
      String(exercise.notes).toLowerCase().includes(search);

    const matchesCategory = !category || exercise.category === category;

    const matchesFavorite = !favoritesOnly || exercise.favorite;

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  container.innerHTML = "";

  if (exercises.length === 0) {
    empty.classList.remove("hidden");

    return;
  }

  empty.classList.add("hidden");

  exercises.forEach((exercise) => {
    const stats = getExerciseStats(exercise.name);

    const target = Number(exercise.targetBpm) || 0;

    const progress =
      target > 0 ? Math.min(100, Math.round((stats.maxBpm / target) * 100)) : 0;

    const card = document.createElement("article");

    card.className = "exercise-card" + (exercise.favorite ? " favorite" : "");

    card.innerHTML = `

            <div class="exercise-title">

                <h3>
                    ${escapeHtml(exercise.name)}
                </h3>

                <button
                    class="favorite-btn"
                    data-action="favorite"
                    data-id="${exercise.id}"
                    title="Favorito"
                >
                    ${exercise.favorite ? "⭐" : "☆"}
                </button>

            </div>


            <div class="exercise-meta">

                <span class="tag">
                    ${escapeHtml(exercise.category)}
                </span>

                <span class="tag">
                    ${escapeHtml(exercise.difficulty)}
                </span>

                <span class="tag">
                    ${exercise.startBpm} →
                    ${exercise.targetBpm} BPM
                </span>

            </div>


            <div class="exercise-notes">
                ${escapeHtml(exercise.notes || "Sin notas.")}
            </div>


            <div class="exercise-progress">

                <div class="progress-label">

                    <span>
                        Progreso BPM
                    </span>

                    <span>
                        ${stats.maxBpm || 0}
                        / ${target}
                    </span>

                </div>

                <div class="progress-bar">

                    <div
                        class="progress-fill"
                        style="width:${progress}%"
                    ></div>

                </div>

            </div>


            <div class="exercise-meta">

                <span class="tag">
                    ⏱️ ${formatShortTime(stats.totalTime)}
                </span>

                <span class="tag">
                    🎸 ${stats.sessionsCount} sesiones
                </span>

            </div>


            <div class="exercise-actions">

                <button
                    class="btn btn-primary"
                    data-action="practice"
                    data-id="${exercise.id}"
                >
                    Practicar
                </button>

                <button
                    class="btn btn-secondary"
                    data-action="edit"
                    data-id="${exercise.id}"
                >
                    Editar
                </button>

                <button
                    class="btn btn-danger"
                    data-action="delete"
                    data-id="${exercise.id}"
                >
                    Eliminar
                </button>

            </div>
        `;

    container.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   EXERCISE MODAL
   ========================================================= */

function openExerciseModal(exercise = null) {
  $("exerciseModal").classList.remove("hidden");

  if (exercise) {
    $("exerciseModalTitle").textContent = "Editar ejercicio";

    $("exerciseId").value = exercise.id;

    $("exerciseName").value = exercise.name;

    $("exerciseCategory").value = exercise.category;

    $("exerciseDifficulty").value = exercise.difficulty;

    $("exerciseStartBpm").value = exercise.startBpm;

    $("exerciseTargetBpm").value = exercise.targetBpm;

    $("exerciseNotes").value = exercise.notes || "";

    $("exerciseFavorite").checked = Boolean(exercise.favorite);
  } else {
    $("exerciseModalTitle").textContent = "Nuevo ejercicio";

    $("exerciseForm").reset();

    $("exerciseId").value = "";

    $("exerciseStartBpm").value = 60;

    $("exerciseTargetBpm").value = 120;
  }
}

function closeExerciseModal() {
  $("exerciseModal").classList.add("hidden");
}

function saveExerciseFromForm(event) {
  event.preventDefault();

  const id = $("exerciseId").value;

  const name = $("exerciseName").value.trim();

  if (!name) {
    showNotification("Escribe un nombre para el ejercicio.");

    return;
  }

  const exercises = getExercises();

  const duplicate = exercises.find(
    (exercise) =>
      exercise.name.toLowerCase() === name.toLowerCase() && exercise.id !== id,
  );

  if (duplicate) {
    showNotification("Ya existe un ejercicio con ese nombre.");

    return;
  }

  const exercise = {
    id: id || generateId("exercise"),

    name,

    category: $("exerciseCategory").value,

    difficulty: $("exerciseDifficulty").value,

    startBpm: Number($("exerciseStartBpm").value) || 60,

    targetBpm: Number($("exerciseTargetBpm").value) || 120,

    notes: $("exerciseNotes").value.trim(),

    favorite: $("exerciseFavorite").checked,

    createdAt: id
      ? getExerciseById(id)?.createdAt || new Date().toISOString()
      : new Date().toISOString(),
  };

  const index = exercises.findIndex((item) => item.id === id);

  if (index >= 0) {
    exercises[index] = exercise;
  } else {
    exercises.push(exercise);
  }

  saveExercises(exercises);

  closeExerciseModal();

  updateExerciseSelectors();

  renderExercises();

  renderDashboard();

  showNotification(id ? "Ejercicio actualizado." : "Ejercicio creado.");
}

function deleteExercise(id) {
  const exercise = getExerciseById(id);

  if (!exercise) {
    return;
  }

  const confirmed = confirm(`¿Eliminar "${exercise.name}"?`);

  if (!confirmed) {
    return;
  }

  const exercises = getExercises().filter((item) => item.id !== id);

  saveExercises(exercises);

  updateExerciseSelectors();

  renderExercises();

  renderDashboard();

  showNotification("Ejercicio eliminado.");
}

function toggleFavorite(id) {
  const exercises = getExercises();

  const exercise = exercises.find((item) => item.id === id);

  if (!exercise) {
    return;
  }

  exercise.favorite = !exercise.favorite;

  saveExercises(exercises);

  renderExercises();

  updateExerciseSelectors();

  renderDashboard();
}

/* =========================================================
   ROUTINES
   ========================================================= */

function getRoutines() {
  const routines = readStorage(STORAGE_KEYS.routines, []);

  return Array.isArray(routines) ? routines : [];
}

function saveRoutines(routines) {
  writeStorage(STORAGE_KEYS.routines, routines);
}

function openRoutineModal(routine = null) {
  $("routineModal").classList.remove("hidden");

  $("routineForm").reset();

  $("routineExercises").innerHTML = "";

  if (routine) {
    $("routineModalTitle").textContent = "Editar rutina";

    $("routineId").value = routine.id;

    $("routineName").value = routine.name;

    $("routineDescription").value = routine.description || "";

    routine.exercises.forEach((item) => {
      addRoutineExerciseRow(item);
    });
  } else {
    $("routineModalTitle").textContent = "Nueva rutina";

    $("routineId").value = "";

    addRoutineExerciseRow();
  }
}

function closeRoutineModal() {
  $("routineModal").classList.add("hidden");
}

function addRoutineExerciseRow(data = null) {
  const container = $("routineExercises");

  const row = document.createElement("div");

  row.className = "routine-builder-row";

  const exercises = getExercises();

  let options = `
        <option value="">
            Seleccionar ejercicio
        </option>
    `;

  exercises.forEach((exercise) => {
    const selected = data && data.exerciseId === exercise.id ? "selected" : "";

    options += `
            <option
                value="${exercise.id}"
                ${selected}
            >
                ${escapeHtml(exercise.name)}
            </option>
        `;
  });

  row.innerHTML = `

        <select class="routine-exercise-select">
            ${options}
        </select>

        <input
            class="routine-minutes"
            type="number"
            min="1"
            max="180"
            value="${data?.minutes || 5}"
            title="Minutos"
        >

        <input
            class="routine-bpm"
            type="number"
            min="20"
            max="300"
            value="${data?.bpm || 80}"
            title="BPM"
        >

        <button
            type="button"
            class="remove-routine-row"
            title="Eliminar"
        >
            ×
        </button>
    `;

  row
    .querySelector(".remove-routine-row")
    .addEventListener("click", () => row.remove());

  container.appendChild(row);
}

function saveRoutineFromForm(event) {
  event.preventDefault();

  const name = $("routineName").value.trim();

  if (!name) {
    showNotification("Escribe un nombre para la rutina.");

    return;
  }

  const rows = [...document.querySelectorAll(".routine-builder-row")];

  const routineExercises = [];

  rows.forEach((row) => {
    const exerciseId = row.querySelector(".routine-exercise-select").value;

    if (!exerciseId) {
      return;
    }

    routineExercises.push({
      exerciseId,

      minutes: Number(row.querySelector(".routine-minutes").value) || 5,

      bpm: Number(row.querySelector(".routine-bpm").value) || 80,
    });
  });

  if (routineExercises.length === 0) {
    showNotification("Añade al menos un ejercicio.");

    return;
  }

  const routines = getRoutines();

  const id = $("routineId").value;

  const existing = routines.find((routine) => routine.id === id);

  const routine = {
    id: id || generateId("routine"),

    name,

    description: $("routineDescription").value.trim(),

    exercises: routineExercises,

    createdAt: existing?.createdAt || new Date().toISOString(),

    updatedAt: new Date().toISOString(),
  };

  const index = routines.findIndex((item) => item.id === id);

  if (index >= 0) {
    routines[index] = routine;
  } else {
    routines.push(routine);
  }

  saveRoutines(routines);

  closeRoutineModal();

  renderRoutines();

  showNotification(id ? "Rutina actualizada." : "Rutina creada.");
}

function renderRoutines() {
  const container = $("routineList");

  const empty = $("emptyRoutines");

  const routines = getRoutines();

  container.innerHTML = "";

  if (routines.length === 0) {
    empty.classList.remove("hidden");

    return;
  }

  empty.classList.add("hidden");

  routines.forEach((routine) => {
    const totalMinutes = routine.exercises.reduce(
      (total, item) => total + Number(item.minutes || 0),
      0,
    );

    const card = document.createElement("article");

    card.className = "routine-card";

    let itemsHtml = "";

    routine.exercises.forEach((item, index) => {
      const exercise = getExerciseById(item.exerciseId);

      const name = exercise ? exercise.name : "Ejercicio eliminado";

      itemsHtml += `

                    <div class="routine-item">

                        <span>
                            ${index + 1}.
                            ${escapeHtml(name)}
                        </span>

                        <span>
                            ${item.minutes} min
                            · ${item.bpm} BPM
                        </span>

                    </div>

                `;
    });

    card.innerHTML = `

            <h3>
                📋 ${escapeHtml(routine.name)}
            </h3>

            <div class="routine-description">
                ${escapeHtml(routine.description || "Sin descripción.")}
            </div>


            <div class="routine-summary">

                <div>
                    <strong>
                        ${routine.exercises.length}
                    </strong>

                    <span>ejercicios</span>
                </div>

                <div>
                    <strong>
                        ${totalMinutes}
                    </strong>

                    <span>minutos</span>
                </div>

            </div>


            <div class="routine-items">
                ${itemsHtml}
            </div>


            <div class="routine-actions">

                <button
                    class="btn btn-primary"
                    data-routine-action="start"
                    data-id="${routine.id}"
                >
                    ▶ Iniciar
                </button>

                <button
                    class="btn btn-secondary"
                    data-routine-action="edit"
                    data-id="${routine.id}"
                >
                    Editar
                </button>

                <button
                    class="btn btn-danger"
                    data-routine-action="delete"
                    data-id="${routine.id}"
                >
                    Eliminar
                </button>

            </div>
        `;

    container.appendChild(card);
  });
}

function deleteRoutine(id) {
  const routines = getRoutines();

  const routine = routines.find((item) => item.id === id);

  if (!routine) {
    return;
  }

  if (!confirm(`¿Eliminar la rutina "${routine.name}"?`)) {
    return;
  }

  saveRoutines(routines.filter((item) => item.id !== id));

  renderRoutines();

  showNotification("Rutina eliminada.");
}

/* =========================================================
   ROUTINE START
   ========================================================= */

function startRoutine(id) {
  if (sessionRunning) {
    showNotification("Primero finaliza la sesión actual.");

    return;
  }

  const routine = getRoutines().find((item) => item.id === id);

  if (!routine) {
    return;
  }

  activeRoutine = routine;

  activeRoutineIndex = 0;

  $("routineRunner").classList.remove("hidden");

  $("activeRoutineName").textContent = routine.name;

  renderRoutineProgress();

  const first = routine.exercises[0];

  const exercise = getExerciseById(first.exerciseId);

  if (!exercise) {
    showNotification("El primer ejercicio de la rutina ya no existe.");

    stopRoutine();

    return;
  }

  $("exercise").value = exercise.name;

  $("bpm").value = first.bpm || exercise.startBpm || 80;

  startSession();

  showSection("practice");

  showNotification(`Rutina iniciada: ${routine.name}`);
}

function renderRoutineProgress() {
  if (!activeRoutine) {
    return;
  }

  const container = $("routineProgress");

  container.innerHTML = "";

  activeRoutine.exercises.forEach((item, index) => {
    const exercise = getExerciseById(item.exerciseId);

    const row = document.createElement("div");

    row.className = "routine-item";

    if (index === activeRoutineIndex) {
      row.style.fontWeight = "700";
    }

    row.innerHTML = `

                <span>
                    ${
                      index < activeRoutineIndex
                        ? "✅"
                        : index === activeRoutineIndex
                          ? "▶"
                          : "○"
                    }

                    ${escapeHtml(exercise?.name || "Ejercicio eliminado")}
                </span>

                <span>
                    ${item.minutes} min
                    · ${item.bpm} BPM
                </span>

            `;

    container.appendChild(row);
  });
}

function advanceRoutine() {
  if (!activeRoutine) {
    return;
  }

  activeRoutineIndex++;

  if (activeRoutineIndex >= activeRoutine.exercises.length) {
    activeRoutine = null;

    $("routineRunner").classList.add("hidden");

    return;
  }

  const item = activeRoutine.exercises[activeRoutineIndex];

  const exercise = getExerciseById(item.exerciseId);

  if (!exercise) {
    advanceRoutine();

    return;
  }

  $("exercise").value = exercise.name;

  $("bpm").value = item.bpm || exercise.startBpm || 80;

  renderRoutineProgress();
}

function stopRoutine() {
  activeRoutine = null;

  activeRoutineIndex = 0;

  $("routineRunner").classList.add("hidden");
}

/* =========================================================
   PRACTICE SESSION
   ========================================================= */

function getSelectedBpm() {
  if ($("useMetronomeBpm").checked) {
    return Number($("bpmValue").textContent);
  }

  return Number($("bpm").value) || 80;
}

function startSession() {
  if (sessionRunning) {
    return;
  }

  const exercise = $("exercise").value.trim();

  if (!exercise) {
    showNotification("Selecciona un ejercicio.");

    return;
  }

  const bpm = getSelectedBpm();

  if (!currentSession) {
    currentSession = {
      id: generateId("session"),

      startedAt: new Date().toISOString(),

      endedAt: null,

      duration: 0,

      segments: [],

      routineId: activeRoutine?.id || null,

      routineName: activeRoutine?.name || null,
    };
  }

  currentSegment = {
    id: generateId("segment"),

    exercise,

    duration: 0,

    bpm,

    notes: $("notes").value.trim(),

    startedAt: new Date().toISOString(),

    endedAt: null,
  };

  currentSession.segments.push(currentSegment);

  sessionRunning = true;

  sessionPaused = false;

  requestWakeLock();

  segmentStartSeconds = elapsedSeconds;

  timerInterval = setInterval(updateTimer, 1000);

  updateSessionUI();

  showNotification("Sesión iniciada.");
}

function updateTimer() {
  if (!sessionRunning || sessionPaused) {
    return;
  }

  elapsedSeconds++;

  $("timer").textContent = formatTime(elapsedSeconds);

  const segmentElapsed = elapsedSeconds - segmentStartSeconds;

  $("currentSegmentTime").textContent = formatTime(segmentElapsed).slice(3);

  $("currentSegmentBpm").textContent = currentSegment?.bpm || "—";
}

function pauseSession() {
  if (!sessionRunning) {
    return;
  }

  if (sessionPaused) {
    sessionPaused = false;

    requestWakeLock();

    timerInterval = setInterval(updateTimer, 1000);

    $("pauseBtn").textContent = "⏸ Pausar";

    $("timerStatus").textContent = "En curso";

    return;
  }

  sessionPaused = true;

  clearInterval(timerInterval);

  timerInterval = null;

  $("pauseBtn").textContent = "▶ Continuar";

  $("timerStatus").textContent = "Pausado";
}

function finishSession() {
  if (!currentSession) {
    return;
  }

  clearInterval(timerInterval);

  timerInterval = null;

  const segmentElapsed = elapsedSeconds - segmentStartSeconds;

  if (currentSegment) {
    currentSegment.duration = Math.max(0, segmentElapsed);

    currentSegment.endedAt = new Date().toISOString();
  }

  currentSession.duration = currentSession.segments.reduce(
    (total, segment) => total + Number(segment.duration || 0),
    0,
  );

  currentSession.endedAt = new Date().toISOString();

  const sessions = getSessions();

  sessions.unshift(normalizeSession(currentSession));

  saveSessions(sessions);

  currentSession = null;

  currentSegment = null;

  sessionRunning = false;

  sessionPaused = false;

  elapsedSeconds = 0;

  segmentStartSeconds = 0;

  stopRoutine();

  $("timer").textContent = "00:00:00";

  $("currentExerciseTitle").textContent = "Sin ejercicio";

  $("currentSegmentTime").textContent = "00:00";

  $("currentSegmentBpm").textContent = "—";

  updateSessionUI();

  loadSessions();

  showNotification("Sesión guardada correctamente.");
}

/* =========================================================
   CHANGE EXERCISE
   ========================================================= */

function openChangeExerciseModal() {
  if (!sessionRunning) {
    return;
  }

  const exercises = getExercises();

  if (exercises.length === 0) {
    showNotification("Primero crea un ejercicio.");

    return;
  }

  $("nextExercise").value = exercises[0].name;

  $("nextBpm").value = getSelectedBpm();

  $("nextNotes").value = "";

  $("changeExerciseModal").classList.remove("hidden");
}

function closeChangeExerciseModal() {
  $("changeExerciseModal").classList.add("hidden");
}

function confirmChangeExercise() {
  if (!currentSession || !currentSegment) {
    return;
  }

  const segmentElapsed = elapsedSeconds - segmentStartSeconds;

  currentSegment.duration = Math.max(0, segmentElapsed);

  currentSegment.endedAt = new Date().toISOString();

  const exercise = $("nextExercise").value;

  const bpm = Number($("nextBpm").value) || 80;

  currentSegment = {
    id: generateId("segment"),

    exercise,

    duration: 0,

    bpm,

    notes: $("nextNotes").value.trim(),

    startedAt: new Date().toISOString(),

    endedAt: null,
  };

  currentSession.segments.push(currentSegment);

  segmentStartSeconds = elapsedSeconds;

  $("exercise").value = exercise;

  $("bpm").value = bpm;

  $("notes").value = "";

  $("currentExerciseTitle").textContent = exercise;

  $("currentSegmentTime").textContent = "00:00";

  $("currentSegmentBpm").textContent = bpm;

  closeChangeExerciseModal();

  if (activeRoutine) {
    advanceRoutine();
  }

  showNotification(`Ejercicio cambiado: ${exercise}`);
}

/* =========================================================
   SESSION UI
   ========================================================= */

function updateSessionUI() {
  $("startBtn").disabled = sessionRunning;

  $("pauseBtn").disabled = !sessionRunning;

  $("changeExerciseBtn").disabled = !sessionRunning;

  $("finishBtn").disabled = !sessionRunning;

  if (sessionRunning) {
    $("timerStatus").textContent = sessionPaused ? "Pausado" : "En curso";

    $("currentExerciseTitle").textContent =
      currentSegment?.exercise || "Sin ejercicio";
  } else {
    $("timerStatus").textContent = "Sin iniciar";
  }
}

/* =========================================================
   HISTORY
   ========================================================= */

function loadSessions() {
  const sessions = getSessions();

  const tbody = $("sessionTable");

  const empty = $("emptyHistory");

  const tableContainer = $("sessionTableContainer");

  tbody.innerHTML = "";

  if (sessions.length === 0) {
    empty.classList.remove("hidden");

    tableContainer.classList.add("hidden");

    renderDashboard();

    return;
  }

  empty.classList.add("hidden");

  tableContainer.classList.remove("hidden");

  sessions.forEach((session) => {
    const row = document.createElement("tr");

    row.className = "session-row";

    const date = parseDate(session.startedAt);

    const dateText = date ? date.toLocaleString("es-PE") : "Fecha desconocida";

    const exerciseNames = [
      ...new Set(session.segments.map((segment) => segment.exercise)),
    ];

    row.innerHTML = `

            <td>
                ${escapeHtml(dateText)}
            </td>

            <td>
                ${formatShortTime(session.duration)}
            </td>

            <td>
                ${exerciseNames.length}
            </td>

            <td>

                <button
                    class="btn btn-secondary"
                    data-session-action="details"
                    data-id="${session.id}"
                >
                    Ver
                </button>

                <button
                    class="btn btn-danger"
                    data-session-action="delete"
                    data-id="${session.id}"
                >
                    🗑️
                </button>

            </td>
        `;

    tbody.appendChild(row);

    const detailRow = document.createElement("tr");

    detailRow.id = `details-${session.id}`;

    detailRow.className = "session-details hidden";

    const segmentsHtml = session.segments
      .map(
        (segment) => `

                    <div class="detail-segment">

                        <strong>
                            ${escapeHtml(segment.exercise)}
                        </strong>

                        <br>

                        ⏱️
                        ${formatShortTime(segment.duration)}

                        ·

                        🎵
                        ${segment.bpm || "—"}
                        BPM

                        ${
                          segment.notes
                            ? `
                                    <br>
                                    📝
                                    ${escapeHtml(segment.notes)}
                                `
                            : ""
                        }

                    </div>

                `,
      )
      .join("");

    detailRow.innerHTML = `

            <td colspan="4">

                <div class="session-detail-box">

                    ${segmentsHtml}

                </div>

            </td>
        `;

    tbody.appendChild(detailRow);
  });

  renderDashboard();
}

function toggleSessionDetails(id) {
  const row = $(`details-${id}`);

  if (!row) {
    return;
  }

  row.classList.toggle("hidden");
}

function deleteSession(id) {
  const confirmed = confirm("¿Eliminar esta sesión?");

  if (!confirmed) {
    return;
  }

  const sessions = getSessions().filter((session) => session.id !== id);

  saveSessions(sessions);

  loadSessions();

  showNotification("Sesión eliminada.");
}

function clearHistory() {
  const sessions = getSessions();

  if (sessions.length === 0) {
    showNotification("El historial ya está vacío.");

    return;
  }

  if (
    !confirm("¿Eliminar todo el historial? Esta acción no se puede deshacer.")
  ) {
    return;
  }

  saveSessions([]);

  loadSessions();

  showNotification("Historial eliminado.");
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function getTodaySeconds() {
  const today = dateKey();

  return getSessions()
    .filter((session) => {
      const date = parseDate(session.startedAt);

      return date && dateKey(date) === today;
    })
    .reduce((total, session) => total + Number(session.duration || 0), 0);
}

function getWeekStart() {
  const now = new Date();

  const day = now.getDay();

  const diff = day === 0 ? 6 : day - 1;

  const start = new Date(now);

  start.setHours(0, 0, 0, 0);

  start.setDate(start.getDate() - diff);

  return start;
}

function getWeekSeconds() {
  const weekStart = getWeekStart();

  return getSessions()
    .filter((session) => {
      const date = parseDate(session.startedAt);

      return date && date >= weekStart;
    })
    .reduce((total, session) => total + Number(session.duration || 0), 0);
}

function calculateStreak() {
  const sessions = getSessions();

  const practicedDays = new Set();

  sessions.forEach((session) => {
    const date = parseDate(session.startedAt);

    if (date) {
      practicedDays.add(dateKey(date));
    }
  });

  let streak = 0;

  const current = new Date();

  current.setHours(0, 0, 0, 0);

  while (practicedDays.has(dateKey(current))) {
    streak++;

    current.setDate(current.getDate() - 1);
  }

  return streak;
}

function getSettings() {
  const settings = readStorage(STORAGE_KEYS.settings, {});

  return {
    dailyGoal: Number(settings.dailyGoal) || 30,
  };
}

function saveSettings(settings) {
  writeStorage(STORAGE_KEYS.settings, settings);
}

function renderDashboard() {
  const sessions = getSessions();

  const totalSeconds = sessions.reduce(
    (total, session) => total + Number(session.duration || 0),
    0,
  );

  const todaySeconds = getTodaySeconds();

  const weekSeconds = getWeekSeconds();

  const exerciseNames = new Set();

  sessions.forEach((session) => {
    session.segments.forEach((segment) => {
      if (segment.exercise) {
        exerciseNames.add(segment.exercise);
      }
    });
  });

  $("totalTime").textContent = formatShortTime(totalSeconds);

  $("totalSessions").textContent = sessions.length;

  $("todayTime").textContent = formatShortTime(todaySeconds);

  $("weekTime").textContent = formatShortTime(weekSeconds);

  $("exerciseCount").textContent = exerciseNames.size;

  const streak = calculateStreak();

  $("currentStreak").textContent = `${streak} día${streak === 1 ? "" : "s"}`;

  const settings = getSettings();

  $("dailyGoal").value = settings.dailyGoal;

  const goalSeconds = settings.dailyGoal * 60;

  const percentage =
    goalSeconds > 0
      ? Math.min(100, Math.round((todaySeconds / goalSeconds) * 100))
      : 0;

  $("goalPercentage").textContent = `${percentage}%`;

  $("goalTimeText").textContent = `${formatShortTime(
    todaySeconds,
  )} / ${settings.dailyGoal} min`;

  const degrees = percentage * 3.6;

  $("goalCircle").style.background = `
        conic-gradient(
            var(--primary) ${degrees}deg,
            #e5e7eb ${degrees}deg
        )
        `;

  renderRecentActivity();

  renderDashboardExercises();
}

function renderRecentActivity() {
  const container = $("recentActivity");

  const sessions = getSessions();

  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();

    date.setDate(date.getDate() - i);

    date.setHours(0, 0, 0, 0);

    const key = dateKey(date);

    const seconds = sessions
      .filter((session) => {
        const sessionDate = parseDate(session.startedAt);

        return sessionDate && dateKey(sessionDate) === key;
      })
      .reduce((total, session) => total + Number(session.duration || 0), 0);

    days.push({
      date,
      seconds,
    });
  }

  const max = Math.max(1, ...days.map((day) => day.seconds));

  container.innerHTML = days
    .map((day) => {
      const width = Math.round((day.seconds / max) * 100);

      const label = day.date.toLocaleDateString("es-PE", {
        weekday: "short",
      });

      return `

                <div class="activity-day">

                    <span class="activity-day-label">
                        ${label}
                    </span>

                    <div class="activity-bar">

                        <div
                            class="activity-bar-fill"
                            style="width:${width}%"
                        ></div>

                    </div>

                    <span class="activity-value">
                        ${Math.round(day.seconds / 60)}m
                    </span>

                </div>

            `;
    })
    .join("");
}

function renderDashboardExercises() {
  const container = $("dashboardExercises");

  const exercises = getExercises().slice(0, 6);

  if (exercises.length === 0) {
    container.innerHTML = `
            <p class="empty-message">
                No tienes ejercicios todavía.
            </p>
        `;

    return;
  }

  container.innerHTML = exercises
    .map((exercise) => {
      const stats = getExerciseStats(exercise.name);

      return `

                <div class="mini-exercise">

                    <strong>
                        ${exercise.favorite ? "⭐ " : ""}

                        ${escapeHtml(exercise.name)}
                    </strong>

                    <span>
                        ${exercise.category}
                        ·
                        ${formatShortTime(stats.totalTime)}

                        ·
                        ${stats.maxBpm || 0} BPM
                    </span>

                </div>

            `;
    })
    .join("");
}

function saveDailyGoal() {
  const value = Number($("dailyGoal").value);

  if (!Number.isFinite(value) || value < 1) {
    showNotification("El objetivo debe ser de al menos 1 minuto.");

    return;
  }

  saveSettings({
    dailyGoal: Math.min(600, Math.round(value)),
  });

  renderDashboard();

  showNotification("Objetivo diario guardado.");
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function showSection(sectionId) {
  document.querySelectorAll(".app-section").forEach((section) => {
    section.classList.toggle("active", section.id === sectionId);
  });

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
}

/* =========================================================
   METRONOME
   ========================================================= */

function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      showNotification("Este navegador no soporta Web Audio.");

      return null;
    }

    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

/*
    V4.1 AUDIO FIX

    Volumen reducido para evitar saturación
    en navegadores que manejan el audio
    de forma diferente.
*/

function playClick(isAccent = false) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();

  const gain = context.createGain();

  oscillator.type = "sine";

  oscillator.frequency.setValueAtTime(
    isAccent ? 1000 : 700,

    context.currentTime,
  );

  const volume = isAccent ? 0.8 : 0.5;

  const now = context.currentTime;

  gain.gain.setValueAtTime(0.0001, now);

  gain.gain.exponentialRampToValueAtTime(volume, now + 0.003);

  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

  oscillator.connect(gain);

  gain.connect(context.destination);

  oscillator.start(now);

  oscillator.stop(now + 0.05);
}

function getMetronomeInterval() {
  const bpm = Number($("bpmValue").textContent) || 80;

  const subdivision = Number($("subdivision").value) || 1;

  return 60000 / bpm / subdivision;
}

function updateBeatIndicator() {
  const dots = document.querySelectorAll("#beatIndicator span");

  dots.forEach((dot) => {
    dot.classList.remove("active", "accent");
  });

  const index = currentBeat % 4;

  if (dots[index]) {
    dots[index].classList.add("active");

    if (index === 0) {
      dots[index].classList.add("accent");
    }
  }

  currentBeat++;
}

function metronomeTick() {
  playClick(currentBeat % 4 === 0);

  updateBeatIndicator();
}

function startMetronome() {
  if (metronomeRunning) {
    return;
  }

  getAudioContext();

  requestWakeLock();

  metronomeRunning = true;

  currentBeat = 0;

  metronomeTick();

  metronomeInterval = setInterval(metronomeTick, getMetronomeInterval());

  $("metronomeStatus").textContent = "En marcha";
}

function stopMetronome() {
  clearInterval(metronomeInterval);

  metronomeInterval = null;

  metronomeRunning = false;

  currentBeat = 0;

  document.querySelectorAll("#beatIndicator span").forEach((dot) => {
    dot.classList.remove("active", "accent");
  });

  $("metronomeStatus").textContent = "Detenido";

  if (!sessionRunning) {
    releaseWakeLock();
  }
}

function restartMetronomeIfRunning() {
  if (!metronomeRunning) {
    return;
  }

  clearInterval(metronomeInterval);

  metronomeInterval = setInterval(metronomeTick, getMetronomeInterval());
}

function changeBpm(amount) {
  const element = $("bpmValue");

  let bpm = Number(element.textContent) || 80;

  bpm += amount;

  bpm = Math.max(20, Math.min(300, bpm));

  element.textContent = bpm;

  $("bpm").value = bpm;

  restartMetronomeIfRunning();
}

function handleTapTempo() {
  const now = performance.now();

  if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 2000) {
    tapTimes = [];
  }

  tapTimes.push(now);

  if (tapTimes.length > 8) {
    tapTimes.shift();
  }

  clearTimeout(tapResetTimeout);

  tapResetTimeout = setTimeout(() => {
    tapTimes = [];
  }, 2000);

  if (tapTimes.length < 2) {
    return;
  }

  const intervals = [];

  for (let i = 1; i < tapTimes.length; i++) {
    intervals.push(tapTimes[i] - tapTimes[i - 1]);
  }

  const average = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  let bpm = Math.round(60000 / average);

  bpm = Math.max(20, Math.min(300, bpm));

  $("bpmValue").textContent = bpm;

  $("bpm").value = bpm;

  restartMetronomeIfRunning();
}

/* =========================================================
   EXPORT / IMPORT
   ========================================================= */

function exportData() {
  const data = {
    app: "Guitar Practice",

    version: DATA_VERSION,

    exportedAt: new Date().toISOString(),

    data: {
      sessions: getSessions(),

      exercises: getExercises(),

      routines: getRoutines(),

      settings: getSettings(),
    },
  };

  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  const date = dateKey();

  link.href = url;

  link.download = `guitar-practice-backup-${date}.json`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);

  showNotification("Backup exportado correctamente.");
}

function openImport() {
  $("importFile").value = "";

  $("importFile").click();
}

let pendingImportData = null;

function handleImportFile(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);

      const normalized = normalizeImportedData(parsed);

      if (!normalized) {
        throw new Error("Formato no reconocido.");
      }

      pendingImportData = normalized;

      $("importModal").classList.remove("hidden");
    } catch (error) {
      console.error(error);

      showNotification("El archivo no es válido.");
    }
  };

  reader.readAsText(file);
}

function normalizeImportedData(parsed) {
  if (parsed && parsed.data) {
    return {
      sessions: Array.isArray(parsed.data.sessions) ? parsed.data.sessions : [],

      exercises: Array.isArray(parsed.data.exercises)
        ? parsed.data.exercises
        : [],

      routines: Array.isArray(parsed.data.routines) ? parsed.data.routines : [],

      settings: parsed.data.settings || {},
    };
  }

  /* V4 */

  if (parsed && Array.isArray(parsed.sessions)) {
    return {
      sessions: parsed.sessions,

      exercises: [],

      routines: [],

      settings: {},
    };
  }

  /* Legacy direct array */

  if (Array.isArray(parsed)) {
    return {
      sessions: parsed,

      exercises: [],

      routines: [],

      settings: {},
    };
  }

  return null;
}

function mergeById(current, incoming) {
  const map = new Map();

  current.forEach((item) => {
    if (item.id) {
      map.set(item.id, item);
    }
  });

  incoming.forEach((item) => {
    if (!item.id) {
      item.id = generateId("import");
    }

    map.set(item.id, item);
  });

  return [...map.values()];
}

function mergeImportedData() {
  if (!pendingImportData) {
    return;
  }

  const currentSessions = getSessions();

  const currentExercises = getExercises();

  const currentRoutines = getRoutines();

  saveSessions(
    mergeById(
      currentSessions,
      pendingImportData.sessions.map(normalizeSession),
    ),
  );

  saveExercises(mergeById(currentExercises, pendingImportData.exercises));

  saveRoutines(mergeById(currentRoutines, pendingImportData.routines));

  if (pendingImportData.settings && pendingImportData.settings.dailyGoal) {
    saveSettings(pendingImportData.settings);
  }

  finishImport();

  showNotification("Datos combinados correctamente.");
}

function replaceImportedData() {
  if (!pendingImportData) {
    return;
  }

  saveSessions(pendingImportData.sessions.map(normalizeSession));

  saveExercises(pendingImportData.exercises);

  saveRoutines(pendingImportData.routines);

  if (pendingImportData.settings) {
    saveSettings(pendingImportData.settings);
  }

  finishImport();

  showNotification("Datos reemplazados correctamente.");
}

function finishImport() {
  pendingImportData = null;

  $("importModal").classList.add("hidden");

  createDefaultExercises();

  updateExerciseSelectors();

  renderExercises();

  renderRoutines();

  loadSessions();

  renderDashboard();
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    refreshWakeLock();
  }
});

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEvents() {
  $("themeToggleBtn").addEventListener("click", toggleTheme);
  /* Navigation */

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => {
      showSection(button.dataset.section);
    });
  });

  document.querySelectorAll("[data-go-section]").forEach((button) => {
    button.addEventListener("click", () => {
      showSection(button.dataset.goSection);
    });
  });

  /* Exercise */

  $("newExerciseBtn").addEventListener("click", () => openExerciseModal());

  $("emptyNewExerciseBtn").addEventListener("click", () => openExerciseModal());

  $("closeExerciseModal").addEventListener("click", closeExerciseModal);

  $("cancelExerciseBtn").addEventListener("click", closeExerciseModal);

  $("exerciseForm").addEventListener("submit", saveExerciseFromForm);

  $("exerciseSearch").addEventListener("input", renderExercises);

  $("exerciseCategoryFilter").addEventListener("change", renderExercises);

  $("favoriteFilter").addEventListener("change", renderExercises);

  $("exerciseList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    const action = button.dataset.action;

    const id = button.dataset.id;

    if (action === "favorite") {
      toggleFavorite(id);
    }

    if (action === "edit") {
      const exercise = getExerciseById(id);

      if (exercise) {
        openExerciseModal(exercise);
      }
    }

    if (action === "delete") {
      deleteExercise(id);
    }

    if (action === "practice") {
      const exercise = getExerciseById(id);

      if (!exercise) {
        return;
      }

      $("exercise").value = exercise.name;

      $("bpm").value = exercise.startBpm;

      showSection("practice");

      showNotification(`${exercise.name} seleccionado.`);
    }
  });

  /* Routines */

  $("newRoutineBtn").addEventListener("click", () => openRoutineModal());

  $("emptyNewRoutineBtn").addEventListener("click", () => openRoutineModal());

  $("closeRoutineModal").addEventListener("click", closeRoutineModal);

  $("cancelRoutineBtn").addEventListener("click", closeRoutineModal);

  $("routineForm").addEventListener("submit", saveRoutineFromForm);

  $("addRoutineExerciseBtn").addEventListener("click", () =>
    addRoutineExerciseRow(),
  );

  $("routineList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-routine-action]");

    if (!button) {
      return;
    }

    const action = button.dataset.routineAction;

    const id = button.dataset.id;

    if (action === "start") {
      startRoutine(id);
    }

    if (action === "edit") {
      const routine = getRoutines().find((item) => item.id === id);

      if (routine) {
        openRoutineModal(routine);
      }
    }

    if (action === "delete") {
      deleteRoutine(id);
    }
  });

  $("stopRoutineBtn").addEventListener("click", stopRoutine);

  /* Practice */

  $("startBtn").addEventListener("click", startSession);

  $("pauseBtn").addEventListener("click", pauseSession);

  $("finishBtn").addEventListener("click", finishSession);

  $("changeExerciseBtn").addEventListener("click", openChangeExerciseModal);

  $("closeChangeExerciseModal").addEventListener(
    "click",
    closeChangeExerciseModal,
  );

  $("cancelChangeExerciseBtn").addEventListener(
    "click",
    closeChangeExerciseModal,
  );

  $("confirmChangeExerciseBtn").addEventListener(
    "click",
    confirmChangeExercise,
  );

  $("exercise").addEventListener("change", () => {
    const exercise = getExerciseByName($("exercise").value);

    if (!exercise) {
      return;
    }

    if (!sessionRunning) {
      $("bpm").value = exercise.startBpm;
    }
  });

  $("useMetronomeBpm").addEventListener("change", () => {
    if ($("useMetronomeBpm").checked) {
      $("bpm").value = $("bpmValue").textContent;
    }
  });

  /* Metronome */

  $("bpmMinus").addEventListener("click", () => changeBpm(-1));

  $("bpmPlus").addEventListener("click", () => changeBpm(1));

  $("tapTempoBtn").addEventListener("click", handleTapTempo);

  $("metronomeStart").addEventListener("click", startMetronome);

  $("metronomeStop").addEventListener("click", stopMetronome);

  $("subdivision").addEventListener("change", restartMetronomeIfRunning);

  /* History */

  $("sessionTable").addEventListener("click", (event) => {
    const button = event.target.closest("[data-session-action]");

    if (!button) {
      return;
    }

    const action = button.dataset.sessionAction;

    const id = button.dataset.id;

    if (action === "details") {
      toggleSessionDetails(id);
    }

    if (action === "delete") {
      deleteSession(id);
    }
  });

  $("clearHistoryBtn").addEventListener("click", clearHistory);

  /* Dashboard */

  $("saveGoalBtn").addEventListener("click", saveDailyGoal);

  /* Export */

  $("exportBtn").addEventListener("click", exportData);

  $("importBtn").addEventListener("click", openImport);

  $("importFile").addEventListener("change", handleImportFile);

  $("closeImportModal").addEventListener("click", () => {
    pendingImportData = null;

    $("importModal").classList.add("hidden");
  });

  $("mergeImportBtn").addEventListener("click", mergeImportedData);

  $("replaceImportBtn").addEventListener("click", replaceImportedData);

  /* Close modal clicking background */

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.add("hidden");

        if (modal.id === "importModal") {
          pendingImportData = null;
        }
      }
    });
  });
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

function init() {
  initTheme();

  createDefaultExercises();

  setupEvents();

  updateExerciseSelectors();

  renderExercises();

  renderRoutines();

  loadSessions();

  renderDashboard();

  $("bpmValue").textContent = "80";

  $("bpm").value = "80";

  updateSessionUI();
}

init();
