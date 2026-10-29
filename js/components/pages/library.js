const libraryView = {
  query: "",
  filter: "En progreso",
  sort: "Recientes",
  grid: false,
};
const matches = (b, f) =>
  f === "En progreso"
    ? b.progress > 0 && b.progress < 100
    : f === "Descargados"
      ? b.downloaded
      : f === "Terminados"
        ? b.progress === 100
        : b.favorite;
function libraryPage() {
  const view = libraryView;
  const visible = state.books
    .filter(
      (b) =>
        matches(b, view.filter) &&
        `${b.title} ${b.author} ${b.narrator}`
          .toLowerCase()
          .includes(view.query.toLowerCase()),
    )
    .sort((a, b) =>
      view.sort === "Título"
        ? a.title.localeCompare(b.title)
        : view.sort === "Autor"
          ? a.author.localeCompare(b.author)
          : view.sort === "Progreso"
            ? b.progress - a.progress
            : 0,
    );
  return `<div class="page-intro flex items-end justify-between gap-5"><div><div class="eyebrow">TU SANTUARIO SONORO</div><h1>Mi Biblioteca<span class="gold">.</span></h1><p>Las historias que elegiste. Siempre cerca de ti.</p></div><a href="#/explorar" class="btn secondary">${icon("explore")}Descubrir más historias</a></div><div class="library-layout"><div class="library-main"><div class="library-toolbar"><label class="catalog-search">${icon("search")}<input id="library-search" type="search" aria-label="Buscar en tu biblioteca" placeholder="Título, autor o narrador…" value="${esc(view.query)}"></label><label class="sort-label">Ordenar por<select id="library-sort" aria-label="Ordenar biblioteca">${["Recientes", "Título", "Autor", "Progreso"].map((s) => `<option ${s === view.sort ? "selected" : ""}>${s}</option>`).join("")}</select></label><button class="icon-btn ${view.grid ? "active" : ""}" data-action="library-layout" aria-label="${view.grid ? "Vista de lista" : "Vista de cuadrícula"}">${icon(view.grid ? "list" : "grid")}</button></div><div class="library-tabs" role="group" aria-label="Filtrar biblioteca">${["En progreso", "Descargados", "Terminados", "Favoritos"].map((f) => `<button class="${view.filter === f ? "active" : ""}" data-action="library-filter" data-filter="${f}" aria-pressed="${view.filter === f}">${f}<span>${state.books.filter((b) => matches(b, f)).length}</span></button>`).join("")}</div>
 <div class="library-count"><span>${icon("headphones")} ${visible.length} audiolibros</span><small>Tu colección personal</small></div>${visible.length ? `<div class="${view.grid ? "library-cards grid grid-cols-2 lg:grid-cols-3 gap-6" : "library-list"}">${visible.map((b) => (view.grid ? bookCard(b) : `<article class="library-row"><a href="#/libro/${b.id}">${cover(b)}</a><div class="library-info"><a href="#/libro/${b.id}"><h2>${esc(b.title)}</h2></a><p>${esc(b.author)}</p><small>${icon("mic")} ${esc(b.narrator)}</small></div><div class="library-progress"><div class="row between"><small>${b.progress === 100 ? "Terminado" : `${formatDuration(Math.round((b.duration * (100 - b.progress)) / 100))} restantes`}</small><strong>${b.progress}%</strong></div><div class="progress"><span style="width:${b.progress}%"></span></div><small class="download-status">${icon(b.downloaded ? "check" : "cloud")} ${b.downloaded ? "Descargado · Demo" : "Disponible en catálogo"}</small></div><button class="play-button" data-action="play" data-id="${b.id}" aria-label="Escuchar ${esc(b.title)}">${icon("play")}</button><button class="icon-btn" data-action="book-options" data-id="${b.id}" aria-label="Opciones de ${esc(b.title)}">${icon("more")}</button></article>`)).join("")}</div>` : empty("Aquí empieza una nueva historia", "Todavía no tienes libros en esta sección. Guarda tus favoritos desde el catálogo.")}<div class="sync-note">${icon("sync")} <span>Tu biblioteca se guarda en este navegador</span><button data-action="refresh-library" class="text-link">Actualizar ${icon("sync")}</button></div></div>
 <aside class="library-aside"><section class="listening-stats"><div class="eyebrow">${icon("fire")} TU RITMO DE ESCUCHA</div><h2>Pequeños momentos.<br>Grandes historias.</h2><div class="stat-highlight"><strong>34<span>h</span> 12<span>m</span></strong><small>Este mes · Datos de demostración</small></div><div class="stats-split"><div><span class="gold">${icon("fire")} 18 días</span><small>Racha de escucha</small></div><div><span>${state.books.filter((b) => b.progress === 100).length} de 5</span><small>Meta de audiolibros</small></div></div><div class="progress"><span style="width:${state.books.filter((b) => b.progress === 100).length * 20}%"></span></div><p>Un capítulo al día también es un gran viaje.</p></section><div class="aside-quote">${icon("bookmark")}<blockquote>«Un lector vive mil vidas antes de morir.»</blockquote><small>George R. R. Martin</small></div></aside></div>`;
}
