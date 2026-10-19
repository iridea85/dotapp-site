// The browser owns speech recognition and releases the microphone when it ends.
// No audio or transcript is persisted by this bridge.
let dotappActiveRecognition = null;
window.doterraStopListening = function () {
  if (dotappActiveRecognition) { try { dotappActiveRecognition.abort(); } catch (_) {} dotappActiveRecognition = null; }
};
window.doterraListenOnce = function () {
  return new Promise(resolve => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return resolve('__ERROR__:Riconoscimento vocale non disponibile in questo browser.');
    window.doterraStopListening();
    const recognition = new Recognition();
    dotappActiveRecognition = recognition;
    recognition.lang = 'it-IT';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let settled = false;
    recognition.onresult = event => {
      settled = true;
      resolve(event.results[0][0].transcript);
      recognition.stop();
    };
    recognition.onerror = event => {
      settled = true;
      resolve('__ERROR__:' + (event.error === 'not-allowed' ? 'Permesso microfono negato.' : 'Non sono riuscita ad ascoltare. Riprova.'));
    };
    recognition.onend = () => { if (dotappActiveRecognition === recognition) dotappActiveRecognition = null; if (!settled) resolve('__ERROR__:Non ho sentito un comando.'); };
    try { recognition.start(); }
    catch (_) { resolve('__ERROR__:Impossibile avviare il microfono.'); }
  });
};
window.doterraShareText = async function (text) {
  if (!navigator.share) return false;
  try { await navigator.share({ text }); return true; }
  catch (error) { if (error.name === 'AbortError') return true; throw error; }
};
