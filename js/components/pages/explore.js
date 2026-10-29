const exploreView = { query: "", category: "Todo" };
function explorePage() {
  const b = current();
  const wind = state.books.find((b) => b.id === "viento");
  const searching = exploreView.query || exploreView.category !== "Todo";
  const filtered = state.books.filter(
    (b) =>
      (exploreView.category === "Todo" ||
        b.category === exploreView.category) &&
      `${b.title} ${b.author} ${b.narrator}`
        .toLocaleLowerCase("es")
        .includes(exploreView.query.toLocaleLowerCase("es")),
  );
  return `<div class="page-intro flex items-end justify-between gap-5"><div><div class="eyebrow">${icon("moon")} TU MOMENTO, TUS HISTORIAS</div><h1>Buenas noches, Elena<span class="gold">.</span></h1><p>Desconecta del ruido. Conecta con una buena historia.</p></div><span class="session-badge">${icon("headphones")} Un buen momento para escuchar</span></div>
 <div class="explore-toolbar"><div class="category-chips" aria-label="Categorías">${["Todo", "Ficción", "Filosofía", "Suspense", "Bienestar & Sueño", "Ciencia Ficción"].map((c) => `<button class="chip ${exploreView.category === c ? "selected" : ""}" data-action="category" data-category="${esc(c)}" aria-pressed="${exploreView.category === c}">${c === "Bienestar & Sueño" ? icon("moon") : ""}${c}</button>`).join("")}</div><label class="catalog-search">${icon("search")}<input id="catalog-search" type="search" aria-label="Buscar en el catálogo" placeholder="Buscar en el catálogo…" value="${esc(exploreView.query)}"></label></div>
 ${
   searching
     ? `<section>${sectionTitle("Historias para ti", `${filtered.length} resultados en el catálogo`)}<div class="catalog-grid grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">${filtered.map(bookCard).join("")}</div>${!filtered.length ? empty("No encontramos esa historia", "Prueba con otro título, autor, narrador o categoría.") : ""}</section>`
     : `
 <div class="discovery-grid"><section class="editorial-hero"><div class="hero-grain"></div><div class="hero-copy"><div class="eyebrow"><span class="tiny-line"></span> LA HISTORIA QUE TE ESPERA</div><h2>Hay historias que<br>merecen ser<br><em>escuchadas.</em></h2><p>Un mundo de fantasía. Una voz inolvidable.<br>Déjate llevar por El nombre del viento.</p><a class="btn" href="#/libro/viento">Descubrir audiolibro ${icon("arrow")}</a><div class="hero-proof"><span class="stars">★★★★★</span><span>4.9 · Más de 12 mil oyentes</span></div></div><a class="hero-cover" href="#/libro/viento" aria-label="Ver El nombre del viento">${cover(wind, "", true)}</a><span class="hero-edition">PATRICK ROTHFUSS <span>·</span> EDICIÓN NARRADA</span></section>
 <section class="continue-panel"><div class="eyebrow">${icon("headphones")} TU HISTORIA CONTINÚA</div><h2>Un capítulo más.</h2><div class="continue-book"><a href="#/libro/${b.id}">${cover(b, "", true)}</a><div><a href="#/libro/${b.id}"><h3>${esc(b.title)}</h3></a><p>${esc(b.author)}</p><small>${icon("mic")} ${esc(b.narrator)}</small></div></div><div class="row between"><small>Capítulo ${state.chapter + 1}</small><small class="gold">${b.progress}% completado</small></div><div class="progress"><span style="width:${b.progress}%"></span></div><p class="continue-message">Tu próximo viaje empieza donde lo dejaste.</p><button class="btn secondary w-full" data-action="play" data-id="${b.id}">${icon("play")}Continuar escuchando</button><a href="#/biblioteca" class="text-link continue-library">Ir a mi biblioteca ${icon("next")}</a></section></div>
 <section class="example-section">${sectionTitle("Dale voz a tu próxima historia", "Tres relatos originales con audio real y capítulos para probar el reproductor.")}<div class="example-books">${state.books
   .filter((book) => book.isExample)
   .map(bookCard)
   .join("")}</div></section>
 <section>${sectionTitle("Novedades de la semana", "Nuevas voces, nuevos mundos por descubrir.", "#/biblioteca", "Ver biblioteca")}<div class="weekly-grid grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">${["sombra", "dune", "sapiens", "pedro", "ficciones"].map((id) => bookCard(state.books.find((b) => b.id === id))).join("")}</div></section>
 <div class="lower-discovery"><section class="relax-panel"><div class="eyebrow">${icon("moon")} BAJA EL RITMO</div><h2>El día termina.<br><em>Tu calma comienza.</em></h2><p>Voces cálidas y relatos serenos para acompañarte al final del día.</p><div class="relax-books">${state.books
   .filter((b) => ["sombra-japon", "meditaciones"].includes(b.id))
   .map(
     (b) =>
       `<a href="#/libro/${b.id}" class="relax-book">${cover(b)}<div><h3>${esc(b.title)}</h3><small>${esc(b.narrator)} · ${b.id === "sombra-japon" ? "Ondas delta" : "Ruido marrón"}</small></div>${icon("next")}</a>`,
   )
   .join(
     "",
   )}</div></section><section class="narrator-panel">${sectionTitle("Voces que dejan huella", "Conoce a quienes dan vida a tus historias.")}<div class="narrators">${[
   ["Francisco Rivela", assets.francisco, 28],
   ["Leonor Watling", assets.leonor, 19],
   ["Jordi Boixaderas", assets.jordi, 42],
   ["Manolo Solo", assets.manolo, 15],
 ]
   .map(
     ([name, src, count]) =>
       `<button data-action="narrator" data-name="${name}" class="narrator">${cover({ cover: src, title: name })}<strong>${name}</strong><small>${count} obras · Catálogo demo</small></button>`,
   )
   .join(
     "",
   )}</div><blockquote>«El mundo era tan reciente, que muchas cosas carecían de nombre…»<cite>Gabriel García Márquez</cite></blockquote></section></div>`
 }`;
}
