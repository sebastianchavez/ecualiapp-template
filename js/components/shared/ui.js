const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function cover(book, className = "", eager = false) {
  return `<div class="cover ${className}" data-book="${esc(book.id)}"><img src="${esc(book.cover)}" alt="Portada de ${esc(book.title)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}><span class="cover-fallback">${icon("library")}<span>${esc(book.title)}</span></span></div>`;
}
function button(label, action, iconName = "", className = "btn", extra = "") {
  return `<button class="${className}" data-action="${action}" ${extra}>${iconName ? icon(iconName) : ""}${label}</button>`;
}
function sectionTitle(title, subtitle = "", href = "", label = "Ver todo") {
  return `<div class="section-heading"><div><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div>${href ? `<a class="text-link" href="${href}">${label}${icon("arrow")}</a>` : ""}</div>`;
}
function bookCard(b) {
  return `<article class="book-card group"><div class="book-art"><a href="#/libro/${b.id}" aria-label="Ver ${esc(b.title)}">${cover(b)}</a><span class="rating">${icon("star")} ${b.rating}</span><button class="card-heart ${b.favorite ? "is-favorite" : ""}" data-action="favorite" data-id="${b.id}" aria-label="${b.favorite ? "Quitar de favoritos" : "Añadir a favoritos"}: ${esc(b.title)}" aria-pressed="${b.favorite}">${icon("heart")}</button><div class="book-art-bottom"><span>${icon("time")} ${formatDuration(b.duration)}</span><button class="play-button small" data-action="play" data-id="${b.id}" aria-label="Escuchar ${esc(b.title)}">${icon("play")}</button></div></div><a href="#/libro/${b.id}"><h3>${esc(b.title)}</h3></a><p>${esc(b.author)}</p><small>${icon("mic")}${b.isExample ? "Relato original · Voz TTS" : "Muestra de presentación · TTS"}</small></article>`;
}
function empty(title, text) {
  return `<div class="empty-state">${icon("search")}<h2>${title}</h2><p>${text}</p><a class="btn secondary" href="#/explorar" data-action="reset-catalog">Explorar catálogo ${icon("arrow")}</a></div>`;
}

function narrationSettings() {
  return `<div class="narration-settings"><label>Voz de lectura<select id="voice-select" aria-label="Voz de lectura"><option value="included" ${state.voiceId === "included" ? "selected" : ""}>Dalia · Español latino · Neural (incluida)</option>${narration
    .voices()
    .map(
      (v) =>
        `<option value="${esc(v.voiceURI)}" ${state.voiceId === v.voiceURI ? "selected" : ""}>${esc(v.name)} · ${esc(v.lang)}${v.localService ? " · Local" : " · Navegador"}</option>`,
    )
    .join(
      "",
    )}</select></label><label class="tts-volume">Volumen <span data-volume-label>${state.volume}%</span><input type="range" id="player-volume" min="0" max="100" value="${state.volume}" aria-label="Volumen de lectura"></label></div><p class="voice-help">${state.voiceId === "included" ? "Narración neural en español latino, incluida en el template. No necesita conexión para reproducirse." : "Voz del navegador: el avance temporal es aproximado y los saltos reinician desde una palabra cercana."}</p>${state.error ? `<div class="audio-error" role="alert">${esc(state.error)} <button class="text-link" data-action="use-included">Usar voz incluida</button></div>` : ""}`;
}
