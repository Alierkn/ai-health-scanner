let lastSpeechTime = 0;
const SPEECH_COOLDOWN = 4500; // 4.5 seconds

export function speakScore(score: number, autoVoice: boolean = true) {
  if (!autoVoice || !('speechSynthesis' in window)) {
    return;
  }

  const now = Date.now();
  if (now - lastSpeechTime < SPEECH_COOLDOWN) {
    return;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(`Health score: ${score} out of 10`);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 0.8;

  speechSynthesis.speak(utterance);
  lastSpeechTime = now;
}

export function cancelSpeech() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}
