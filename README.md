# ecualiapp-template

Template estático de Ecualiapp con **HTML, CSS, JavaScript y Tailwind CSS**, ahora con narración real en español.

## Abrir

Abrir `index.html` directamente. No requiere Node.js, npm, compilación, backend ni claves API. También puede usarse cualquier servidor estático:

```bash
python3 -m http.server 5174
```

Abrir http://localhost:5174. Para publicarlo, copiar `index.html`, `css/`, `js/` y `assets/` completos, incluidos los MP3 de `assets/audio/`. Las rutas con `#` no requieren reglas de reescritura.

## Escuchar ejemplos

En Explorar, la sección **Dale voz a tu próxima historia** incluye tres relatos originales:

- **El faro de las mareas**: La llave de cobre, La ventana del norte y Una luz para volver.
- **La biblioteca de las horas**: Entre dos campanadas, El estante de los martes y La hora que faltaba.
- **Un jardín en la luna**: Una semilla bajo el cristal, El sonido del agua y La primera sombra verde.

Cada relato tiene tres capítulos, portada local y texto visible. Los nueve títulos del catálogo anterior tienen una presentación original audible de un capítulo. **Estas presentaciones no son fragmentos de las obras comerciales ni utilizan las voces de sus narradores.**

Hay 18 muestras MP3 generadas mediante TTS, con aproximadamente 14 minutos de narración en total. La voz incluida es **Dalia (es-MX-DaliaNeural)**, una voz neural en español latino. Los MP3 sustituyen las muestras robóticas iniciales de eSpeak.

## Dos opciones de voz

1. **Dalia · Español latino · Neural (incluida)**: reproduce los MP3 locales con el elemento `Audio` del navegador. No necesita un servicio de voz instalado ni conexión. El tiempo, el avance y la pausa corresponden al audio real.
2. **Voces españolas del navegador**: el selector del reproductor muestra las voces disponibles mediante `speechSynthesis`. La calidad, los idiomas y la necesidad de conexión dependen del navegador y del sistema. No se garantiza que haya voces adicionales. Si no hay ninguna, la voz incluida sigue funcionando.

Los controles permiten reproducir/pausar, saltar 15 segundos, cambiar de capítulo y velocidad, ajustar volumen, poner temporizador y guardar/restaurar marcadores. Al terminar un capítulo, continúa el siguiente. Al salir de la página, la narración se detiene; al recargar, no se reproduce automáticamente.

Con voces del navegador, el tiempo es aproximado: Web Speech no ofrece búsqueda exacta por segundos y el salto reinicia la narración en una palabra cercana. El volumen se aplica a la siguiente frase; al terminar de mover el control se reinicia la frase actual para aplicar el cambio. Los MP3 incluidos permiten búsqueda temporal exacta.

Los filtros del ecualizador y las descargas de biblioteca siguen siendo visuales. El enlace **Descargar MP3 incluido** sí descarga el audio real de un capítulo. No exporta las voces del navegador.

El temporizador funciona mientras la página permanece abierta. No hay reproducción nativa garantizada en segundo plano.

## Pantallas y estructura

- `#/explorar`: catálogo, búsqueda, categorías, relatos TTS y narradores de referencia.
- `#/libro/faro`: detalle y capítulos de un relato de ejemplo.
- `#/biblioteca`: filtros, orden y vista lista/cuadrícula.
- `#/reproductor`: audio, voces, controles, marcadores y texto de lectura.
- `#/perfil`: perfil y preferencias de demostración.

```text
index.html                     HTML y scripts clásicos con defer
css/styles.css                 CSS estándar, incluidas utilidades Tailwind
js/
  main.js                      Navegación y eventos
  audio/narration.js           MP3 con Audio y TTS opcional con Web Speech
  data/books.js                Catálogo
  data/samples.js              Textos, duraciones y archivos de capítulos
  data/assets.js               Portadas de referencia
  state/store.js               Estado y persistencia local
  components/pages/            Una función de componente por pantalla
  components/shared/           Layout, controles, portadas e iconos
assets/
  audio/                       18 MP3 TTS locales
  *.svg                        Portadas de los relatos y favicon
tools/
  sample-content.json          Textos originales y metadatos para regenerar
  generate_neural_samples.py   Herramienta opcional de autoría de voz neural
```

No se utiliza un framework ni un empaquetador. `css/styles.css` contiene Tailwind ya generado; se edita como CSS estándar. Las clases nuevas deben existir en el CSS o definirse manualmente.

La biblioteca, la posición y los marcadores se guardan en `localStorage` (`ecualiapp-web-v1`). La primera apertura de esta versión inicia el relato del faro y conserva favoritos y descargas anteriores; los marcadores del antiguo reproductor simulado se descartan porque no corresponden al audio nuevo.

Las estadísticas y reseñas comerciales siguen siendo ejemplos. Las fuentes y portadas del catálogo original se cargan por internet con sustitutos si fallan. Los tres relatos nuevos y su audio utilizan recursos locales; las fuentes del sistema permiten escucharlos sin conexión.

## Añadir o regenerar textos

Para añadir un relato a mano, editar `js/data/samples.js`, agregar sus capítulos con `title`, `text`, `audio` y `duration` en segundos, incorporar la ficha a `books` y guardar sus MP3 y portada en `assets/`.

Opcionalmente, `tools/generate_neural_samples.py` regenera las muestras desde `tools/sample-content.json` con Python 3, `edge-tts` y `mutagen`. Esta tarea de autoría necesita conexión y envía los textos originales de demostración al servicio de voz de Microsoft Edge. La reproducción del template no contacta ese servicio: utiliza los MP3 ya generados.

```bash
# Solo para regenerar los audios; no hace falta para usar el template.
python3 -m pip install edge-tts mutagen
python3 tools/generate_neural_samples.py
```

Los textos y las portadas SVG de los tres relatos se crearon para esta demostración. La voz incluida se generó con Dalia, sin clonación de voz. La herramienta genera todos los capítulos antes de sustituir los metadatos de audio existentes.

Después de actualizar desde la versión de eSpeak, recargar la página para cargar los nuevos archivos y duraciones.

Referencias técnicas: [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis), [edge-tts](https://github.com/rany2/edge-tts) y [voces de Microsoft](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support).
