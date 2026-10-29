const detailView = { tab: "chapters" };
function bookDetailPage(id) {
  const b = state.books.find((b) => b.id === id);
  if (!b)
    return empty(
      "Libro no encontrado",
      "Esta historia no está en nuestro catálogo de demostración.",
    );
  const chapters = chaptersFor(id);
  return `<a class="breadcrumb" href="#/explorar">${icon("back")} Explorar <span>/</span> ${esc(b.category)} <span>/</span><strong>${esc(b.title)}</strong></a><div class="book-detail-hero"><div class="detail-cover-wrap">${cover(b, "detail-cover", true)}<div class="cover-sticker">${icon("headphones")} ${b.isExample ? "RELATO ORIGINAL · TTS" : "MUESTRA DE VOZ TTS"}</div><button class="icon-btn detail-share" data-action="share" aria-label="Compartir libro">${icon("share")}</button></div><div class="detail-copy"><div class="eyebrow">${icon("spark")} UNA HISTORIA QUE MERECE SER ESCUCHADA</div><h1>${esc(b.title)}</h1><a href="#/explorar" class="detail-author" data-author="${esc(b.author)}">${esc(b.author)}</a><div class="detail-narrator">${icon("mic")} Muestra con <strong>voz sintética en español</strong><span class="tag">TTS</span></div><div class="detail-rating"><span class="stars">★★★★★</span><strong>${b.rating}</strong><span>12.418 valoraciones de ejemplo</span></div><div class="detail-facts"><div>${icon("time")}<strong>${formatTime(chapters.reduce((total, c) => total + c.duration, 0))}</strong><small>${b.isExample ? "Relato de ejemplo" : "Muestra disponible"}</small></div><div>${icon("headphones")}<strong>Español</strong><small>Idioma</small></div><div>${icon("player")}<strong>Voz TTS</strong><small>Audio real</small></div><div>${icon("library")}<strong>${chapters.length} ${chapters.length === 1 ? "muestra" : "capítulos"}</strong><small>Texto original de ejemplo</small></div></div><p class="detail-excerpt">${esc(b.synopsis)}</p><div class="detail-actions"><button class="btn" data-action="play" data-id="${id}">${icon("play")} Escuchar ahora</button><button class="btn secondary ${b.favorite ? "is-favorite" : ""}" data-action="favorite" data-id="${id}" aria-pressed="${b.favorite}">${icon("heart")}${b.favorite ? "En favoritos" : "Guardar en favoritos"}</button></div><div class="detail-secondary"><button data-action="sample" data-id="${id}" class="text-link">${icon("headphones")} Escuchar muestra TTS</button><span>·</span><button data-action="download" data-id="${id}" class="text-link">${icon(b.downloaded ? "check" : "download")}${b.downloaded ? "Descargado · Demo" : "Descargar · Demo"}</button></div><small class="demo-note">${b.isExample ? "Relato original de ejemplo con audio TTS real. Descargas de biblioteca simuladas." : "La muestra es una presentación original, no el texto del libro ni la voz de su narrador comercial."}</small></div></div><div class="detail-lower"><section class="chapter-section"><div class="content-tabs"><button class="${detailView.tab === "chapters" ? "active" : ""}" data-action="detail-tab" data-tab="chapters">Capítulos <span>${chapters.length}</span></button><button class="${detailView.tab === "reviews" ? "active" : ""}" data-action="detail-tab" data-tab="reviews">Reseñas <span>4.8k</span></button></div>${
    detailView.tab === "chapters"
      ? `<div class="chapter-table"><div class="chapter-table-head"><span>#</span><span>TÍTULO DEL CAPÍTULO</span><span>DURACIÓN</span><span></span></div>${chapters.map((c, i) => `<button class="chapter-item ${state.currentId === id && state.chapter === i ? "current" : ""}" data-action="play-chapter" data-id="${id}" data-chapter="${i}"><span>${String(i + 1).padStart(2, "0")}</span><span><strong>${esc(c.title)}</strong><small>Voz sintética · Texto original</small></span><span>${formatTime(c.duration)}</span>${icon(state.currentId === id && state.chapter === i && state.playing ? "pause" : "play")}</button>`).join("")}</div>`
      : `<div class="reviews"><div class="review-summary"><strong>${b.rating}</strong><div><span class="stars">★★★★★</span><p>12.418 valoraciones · Ejemplos</p></div></div>${[
          [
            "CM",
            "Carlos Mendoza",
            "La voz del narrador eleva esta obra a otro plano. Una experiencia que te envuelve desde el primer minuto.",
          ],
          [
            "LS",
            "Lucía Soler",
            "Una narración sublime. Las horas se pasan en un suspiro y cada personaje se queda contigo.",
          ],
        ]
          .map(
            ([initials, name, text]) =>
              `<article><div class="row"><span class="avatar">${initials}</span><div><strong>${name}</strong><small>Oyente de ejemplo</small></div><span class="stars ml-auto">★★★★★</span></div><p>${text}</p></article>`,
          )
          .join("")}</div>`
  }</section><aside class="about-panel"><div class="eyebrow">SOBRE ESTA HISTORIA</div><h2>Déjate llevar<br>por cada palabra.</h2><p>${esc(b.synopsis)}</p><div class="about-meta"><span>Autor<strong>${esc(b.author)}</strong></span><span>Narrador<strong>${esc(b.narrator)}</strong></span><span>Categoría<strong>${esc(b.category)}</strong></span><span>Publicación<strong>2023 · Edición de ejemplo</strong></span></div></aside></div><section>${sectionTitle("La siguiente historia te espera", "Sigue explorando voces y mundos extraordinarios.")}<div class="weekly-grid grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">${state.books
    .filter((book) => book.id !== id)
    .slice(0, 5)
    .map(bookCard)
    .join("")}</div></section>`;
}
