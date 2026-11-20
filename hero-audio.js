(() => {
  const video = document.querySelector(".hero-video");
  const audio = document.querySelector(".hero-audio");
  const toggle = document.querySelector(".hero-audio-toggle");
  if (!video || !audio || !toggle) return;
  let soundEnabled = false;
  const playAudio = () => {
    if (!soundEnabled) return;
    audio.currentTime = 0;
    audio.play().catch(() => {
      toggle.textContent = "Réessayer le son";
      toggle.setAttribute("aria-pressed", "false");
    });
  };
  toggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    toggle.setAttribute("aria-pressed", String(soundEnabled));
    toggle.textContent = soundEnabled ? "Désactiver le son" : "Activer le son";
    if (soundEnabled && !video.paused) playAudio();
    else if (!soundEnabled) audio.pause();
  });
  video.addEventListener("play", playAudio);
  video.addEventListener("pause", () => audio.pause());
  video.addEventListener("ended", () => {
    audio.pause();
    audio.currentTime = 0;
  });
})();