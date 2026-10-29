const app = document.querySelector("#app");
const dialog = document.querySelector("#dialog");
let route = "";
let dialogOrigin;
let toastTimeout;
function getRoute() {
  return location.hash.replace(/^#\/?/, "") || "explorar";
}
function render({ focus = false } = {}) {
  const focused = document.activeElement;
  const focusId = focused?.id;
  const selection =
    focused instanceof HTMLInputElement && focused.type === "search"
      ? [focused.selectionStart, focused.selectionEnd]
      : null;
  route = getRoute();
  const [page, id] = route.split("/");
  const content =
    page === "explorar"
      ? explorePage()
      : page === "biblioteca"
        ? libraryPage()
        : page === "libro"
          ? bookDetailPage(id)
          : page === "reproductor"
            ? playerPage()
            : page === "perfil"
              ? profilePage()
              : `<div class="empty-state"><h1>Esta página aún no tiene historia.</h1><a href="#/explorar" class="btn">Volver a explorar</a></div>`;
  app.innerHTML = shell(content, route);
  document.title = `${{ explorar: "Explorar", biblioteca: "Mi Biblioteca", libro: "Detalle del libro", reproductor: "Reproductor", perfil: "Mi Perfil" }[page] || "Página no encontrada"} · Ecualiapp`;
  document.querySelectorAll(".cover img").forEach((img) => {
    img.addEventListener("error", () =>
      img.closest(".cover").classList.add("image-failed"),
    );
    if (img.complete && !img.naturalWidth)
      img.closest(".cover").classList.add("image-failed");
  });
  if (focus) {
    document.querySelector("#main").focus({ preventScroll: true });
    window.scrollTo(0, 0);
  } else if (focusId) {
    const el = document.getElementById(focusId);
    el?.focus({ preventScroll: true });
    if (selection && el instanceof HTMLInputElement)
      el.setSelectionRange(...selection);
  }
}
function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => (el.hidden = true), 3200);
}
function go(path) {
  if (getRoute() === path) render();
  else location.hash = `/${path}`;
}
function openDialog(title, html) {
  dialogOrigin = document.activeElement;
  dialog.innerHTML = `<div class="dialog-header"><div><span class="eyebrow">A TU RITMO</span><h2 id="dialog-title">${title}</h2></div><button class="icon-btn" data-action="close-dialog" aria-label="Cerrar">${icon("close")}</button></div>${html}`;
  dialog.showModal();
}
function closeDialog() {
  dialog.close();
  const oldId = dialogOrigin?.id;
  if (dialogOrigin?.isConnected) dialogOrigin.focus();
  else if (oldId) document.getElementById(oldId)?.focus();
}
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeDialog();
  }
});
function tick() {
  document.querySelectorAll("#volume, #player-volume").forEach((el) => {
    if (document.activeElement !== el) el.value = state.volume;
  });
  document
    .querySelectorAll("[data-current-time]")
    .forEach((el) => (el.textContent = formatTime(state.position)));
  document
    .querySelectorAll("[data-remaining-time]")
    .forEach(
      (el) => (el.textContent = `−${formatTime(duration() - state.position)}`),
    );
  document.querySelectorAll("[data-seek]").forEach((el) => {
    if (document.activeElement !== el) el.value = state.position;
  });
  document
    .querySelectorAll(".waveform span")
    .forEach((el, i) =>
      el.classList.toggle("elapsed", i / 56 < state.position / duration()),
    );
  document
    .querySelectorAll("[data-mini-progress]")
    .forEach(
      (el) => (el.style.width = `${(state.position / duration()) * 100}%`),
    );
}
subscribe((type) => (type === "tick" ? tick() : render()));
window.addEventListener("hashchange", () => {
  if (dialog.open) closeDialog();
  render({ focus: true });
});
document.addEventListener("input", (e) => {
  const el = e.target;
  if (el.matches("[data-seek]")) seek(el.value);
  if (el.id === "catalog-search") {
    exploreView.query = el.value;
    render();
  }
  if (el.id === "library-search") {
    libraryView.query = el.value;
    render();
  }
  if (el.id === "volume" || el.id === "player-volume") {
    setVolume(Number(el.value));
    document
      .querySelectorAll("[data-volume-label]")
      .forEach((label) => (label.textContent = `${state.volume}%`));
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "voice-select") setVoice(e.target.value);
  if (
    (e.target.id === "volume" || e.target.id === "player-volume") &&
    state.voiceId !== "included" &&
    state.playing
  )
    startNarration();
  if (e.target.id === "library-sort") {
    libraryView.sort = e.target.value;
    render();
  }
  if (e.target.id === "reminders") {
    try {
      localStorage.setItem("ecualiapp-web-reminders", e.target.checked);
    } catch {}
    toast("Preferencia de demostración actualizada");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.target.id === "global-search" && e.key === "Enter") {
    exploreView.query = e.target.value;
    exploreView.category = "Todo";
    go("explorar");
    document.getElementById("catalog-search")?.focus();
  }
  if (
    e.code === "Space" &&
    !dialog.open &&
    getRoute() === "reproductor" &&
    !["INPUT", "BUTTON", "SELECT", "TEXTAREA", "A"].includes(e.target.tagName)
  ) {
    e.preventDefault();
    togglePlay();
  }
});
document.addEventListener("click", async (e) => {
  const author = e.target.closest("[data-author]");
  if (author) {
    e.preventDefault();
    exploreView.query = author.dataset.author;
    exploreView.category = "Todo";
    go("explorar");
    return;
  }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const { action, id } = el.dataset;
  const b = state.books.find((b) => b.id === id);
  switch (action) {
    case "reset-catalog":
      e.preventDefault();
      exploreView.query = "";
      exploreView.category = "Todo";
      go("explorar");
      break;
    case "close-dialog":
      closeDialog();
      break;
    case "notifications":
      toast("Estás al día. Tu próxima historia te espera.");
      break;
    case "category":
      exploreView.category = el.dataset.category;
      render();
      break;
    case "narrator":
      exploreView.query = el.dataset.name;
      exploreView.category = "Todo";
      go("explorar");
      window.scrollTo({ top: 0, behavior: "smooth" });
      break;
    case "relax":
      exploreView.category = "Bienestar & Sueño";
      exploreView.query = "";
      go("explorar");
      break;
    case "favorite":
      if (b) {
        updateBook(id, { favorite: !b.favorite });
        toast(
          b.favorite
            ? "Eliminado de tus favoritos"
            : "Guardado en tus favoritos",
        );
      }
      break;
    case "download":
      if (b) {
        updateBook(id, { downloaded: !b.downloaded });
        toast(
          b.downloaded
            ? "Descarga simulada eliminada"
            : "Descarga simulada guardada en tu biblioteca",
        );
      }
      break;
    case "play":
      playBook(id);
      go("reproductor");
      break;
    case "sample":
      playBook(id, 0);
      go("reproductor");
      toast("Muestra con voz sintética · Texto original de ejemplo");
      break;
    case "play-chapter":
      playBook(id, Number(el.dataset.chapter));
      go("reproductor");
      break;
    case "queue-chapter":
      changeChapter(Number(el.dataset.chapter), true);
      break;
    case "toggle-play":
      togglePlay();
      break;
    case "rewind":
      seek(state.position - 15);
      break;
    case "forward":
      seek(state.position + 15);
      break;
    case "previous":
      changeChapter(state.chapter - 1);
      break;
    case "next":
      changeChapter(state.chapter + 1);
      break;
    case "speed":
      openDialog(
        "Velocidad de narración",
        `<p>Encuentra el ritmo perfecto para tu historia.</p><div class="dialog-choices">${[0.8, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5].map((v) => `<button class="choice ${state.speed === v ? "selected" : ""}" data-action="set-speed" data-value="${v}">${v}×</button>`).join("")}</div>`,
      );
      break;
    case "set-speed":
      setSpeed(Number(el.dataset.value));
      closeDialog();
      break;
    case "sleep":
      openDialog(
        "Un capítulo antes de dormir",
        `<p>La reproducción se pausará cuando termine el tiempo seleccionado.</p><div class="dialog-choices">${[0, 15, 30, 45, 60].map((v) => `<button class="choice ${state.sleep === v ? "selected" : ""}" data-action="set-sleep" data-value="${v}">${v ? `${v} min` : "Desactivado"}</button>`).join("")}</div><small>El temporizador funciona mientras esta página permanece abierta.</small>`,
      );
      break;
    case "set-sleep":
      setSleep(Number(el.dataset.value));
      closeDialog();
      toast(
        state.sleep
          ? `Pausa automática en ${state.sleep} minutos`
          : "Temporizador desactivado",
      );
      break;
    case "bookmark":
      addNote();
      toast("Este momento ya es tuyo. Marcador guardado.");
      break;
    case "restore-note":
      restoreNote(Number(el.dataset.index));
      break;
    case "player-tab":
      playerView.tab = el.dataset.tab;
      render();
      break;
    case "detail-tab":
      detailView.tab = el.dataset.tab;
      render();
      break;
    case "library-filter":
      libraryView.filter = el.dataset.filter;
      render();
      break;
    case "library-layout":
      libraryView.grid = !libraryView.grid;
      render();
      break;
    case "open-favorites":
      libraryView.filter = "Favoritos";
      go("biblioteca");
      break;
    case "open-downloads":
      libraryView.filter = "Descargados";
      go("biblioteca");
      break;
    case "refresh-library":
      toast("Tu biblioteca local está actualizada");
      break;
    case "book-options":
      if (b)
        openDialog(
          esc(b.title),
          `<div class="dialog-options"><button data-action="option-download" data-id="${id}">${icon("download")}<span><strong>${b.downloaded ? "Eliminar descarga simulada" : "Simular descarga"}</strong><small>Sin archivos de audio reales</small></span></button><button data-action="option-finished" data-id="${id}">${icon("check")}<span><strong>Marcar como terminado</strong><small>Una historia más en tu viaje</small></span></button><button data-action="option-favorite" data-id="${id}">${icon("heart")}<span><strong>${b.favorite ? "Quitar de favoritos" : "Guardar en favoritos"}</strong><small>Ten a mano tus historias favoritas</small></span></button></div>`,
        );
      break;
    case "option-finished":
      updateBook(id, { progress: 100 });
      closeDialog();
      toast("Audiolibro marcado como terminado");
      break;
    case "option-download":
      updateBook(id, { downloaded: !b.downloaded });
      closeDialog();
      toast("Descarga simulada actualizada");
      break;
    case "option-favorite":
      updateBook(id, { favorite: !b.favorite });
      closeDialog();
      toast("Favoritos actualizados");
      break;
    case "drive":
      state.drive = !state.drive;
      notify();
      break;
    case "night":
      state.night = !state.night;
      notify();
      break;
    case "use-included":
      setVoice("included");
      startNarration();
      break;
    case "equalizer":
      openDialog(
        "Una voz a tu manera",
        `<p>Perfiles acústicos de demostración. La síntesis de voz y las muestras incluidas no admiten estos filtros acústicos.</p><div class="dialog-options">${["Voz cálida", "Narración clara", "Ambiente nocturno"].map((p) => `<button data-action="set-equalizer" data-name="${p}">${icon("eq")}<strong>${p}</strong></button>`).join("")}</div>`,
      );
      break;
    case "set-equalizer":
      closeDialog();
      toast(`${el.dataset.name} seleccionado · Demo`);
      break;
    case "share":
      try {
        await navigator.clipboard.writeText(location.href);
        toast("Enlace copiado");
      } catch {
        openDialog(
          "Comparte esta historia",
          `<label class="share-label">Enlace del libro<input readonly value="${esc(location.href)}" aria-label="Enlace para compartir"></label>`,
        );
      }
      break;
  }
});
render();
