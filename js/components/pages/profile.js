function profilePage() {
  let reminders = true;
  try {
    reminders = localStorage.getItem("ecualiapp-web-reminders") !== "false";
  } catch {
    /* Use the default when storage is unavailable. */
  }
  return `<div class="page-intro"><div class="eyebrow">TU ESPACIO PERSONAL</div><h1>Historias que hablan de ti<span class="gold">.</span></h1><p>Tu perfil, tus preferencias y todo lo que has descubierto.</p></div><div class="profile-layout"><section class="profile-card"><div class="avatar profile-avatar">E</div><span class="tag">CUENTA DE DEMOSTRACIÓN</span><h2>Elena Martínez</h2><p>Una historia más, un mundo nuevo.</p><span class="profile-since">Enamorada de las historias desde 2024</span></section><div class="profile-settings"><section><div class="section-heading"><h2>Tu viaje en historias</h2><span class="tag">TU BIBLIOTECA</span></div><div class="profile-stats">${[
    ["heart", state.books.filter((b) => b.favorite).length, "Favoritos"],
    [
      "check",
      state.books.filter((b) => b.progress === 100).length,
      "Terminados",
    ],
    ["bookmark", state.notes.length, "Marcadores"],
  ]
    .map(
      ([i, n, l]) =>
        `<div>${icon(i)}<strong>${n}</strong><span>${l}</span></div>`,
    )
    .join(
      "",
    )}</div></section><section class="preferences"><h2>A tu manera</h2><label class="preference-row"><span>${icon("bell")}<span><strong>Recordatorio de lectura</strong><small>Preferencia visual de demostración</small></span></span><input type="checkbox" id="reminders" ${reminders ? "checked" : ""} role="switch" aria-label="Recordatorio de lectura"></label><div class="preference-row"><span>${icon("headphones")}<span><strong>Idioma de los audiolibros</strong><small>Encuentra tu voz favorita</small></span></span><strong>Español</strong></div><div class="preference-row"><span>${icon("download")}<span><strong>Descargas guardadas</strong><small>Estado simulado, sin archivos de audio</small></span></span><strong>${state.books.filter((b) => b.downloaded).length} libros</strong></div></section><section class="privacy-note">${icon("check")}<div><strong>Tu biblioteca se queda contigo</strong><p>Este template guarda tus favoritos, marcadores y avances en este navegador. No crea una cuenta ni envía estos datos a un servidor.</p></div></section></div></div>`;
}
