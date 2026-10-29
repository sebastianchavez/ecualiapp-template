const KEY = "ecualiapp-web-v1";
const base = {
  books: structuredClone(books),
  currentId: "faro",
  chapter: 0,
  position: 0,
  speed: 1,
  notes: [],
  volume: 75,
  voiceId: "included",
  audioVersion: 1,
};
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (!s) return base;
    const id =
      s.audioVersion === 1 && books.some((b) => b.id === s.currentId)
        ? s.currentId
        : base.currentId;
    const chapter = Math.min(
      chaptersFor(id).length - 1,
      Math.max(0, Number(s.chapter) || 0),
    );
    return {
      ...base,
      currentId: id,
      chapter,
      position:
        s.audioVersion === 1
          ? Math.max(
              0,
              Math.min(
                chaptersFor(id)[chapter].duration,
                Number(s.position) || 0,
              ),
            )
          : 0,
      speed: [0.8, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5].includes(s.speed)
        ? s.speed
        : 1,
      volume: Math.min(
        100,
        Math.max(0, Number.isFinite(s.volume) ? s.volume : 75),
      ),
      voiceId: typeof s.voiceId === "string" ? s.voiceId : "included",
      books: books.map((b) => {
        const old = s.books?.find((o) => o.id === b.id);
        return {
          ...b,
          progress: Number.isFinite(old?.progress)
            ? Math.min(100, Math.max(0, old.progress))
            : b.progress,
          favorite:
            typeof old?.favorite === "boolean" ? old.favorite : b.favorite,
          downloaded:
            typeof old?.downloaded === "boolean"
              ? old.downloaded
              : b.downloaded,
        };
      }),
      notes:
        s.audioVersion === 1 && Array.isArray(s.notes)
          ? s.notes.filter(
              (n) =>
                books.some((b) => b.id === n.bookId) &&
                Number.isInteger(n.chapter) &&
                n.chapter >= 0 &&
                n.chapter < chaptersFor(n.bookId).length &&
                Number.isFinite(n.position) &&
                n.position >= 0 &&
                n.position <= chaptersFor(n.bookId)[n.chapter].duration,
            )
          : [],
    };
  } catch {
    return base;
  }
}
const state = {
  ...load(),
  playing: false,
  loading: false,
  error: "",
  sleep: 0,
  drive: false,
  night: false,
};
const listeners = new Set();
let sleepTimeout;
const current = () => state.books.find((b) => b.id === state.currentId);
const chapters = () => chaptersFor(state.currentId);
const duration = () => chapters()[state.chapter].duration;
function persist() {
  const { playing, loading, error, sleep, drive, night, ...saved } = state;
  try {
    localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {}
}
function notify(type = "change") {
  persist();
  listeners.forEach((fn) => fn(type));
}
function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function updateBook(id, patch) {
  state.books = state.books.map((b) => (b.id === id ? { ...b, ...patch } : b));
  notify();
}
function recordProgress() {
  const cs = chapters();
  const total = cs.reduce((n, c) => n + c.duration, 0);
  const elapsed =
    cs.slice(0, state.chapter).reduce((n, c) => n + c.duration, 0) +
    state.position;
  current().progress = Math.min(100, Math.round((elapsed / total) * 100));
}
function startNarration() {
  state.error = "";
  narration.play({
    chapter: chapters()[state.chapter],
    position: state.position,
    rate: state.speed,
    volume: state.volume,
    voiceId: state.voiceId,
  });
}
function playBook(id, chapter) {
  if (!state.books.some((b) => b.id === id)) return;
  if (id !== state.currentId || chapter !== undefined) {
    state.currentId = id;
    state.chapter = Math.min(
      chaptersFor(id).length - 1,
      Math.max(0, chapter ?? 0),
    );
    state.position = 0;
  }
  if (state.position >= duration()) state.position = 0;
  startNarration();
}
function togglePlay() {
  if (state.playing || state.loading) narration.pause();
  else {
    if (state.position >= duration()) state.position = 0;
    startNarration();
  }
}
function seek(value) {
  state.position = Math.max(0, Math.min(duration(), Number(value) || 0));
  narration.seek(state.position);
  recordProgress();
  notify("tick");
}
function changeChapter(n, autoplay = state.playing || state.loading) {
  narration.stop();
  state.playing = false;
  state.loading = false;
  state.chapter = Math.max(0, Math.min(chapters().length - 1, n));
  state.position = 0;
  if (autoplay) startNarration();
  else notify();
}
function setSpeed(value) {
  if (![0.8, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5].includes(value)) return;
  state.speed = value;
  if (state.playing || state.loading) startNarration();
  else notify();
}
function setVolume(value) {
  state.volume = Math.max(0, Math.min(100, Number(value) || 0));
  narration.setVolume(state.volume);
  notify("tick");
}
function setVoice(id) {
  if (id !== "included" && !narration.voices().some((v) => v.voiceURI === id))
    return;
  const resume = state.playing || state.loading;
  state.voiceId = id;
  if (resume) startNarration();
  else notify();
}
function setSleep(minutes) {
  clearTimeout(sleepTimeout);
  state.sleep = minutes;
  if (minutes)
    sleepTimeout = setTimeout(() => {
      state.sleep = 0;
      narration.pause();
    }, minutes * 60000);
  notify();
}
function addNote() {
  state.notes.push({
    bookId: state.currentId,
    chapter: state.chapter,
    position: state.position,
  });
  notify();
}
function restoreNote(index) {
  const n = state.notes[index];
  if (!n) return;
  state.currentId = n.bookId;
  state.chapter = n.chapter;
  state.position = n.position;
  startNarration();
}
const narration = createNarrationEngine({
  onTime(position) {
    state.position = position;
    recordProgress();
    notify("tick");
  },
  onStatus(status) {
    state.loading = status === "loading";
    state.playing = status === "playing";
    notify();
  },
  onEnd() {
    state.position = duration();
    recordProgress();
    state.playing = false;
    state.loading = false;
    if (state.chapter < chapters().length - 1)
      changeChapter(state.chapter + 1, true);
    else notify();
  },
  onError(message) {
    state.playing = false;
    state.loading = false;
    state.error = message;
    notify();
  },
  onVoices(voices) {
    if (
      state.voiceId !== "included" &&
      !voices.some((v) => v.voiceURI === state.voiceId)
    ) {
      state.voiceId = "included";
    }
    notify();
  },
});
function voiceLabel() {
  return state.voiceId === "included"
    ? "Dalia · Español latino"
    : narration.voices().find((v) => v.voiceURI === state.voiceId)?.name ||
        "Dalia · Español latino";
}
window.addEventListener("pagehide", () => {
  narration.stop();
  state.playing = false;
  state.loading = false;
  persist();
});
