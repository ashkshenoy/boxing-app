import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOVES = [
  "Jab", "Cross", "Hook L", "Hook R",
  "Uppercut L", "Uppercut R",
  "Slip L", "Slip R",
  "Step Back", "Block"
];

const TIPS = [
  "Keep your guard up.",
  "Exhale when you punch.",
  "Rotate your hips for power.",
  "Stay light on your toes.",
  "Don’t drop the non-punching hand."
];

const MOVE_COLORS = {
  Jab: "text-blue-300",
  Cross: "text-red-400",
  "Hook L": "text-orange-300",
  "Hook R": "text-orange-300",
  "Uppercut L": "text-purple-300",
  "Uppercut R": "text-purple-300",
  "Slip L": "text-teal-300",
  "Slip R": "text-teal-300",
  "Step Back": "text-teal-300",
  Block: "text-teal-300",
};

export default function BoxingApp() {
  const [roundActive, setRoundActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundDuration, setRoundDuration] = useState(30);
  const [moveCount, setMoveCount] = useState(1);
  const [combo, setCombo] = useState([]);

  const [tip, setTip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [preCountdown, setPreCountdown] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [restLeft, setRestLeft] = useState(15);

  const REST_DURATION = 15;

  const [sessionRounds, setSessionRounds] = useState(2);
  const [currentRound, setCurrentRound] = useState(0);

  const [goodWork, setGoodWork] = useState(false);
  const [showEarlyModal, setShowEarlyModal] = useState(false);
  const [showMainExitModal, setShowMainExitModal] = useState(false);
  const [history, setHistory] = useState([]);

  // sound / voice states
  const [soundOn, setSoundOn] = useState(null);
  const [voiceOn, setVoiceOn] = useState(null);
  const [voiceGender, setVoiceGender] = useState("female"); // "female" | "male"
  const [voiceVolume, setVoiceVolume] = useState(1);        // 0–1

  // Ensure voices are loaded (some browsers load asynchronously)
  useEffect(() => {
    // Trigger loading of available voices
    window.speechSynthesis.getVoices();
    const onVoicesChanged = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = onVoicesChanged;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const playSound = (url) => {
    if (!soundOn) return;
    try { new Audio(url).play(); } catch {}
  };

  const speak = (text) => {
    if (!voiceOn || !("speechSynthesis" in window)) return;

    // Cancel if empty text
    if (!text || !text.trim()) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = voiceGender === "female" ? 1.15 : 0.85;
    utter.volume = Math.max(0, Math.min(1, voiceVolume));

    // Choose a voice that loosely matches gender preference, fallback to first
    const voices = window.speechSynthesis.getVoices() || [];
    let preferred = null;

    // try name/lang heuristics
    if (voices.length > 0) {
      // look for explicit male/female hints
      preferred = voices.find(v => {
        const n = v.name.toLowerCase();
        const l = v.lang ? v.lang.toLowerCase() : "";
        if (voiceGender === "female") {
          return n.includes("female") || n.includes("woman") || l.includes("en-us") && n.includes("google") && n.includes("female");
        } else {
          return n.includes("male") || n.includes("man") || l.includes("en-us") && n.includes("google") && n.includes("male");
        }
      });

      // fallback: if nothing matched, pick a common English voice
      if (!preferred) {
        preferred = voices.find(v => /en(-|_)?/i.test(v.lang));
      }
      if (!preferred) preferred = voices[0];
    }

    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
  };

  const resetToMainScreen = () => {
    setRoundActive(false);
    setTimeLeft(0);
    setPreCountdown(0);
    setRestActive(false);
    setRestLeft(REST_DURATION);
    setCombo([]);
    setCurrentRound(0);
  };

  const generateCombo = () => {
    const newMoves = Array.from(
      { length: moveCount },
      () => MOVES[Math.floor(Math.random() * MOVES.length)]
    );

    setHistory((h) => [newMoves, ...h].slice(0, 3));
    setCombo(newMoves);

    return newMoves;
  };

  const startSession = () => {
    if (!roundDuration || !sessionRounds || !moveCount) return;
    playSound("/bell-start.mp3");
    resetToMainScreen();
    // start at round 1
    setCurrentRound(1);
    setPreCountdown(3);
  };

  const closeGoodWork = () => {
    setGoodWork(false);
    resetToMainScreen();
  };

  const endTrainingFromMain = () => {
    setShowMainExitModal(false);
    playSound("/bell-end.mp3");
    speak("Session complete. Good work!");
    setGoodWork(true);
  };

  const endSessionEarly = () => {
    setShowEarlyModal(false);
    resetToMainScreen();
  };

  // PRE-COUNTDOWN -> generate combo and start round
  useEffect(() => {
    if (preCountdown <= 0) return;

    const t = setTimeout(() => {
      if (preCountdown === 1) {
        // small punch beep during "GO"
        

        setPreCountdown(0);

        // generate moves and speak
        const moves = generateCombo();

        // TTS: announce round and combo
        speak(`Round ${currentRound}.`);
        // speak the combo as a short sentence
        speak(`Combo: ${moves.join(", ")}`);

        setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
        setTimeLeft(roundDuration);
        setRoundActive(true);

      } else {
        setPreCountdown((p) => p - 1);
      }
    }, 1000);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preCountdown]);

  // ROUND timer
  useEffect(() => {
    if (!roundActive) return;

    if (timeLeft <= 0) {
      setRoundActive(false);
      playSound("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

      // ---- SESSION END ----
      if (currentRound >= sessionRounds) {
        playSound("/bell-end.mp3");
        speak("Session complete. Good work!");
        setGoodWork(true);
        return;
      }

      // ---- REST START ----
      setRestActive(true);
      setRestLeft(REST_DURATION);
      // speak rest once when rest starts (we also speak in rest effect to be safe)
      speak(`Rest ${REST_DURATION} seconds`);
      return;
    }

    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);

  }, [roundActive, timeLeft, currentRound, sessionRounds]);

  // REST timer — speak only once when rest begins
  useEffect(() => {
    if (!restActive) return;

    // speak when rest just started (restLeft should be REST_DURATION at the start)
    if (restLeft === REST_DURATION) {
      speak(`Rest ${REST_DURATION} seconds`);
    }

    if (restLeft <= 0) {
      setRestActive(false);
      setCurrentRound((c) => c + 1);
      setPreCountdown(3);
      return;
    }

    const t = setTimeout(() => setRestLeft((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [restActive, restLeft]);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat text-white overflow-y-auto md:overflow-y-hidden"
      style={{ backgroundImage: "url('/boxer.jpg')" }}
    >

      <div className="w-full min-h-screen flex flex-col justify-between p-4 md:p-6 backdrop-brightness-50">

        <div className="text-center mt-10">
          {!roundActive && !preCountdown && !restActive && !goodWork && (
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] tracking-wide">
              Welcome, Fellow Boxer!
            </h1>
          )}

          {currentRound > 0 && sessionRounds > 0 && (
            <div className="text-xl font-bold mb-3 drop-shadow">
              Round {currentRound}/{sessionRounds}
            </div>
          )}

          {preCountdown > 0 && (
            <h1 className="text-7xl font-bold drop-shadow-xl">{preCountdown}</h1>
          )}

          {roundActive && (
            <h1
              className={`text-5xl md:text-7xl font-bold transition-all duration-200
                ${timeLeft <= 3 ? "text-red-400 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] scale-110" : ""}
              `}
            >
              {timeLeft}s
            </h1>
          )}

          {restActive && (
            <h1 className="text-7xl font-bold drop-shadow-xl">Rest {restLeft}s</h1>
          )}
        </div>

        {roundActive && (
          <div className="flex flex-col items-center gap-6 mb-16
                bg-black/30 p-6 rounded-2xl backdrop-blur-md
                border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)]
                w-full max-w-3xl mx-auto">

            <AnimatePresence>
              {combo.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    x: [0, -2, 2, -1, 1, 0], // subtle shake
                  }}
                  transition={{ duration: 0.4 }}
                  className={`bg-black/40 px-4 py-2 rounded-xl text-xl md:text-2xl font-semibold whitespace-normal text-center shadow-lg 
                              ${MOVE_COLORS[m]}`}
                >
                  🥊 {m}
                </motion.div>
              ))}

              {history.length > 0 && (
                <div className="flex flex-col mt-4 items-center gap-2 opacity-80 text-center text-base md:text-lg">
                  {history.map((h, i) => (
                    <div key={i} className="text-lg bg-black/20 px-3 py-1 rounded-xl">
                      ⏱️ {h.join(", ")}
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Repeat combo button */}
            <div className="w-full max-w-md flex justify-center">
              <button
                onClick={() => {
                  if (combo.length > 0) speak(`Combo: ${combo.join(", ")}`);
                }}
                className="mt-4 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 text-sm"
              >
                Repeat Combo 🔁
              </button>
            </div>
          </div>
        )}

        {/* MAIN SCREEN SETTINGS */}
        {!roundActive && !preCountdown && !restActive && !goodWork && (
          <div className="flex flex-col items-center gap-6 mb-16
                bg-black/30 p-6 rounded-2xl backdrop-blur-md
                border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)]
                w-full max-w-3xl mx-auto">

            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full max-w-lg md:justify-between text-center md:text-left">
              <div className="font-bold text-lg">Number of Moves:</div>
              <div className="flex gap-4 md:gap-6 text-white justify-center md:justify-start">
                {[1,2,3,4].map(n => (
                  <label key={n} className="flex items-center gap-2">
                    <input name="moves" type="radio" checked={moveCount===n} onChange={()=>setMoveCount(n)} />
                    <span>{n}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full max-w-lg md:justify-between text-center md:text-left">
              <div className="font-bold text-lg">Round Duration:</div>
              <div className="flex gap-4 md:gap-6 text-white justify-center md:justify-start">
                {[30,60,90,120].map(d => (
                  <label key={d} className="flex items-center gap-2">
                    <input name="duration" type="radio" checked={roundDuration===d} onChange={()=>setRoundDuration(d)} />
                    <span>{d}s</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full max-w-lg md:justify-between text-center md:text-left">
              <div className="font-bold text-lg">Session Rounds:</div>
              <div className="flex gap-4 md:gap-6 text-white justify-center md:justify-start">
                {[2,3,4,5].map(r => (
                  <label key={r} className="flex items-center gap-2">
                    <input name="rounds" type="radio" checked={sessionRounds===r} onChange={()=>setSessionRounds(r)} />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Voice + Sound settings */}
            {/* SOUND + VOICE TOGGLES */}
<div className="flex flex-col gap-3 w-full max-w-xs">

  {/* Sound toggle */}
  <label className="flex items-center justify-between">
    <span className="font-semibold">Sound</span>
    <input
      type="checkbox"
      checked={soundOn}
      onChange={() => setSoundOn(!soundOn)}
    />
  </label>

  {/* Voice toggle */}
  <label className="flex items-center justify-between">
    <span className="font-semibold">Voice</span>
    <input
      type="checkbox"
      checked={voiceOn}
      onChange={() => setVoiceOn(!voiceOn)}
    />
  </label>

  {/* --- CONDITIONAL VOICE SETTINGS --- */}
  {voiceOn && (
    <div className="mt-2 p-3 bg-black/20 rounded-xl text-xs flex flex-col gap-3 border border-white/10">

      <div className="text-center font-semibold text-sm opacity-80">
        Voice Settings
      </div>

      {/* Gender */}
      <label className="flex justify-between">
        <span>Female</span>
        <input
          type="radio"
          name="voice-gender"
          checked={voiceGender === "female"}
          onChange={() => setVoiceGender("female")}
        />
      </label>

      <label className="flex justify-between">
        <span>Male</span>
        <input
          type="radio"
          name="voice-gender"
          checked={voiceGender === "male"}
          onChange={() => setVoiceGender("male")}
        />
      </label>

      {/* Volume slider */}
      <div className="flex flex-col mt-1">
        <span className="opacity-70 mb-1">Volume: {Math.round(voiceVolume * 100)}%</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={voiceVolume}
          onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  )}

</div>


            <button
              onClick={startSession}
              className="px-6 py-3 w-full md:w-auto bg-red-600 rounded-2xl text-xl shadow-md hover:bg-red-700 text-center">
              Start Session
            </button>

            <button
              onClick={() => setShowMainExitModal(true)}
              className="px-6 py-3 w-full md:w-auto bg-gray-600 rounded-2xl text-xl shadow-md hover:bg-gray-700 text-center">
              End Training
            </button>

          </div>
        )}

        {(roundActive || restActive) && (
          <button
            onClick={() => setShowEarlyModal(true)}
            className="mx-auto mb-6 px-4 py-2 bg-gray-700 rounded-xl hover:bg-gray-600 text-sm">
            End Session Early
          </button>
        )}

        <div className="text-center text-xl mb-6 font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
          💡 {tip}
        </div>
      </div>

      {/* EARLY END MODAL */}
      <AnimatePresence>
        {showEarlyModal && (
          <motion.div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-3xl font-bold mb-6">End session early?</h2>
            <div className="flex gap-6">
              <button onClick={endSessionEarly} className="px-6 py-3 bg-red-600 rounded-xl hover:bg-red-700">Yes</button>
              <button onClick={() => setShowEarlyModal(false)} className="px-6 py-3 bg-gray-600 rounded-xl hover:bg-gray-700">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GOOD WORK SCREEN */}
      <AnimatePresence>
        {goodWork && (
          <motion.div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white text-5xl font-extrabold text-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Good work, Champ! 🥇
            <button onClick={closeGoodWork}
              className="mt-10 px-6 py-3 bg-white/20 rounded-xl text-xl hover:bg-white/30">
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN EXIT MODAL */}
      <AnimatePresence>
        {showMainExitModal && (
          <motion.div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-3xl font-bold mb-6">End training?</h2>
            <div className="flex gap-6">
              <button onClick={endTrainingFromMain} className="px-6 py-3 bg-red-600 rounded-xl hover:bg-red-700">Yes</button>
              <button onClick={() => setShowMainExitModal(false)} className="px-6 py-3 bg-gray-600 rounded-xl hover:bg-gray-700">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
