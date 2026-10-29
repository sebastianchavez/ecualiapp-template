/* Native browser audio only: local TTS recordings and optional Web Speech voices. */
function createNarrationEngine(callbacks) {
  const audio = new Audio();
  audio.preload = "metadata";
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  let revision = 0;
  let options = null;
  let utterance = null; // Keep a strong reference until the speech request ends.
  let mode = "included";
  let position = 0;
  let active = false;
  let spanishVoices = [];
  let fetchController = null;
  let recordedReady = false;
  let speechStartTimeout;
  const recordings = new Map();

  function refreshVoices() {
    spanishVoices = synth
      ? synth.getVoices().filter((v) => /^es(?:-|_)?/i.test(v.lang))
      : [];
    callbacks.onVoices(spanishVoices);
  }
  if (synth) synth.addEventListener("voiceschanged", refreshVoices);
  // Defer the first notification until the application store is initialized.
  setTimeout(refreshVoices, 0);
  audio.addEventListener("timeupdate", () => {
    if (mode !== "included" || !options || !active || !recordedReady) return;
    position = Math.min(options.chapter.duration, audio.currentTime);
    callbacks.onTime(position);
  });
  audio.addEventListener("ended", () => {
    if (mode === "included" && active && audio.ended) {
      active = false;
      callbacks.onEnd();
    }
  });
  function stop() {
    revision++;
    clearTimeout(speechStartTimeout);
    active = false;
    recordedReady = false;
    fetchController?.abort();
    fetchController = null;
    audio.pause();
    if (synth) synth.cancel();
    utterance = null;
  }
  function fail(message, run) {
    if (run !== revision) return;
    stop();
    callbacks.onError(message);
  }
  function speakFrom(offset, run) {
    if (!active || run !== revision || !options) return;
    const text = options.chapter.text;
    if (offset >= text.length) {
      active = false;
      callbacks.onEnd();
      return;
    }
    const remainder = text.slice(offset);
    const sentence =
      remainder.match(/^[\s\S]*?[.!?](?:\s+|$)/)?.[0] || remainder;
    const voice = spanishVoices.find((v) => v.voiceURI === options.voiceId);
    if (!voice) {
      fail(
        "La voz seleccionada ya no está disponible. Elige la voz española incluida.",
        run,
      );
      return;
    }
    utterance = new SpeechSynthesisUtterance(sentence);
    utterance.voice = voice;
    utterance.lang = voice.lang || "es-ES";
    utterance.rate = options.rate;
    utterance.volume = options.volume / 100;
    utterance.onstart = () => {
      if (run === revision && active) {
        clearTimeout(speechStartTimeout);
        callbacks.onStatus("playing");
      }
    };
    utterance.onboundary = (e) => {
      if (run !== revision || !active) return;
      position =
        ((offset + e.charIndex) / text.length) * options.chapter.duration;
      callbacks.onTime(position);
    };
    utterance.onend = () => {
      if (run !== revision || !active) return;
      position = Math.min(
        options.chapter.duration,
        ((offset + sentence.length) / text.length) * options.chapter.duration,
      );
      callbacks.onTime(position);
      speakFrom(offset + sentence.length, run);
    };
    utterance.onerror = (e) => {
      if (run !== revision || !active) return;
      fail(
        e.error === "not-allowed"
          ? "El navegador bloqueó la voz. Pulsa Reproducir o elige la voz incluida."
          : "No se pudo iniciar esta voz del navegador. Prueba la voz española incluida.",
        run,
      );
    };
    clearTimeout(speechStartTimeout);
    speechStartTimeout = setTimeout(
      () =>
        fail(
          "La voz del navegador no respondió. Elige la voz española incluida.",
          run,
        ),
      10000,
    );
    synth.speak(utterance);
  }
  function play(nextOptions) {
    stop();
    options = nextOptions;
    mode = options.voiceId;
    position = Math.max(
      0,
      Math.min(options.chapter.duration, options.position),
    );
    active = true;
    const run = revision;
    const startPosition = position;
    callbacks.onStatus("loading");
    if (mode === "included") {
      const source = new URL(options.chapter.audio, document.baseURI).href;
      function startRecording(playableSource) {
        if (run !== revision || !active) return;
        if (audio.src !== playableSource) audio.src = playableSource;
        audio.playbackRate = options.rate;
        audio.volume = options.volume / 100;
        try {
          audio.currentTime = startPosition;
        } catch {}
        if (audio.readyState < 1)
          audio.addEventListener(
            "loadedmetadata",
            () => {
              if (run === revision) audio.currentTime = startPosition;
            },
            { once: true },
          );
        audio
          .play()
          .then(() => {
            if (run === revision && active) {
              recordedReady = true;
              callbacks.onStatus("playing");
            }
          })
          .catch(() =>
            fail(
              "No se pudo reproducir la muestra. Comprueba los archivos de audio y pulsa Reproducir.",
              run,
            ),
          );
      }
      if (location.protocol === "file:") startRecording(source);
      else if (recordings.has(source)) startRecording(recordings.get(source));
      else {
        // Loading a complete Blob permits accurate seeking even on basic static
        // servers that do not implement HTTP Range requests (including Python's).
        fetchController = new AbortController();
        fetch(source, { signal: fetchController.signal })
          .then((response) => {
            if (!response.ok) throw new Error("Audio unavailable");
            return response.blob();
          })
          .then((blob) => {
            if (run !== revision || !active) return;
            const url = URL.createObjectURL(blob);
            recordings.set(source, url);
            if (recordings.size > 3) {
              const oldest = recordings.keys().next().value;
              URL.revokeObjectURL(recordings.get(oldest));
              recordings.delete(oldest);
            }
            fetchController = null;
            startRecording(url);
          })
          .catch((error) => {
            if (error.name !== "AbortError")
              fail(
                "No se pudo cargar el audio. Comprueba que la carpeta assets/audio esté completa.",
                run,
              );
          });
      }
    } else {
      if (!synth || !window.SpeechSynthesisUtterance) {
        fail(
          "Este navegador no tiene síntesis de voz. Usa la voz española incluida.",
          run,
        );
        return;
      }
      const text = options.chapter.text;
      let offset = Math.min(
        text.length,
        Math.floor((position / options.chapter.duration) * text.length),
      );
      // Browser TTS cannot seek by seconds; restart at the nearest word.
      if (offset && offset < text.length && /\S/.test(text[offset - 1]))
        offset = text.lastIndexOf(" ", offset) + 1;
      speakFrom(offset, run);
    }
  }
  audio.addEventListener("error", () => {
    if (mode === "included" && active)
      fail(
        "No se encontró el audio de este capítulo. Vuelve a abrir el template completo.",
        revision,
      );
  });
  return {
    play,
    pause() {
      stop();
      callbacks.onStatus("paused");
    },
    seek(value) {
      position = Math.max(
        0,
        Math.min(options?.chapter.duration || value, value),
      );
      if (active && options) play({ ...options, position });
      else if (mode === "included" && options) {
        try {
          audio.currentTime = position;
        } catch {}
      }
    },
    setVolume(value) {
      if (options) options.volume = value;
      audio.volume = value / 100;
      if (utterance) utterance.volume = value / 100;
    },
    voices() {
      return spanishVoices;
    },
    stop,
  };
}
