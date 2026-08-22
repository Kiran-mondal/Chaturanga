// --- AUDIO & HAPTIC ENGINE ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playMoveSound() {
    triggerVibration(40); 
    playSynthSound(200, 'sine', 0.1);
}

function playCaptureSound(capturedPieceName) {
    triggerVibration([100, 50, 100]); 
    let audioSrc = "sword.mp3"; 
    
    switch(capturedPieceName) {
        case "Ashva": audioSrc = "scottishperson-sound-effect-horse-whinny-03-372258.mp3"; break;
        case "Gaja": audioSrc = "universfield-sad-trumpet-278822.mp3"; break;
        case "Ratha": audioSrc = "freesound_community-slosh-a-101500.mp3"; break;
        case "Padati": audioSrc = "data_pion-st3-footstep-sfx-323056.mp3"; break;
    }
    
    const audio = new Audio(audioSrc);
    audio.play().catch(e => console.log("Audio file missing or blocked:", e));
}

function playSynthSound(freq, type, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function triggerVibration(pattern) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}
