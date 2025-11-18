import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOVES = [
  "Jab", "Cross", "Hook L", "Hook R",
  "Uppercut L", "Uppercut R",
  "Slip L", "Slip R",
  "Step Back", "Block"
];

const TIPS = [
  // Core boxing fundamentals
  "Keep your guard up.",
  "Exhale when you punch.",
  "Rotate your hips for power.",
  "Stay light on your toes.",
  "Don’t drop the non-punching hand.",

  // Stance & posture
  "Keep your chin tucked and eyes forward.",
  "Bend your knees slightly — never lock them.",
  "Relax your shoulders; tension slows punches.",
  "Elbows stay tight to your ribs.",
  "Keep your rear heel slightly lifted for mobility.",
  "Don't lean forward — stay centered.",
  "Stay compact and make yourself a small target.",

  // Weight distribution
  "Keep about 55% of your weight on your back foot.",
  "Transfer weight smoothly, not abruptly.",
  "Power starts from your legs, not your arms.",
  "Shift forward on the jab, back when defending.",
  "Rotate your hips on every power punch.",
  "Don't lunge — step in with control.",
  "Use your legs to dip for uppercuts, not your waist.",

  // Footwork & movement
  "Move after every combination — never stay still.",
  "Small steps keep balance; avoid big steps.",
  "Don’t cross your feet when moving.",
  "Pivot your lead foot when throwing hooks.",
  "Stay light — imagine standing on hot sand.",
  "Step back instead of leaning back.",
  "Circle with your lead foot first.",
  "Keep your stance width balanced — not too narrow or wide.",
  "Return to center position after slipping.",

  // Punching mechanics
  "Punch straight back to guard after each strike.",
  "Snap the jab — don’t push it.",
  "Turn your knuckles over on straight punches.",
  "Hooks come from the hip, not the arm.",
  "Don’t overextend your cross — keep balance.",
  "Uppercuts rise with your legs and hips.",
  "Aim punches to where the target will be, not where it was.",

  // Defense & awareness
  "Hands return to guard immediately — don’t admire your work.",
  "Slip before punching, not after.",
  "See the punch from the shoulders, not the gloves.",
  "Block with forearms, not your face.",
  "Step offline to avoid straight punches.",
  "Defense creates openings for offense.",

  // Fight IQ & rhythm
  "Use your jab to measure distance.",
  "Change rhythm to stay unpredictable.",
  "Mix head and body shots to break the guard.",
  "Slow is smooth; smooth is fast.",
  "The punch you don’t see is the one that hurts.",
  "Think “hit and don’t get hit.”",
  "Read your opponent’s chest, not their hands.",

  // Conditioning & flow
  "Control your breathing — it saves energy.",
  "Relax between punches to maintain speed.",
  "Stay loose — tension wastes stamina.",
  "Flow with your movement; don’t fight against it.",

  // Motivational cues
  "Stay sharp — every punch has purpose.",
  "Trust your technique — don’t force power.",
  "One clean punch beats five wild ones.",
  "Box smart, not hard.",
  "Stay composed — champions are calm under pressure."
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

const MUSIC_TRACKS = [
  "/music/fighter-author-marcos-molina.mp3",
  "/music/knockout-coach.mp3",
  "/music/hip-hop-beat.mp3",
  "/music/neon-dreams-90s-synthwave.mp3",
  "/music/cyberpunk-synthwave.mp3",
  "/music/dark-synthwave-spectral.mp3",
  "/music/energetic-sports-rock-trailer-background.mp3",
  "/music/upbeat-energetic-sports-rock.mp3",
  "/music/fast-glitchy-edm.mp3",
  "/music/epic-fast-bitwise-edm.mp3"
];
const MOVE_DESCRIPTIONS = {
  "Jab": "Quick lead-hand punch.",
  "Cross": "Rear-hand straight power punch.",
  "Hook L": "Lead-hand curved punch from the side.",
  "Hook R": "Rear-hand curved punch from the side.",
  "Uppercut L": "Lead-hand rising punch from underneath.",
  "Uppercut R": "Rear-hand rising punch from underneath.",
  "Slip L": "Move head left to avoid punches.",
  "Slip R": "Move head right to avoid punches.",
  "Step Back": "Create space by stepping back quickly.",
  "Block": "Use gloves to absorb incoming punches."
};

const INTENSITY_PRESETS = {
  light: {
    moveCount: 1,
    roundDuration: 30,
    sessionRounds: 2
  },
  moderate: {
    moveCount: 2,
    roundDuration: 60,
    sessionRounds: 3
  },
  hard: {
    moveCount: 3,
    roundDuration: 90,
    sessionRounds: 4
  },
  beast: {
    moveCount: 4,
    roundDuration: 120,
    sessionRounds: 5
  }
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
  const [soundOn, setSoundOn] = useState(false);
  const [voiceOn, setVoiceOn] = useState(null);
  const [voiceGender, setVoiceGender] = useState("female"); // "female" | "male"
  const [voiceVolume, setVoiceVolume] = useState(1);        // 0–1
  const [intensity, setIntensity] = useState(null);
  const [comboSpeed, setComboSpeed] = useState("slow");
  const intensityLocked = intensity !== null;

  const [theme, setTheme] = useState("dark"); // dark | light | neon

  const [playlist, setPlaylist] = useState([...MUSIC_TRACKS]); // active shuffled list
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const musicRef = useRef(null);
  const [tempVoiceGender, setTempVoiceGender] = useState(voiceGender);
  const [tempVoiceVolume, setTempVoiceVolume] = useState(voiceVolume);

  const [tempMusicVolume, setTempMusicVolume] = useState(0.45);

  // Tracks whether popovers are open
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const [nextComboAt, setNextComboAt] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAppName, setShowAppName] = useState(false);
  const COMBO_INTERVALS = {
    slow: 15,
    normal: 10,
    fast: 7,
    extreme: 5,
  };
  const THEME_BACKGROUNDS = {
    dark: "images/dark-theme.png",
    light: "images/light-theme.png",
    neon: "images/neon-theme.png",
  };
  const activeBtn = "bg-white/30 shadow-[0_0_10px_rgba(255,255,255,0.6)] scale-105 border-white/40";
  const inactiveBtn = "bg-black/40 opacity-60";

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
    try { new Audio(url).play(); } catch { }
  };

  const speak = (text) => {
    if (!voiceOn || !("speechSynthesis" in window)) return;
    if (!text || !text.trim()) return;

    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices() || [];
    let selectedVoice = null;

    if (voiceGender === "female") {
      // 1️⃣ Pick your actual female voice first
      selectedVoice =
        voices.find(v => v.name === "Google UK English Female") ||
        voices.find(v => v.name.toLowerCase().includes("zira")) || // Microsoft Zira
        voices.find(v => v.name.toLowerCase().includes("female"));
    } else {
      // 2️⃣ male preferred
      selectedVoice =
        voices.find(v => v.name === "Microsoft David - English (United States)") ||
        voices.find(v => v.name === "Google US English") ||
        voices.find(v => v.name.toLowerCase().includes("male"));
    }

    // 3️⃣ fallback: pick any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith("en"));
    }

    // 4️⃣ final fallback — use the first
    if (!selectedVoice) selectedVoice = voices[0];

    utter.voice = selectedVoice;

    // 5️⃣ force gender pitch difference
    utter.pitch = voiceGender === "female" ? 1.35 : 0.85;
    utter.rate = 1.2;
    utter.volume = voiceVolume;

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
    playSound("music/bell-start.mp3");
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
    playSound("music/bell-end.mp3");
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
        speak(` ${moves.join(", ")}`);

        setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
        setTimeLeft(roundDuration);
        setRoundActive(true);
        setNextComboAt(roundDuration - COMBO_INTERVALS[comboSpeed]);

      } else {
        setPreCountdown((p) => p - 1);
      }
    }, 1000);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preCountdown]);

  // ROUND timer
  // ROUND timer with COMBO SPEED
  useEffect(() => {
    if (!roundActive) return;

    const interval = COMBO_INTERVALS[comboSpeed];

    const t = setTimeout(() => {
      const next = timeLeft - 1;
      setTimeLeft(next);

      // 🎯 Correct Combo Timing
      if (nextComboAt !== null && next === nextComboAt) {
        const moves = generateCombo();
        if (voiceOn) speak(` ${moves.join(", ")}`);

        const nextMark = next - interval;
        if (nextMark <= 3) {
          setNextComboAt(null);
        } else {
          setNextComboAt(nextMark);
        }
      }

      // 🛑 Round over
      if (next <= 0) {
        setRoundActive(false);
        playSound("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

        if (currentRound >= sessionRounds) {
          playSound("/bell-end.mp3");
          speak("Session complete. Good work!");
          setGoodWork(true);
          return;
        }

        setRestActive(true);
        setRestLeft(REST_DURATION);
      }
    }, 1000);

    return () => clearTimeout(t);
  }, [
    roundActive,
    timeLeft,
    nextComboAt,       // <-- NEW DEPENDENCY
    comboSpeed,
    voiceOn
  ]);



  const applyIntensity = (level) => {
    setIntensity(level);
    const preset = INTENSITY_PRESETS[level];

    setMoveCount(preset.moveCount);
    setRoundDuration(preset.roundDuration);
    setSessionRounds(preset.sessionRounds);

    // ⭐ Intensity → Default Combo Speed
    if (level === "light") setComboSpeed("slow");
    if (level === "moderate") setComboSpeed("normal");
    if (level === "hard") setComboSpeed("fast");
    if (level === "beast") setComboSpeed("extreme");
  };
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

  useEffect(() => {
    if (!musicRef.current) return;
    if (musicOn) {
      musicRef.current.volume = 0.45; // default volume (adjust as needed)
      musicRef.current.play().catch(() => { });
    } else {
      musicRef.current.pause();
    }
  }, [musicOn]);

  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  useEffect(() => {
    if (!musicRef.current) return;

    const handleEnded = () => {
      let nextIndex = currentTrackIndex + 1;

      // If playlist over → reshuffle
      if (nextIndex >= playlist.length) {
        const reshuffled = shuffleArray(MUSIC_TRACKS);
        setPlaylist(reshuffled);
        nextIndex = 0;
      }

      setCurrentTrackIndex(nextIndex);
      musicRef.current.src = playlist[nextIndex];
      musicRef.current.play().catch(() => { });
    };

    musicRef.current.addEventListener("ended", handleEnded);
    return () => {
      musicRef.current?.removeEventListener("ended", handleEnded);
    };
  }, [currentTrackIndex, playlist]);
  useEffect(() => {
    if (!musicRef.current) return;

    // Update audio source
    musicRef.current.src = playlist[currentTrackIndex];

    // Autoplay if music is ON
    if (musicOn) {
      musicRef.current.play().catch(() => { });
    }

  }, [currentTrackIndex]);

  return (
    <div
      className={`backdrop-brightness-50 min-h-screen w-full bg-cover bg-center bg-no-repeat 
                  overflow-y-auto md:overflow-y-hidden ${theme}`}
      style={{ backgroundImage: `url(${THEME_BACKGROUNDS[theme]})` }}
    >
      <div className="backdrop-brightness-50 min-h-screen w-full">
        {/* TOP CONTROL PANEL (NORMAL FLOW, NOT ABSOLUTE) */}
        {/* TOP BAR */}
        <div className="w-full flex justify-between items-center px-4 py-2">

          {/* LEFT ICON / LOGO */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={(e) => {
              e.stopPropagation();        // prevent closing settings bubble
              setShowAppName(prev => !prev);
            }}
          >
            <img
              src="images/boxing-icon.png"
              className="w-12 h-11 md:w-12 md:h-11 
             opacity-70 rounded-xl backdrop-blur-md"
              onClick={(e) => {
                e.stopPropagation();
                setShowAppName(prev => !prev);
              }}
            />


            <AnimatePresence>
              {showAppName && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.18 }}
                  className="text-sm md:text-base opacity-70 font-semibold"
                >
                  RX-BA
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* SETTINGS BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(true);
            }}
            className="
    w-12 h-11                      /* EXACT match to boxing icon */
    flex items-center justify-center
    rounded-xl backdrop-blur-md 
    border bg-black/30 hover:bg-black/50
    text-2xl                       /* make the gear visually same weight */
    opacity-70                     /* same as icon */
  "
          >
            ⚙️
          </button>

        </div>


        {/* ===== SLIDE-IN SETTINGS DRAWER ===== */}
        <AnimatePresence>
          {showSettings && (
            <>
              {/* BACKDROP */}
              <motion.div
                onClick={() => {
                  setShowSettings(false);
                  setShowVoicePanel(false);
                  setShowMusicPanel(false);
                }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* DRAWER */}
              <motion.div
                className={`
          fixed top-0 right-0 h-full w-60 md:w-72 
          z-[1000] flex flex-col gap-6 p-4
          ${theme === "light"
                    ? "bg-white/90 text-black border-l border-black/10"
                    : "bg-black/80 text-white border-l border-white/20"}
          backdrop-blur-xl shadow-2xl
        `}
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: "0%", opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              >

                {/* CLOSE BUTTON */}
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setShowVoicePanel(false);
                    setShowMusicPanel(false);
                  }}
                  className="self-end text-2xl opacity-60 hover:opacity-100"
                >
                  ✕
                </button>

                {/* SETTINGS GRID */}
                <div className="grid grid-cols-2 gap-4 mt-2">

                  {/* THEME */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        setTheme(prev =>
                          prev === "dark" ? "light" :
                            prev === "light" ? "neon" :
                              "dark"
                        );
                      }}
                      className={`px-3 py-2 rounded-xl backdrop-blur-md border text-lg
                ${theme ? activeBtn : inactiveBtn}`}
                    >
                      {theme === "dark" && "🌑"}
                      {theme === "light" && "🌕"}
                      {theme === "neon" && "⚡"}
                    </button>
                    <span className="text-xs mt-1 opacity-80">Theme</span>
                  </div>

                  {/* SOUND / SFX */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setSoundOn(!soundOn)}
                      className={`px-3 py-2 rounded-xl backdrop-blur-md border text-lg
                ${soundOn ? activeBtn : inactiveBtn}`}
                    >
                      {soundOn ? "🔊" : "🔈"}
                    </button>
                    <span className="text-xs mt-1 opacity-80">SFX</span>
                  </div>

                  {/* VOICE */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        // Always open the voice panel
                        setShowVoicePanel(true);

                        // If voice is off, enable with saved/default settings
                        if (!voiceOn) {
                          setVoiceOn(true);
                          // Apply gender + volume defaults (your current temp states)
                          setVoiceGender(tempVoiceGender);
                          setVoiceVolume(tempVoiceVolume);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl backdrop-blur-md border text-lg
    ${voiceOn ? activeBtn : inactiveBtn}`}
                    >
                      🎤
                    </button>
                    <span className="text-xs mt-1 opacity-80">Voice</span>
                  </div>

                  {/* MUSIC */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        // Always open the panel
                        setShowMusicPanel(true);

                        // If music is off, turn it on + play defaults
                        if (!musicOn) {
                          setMusicOn(true);
                          if (musicRef.current) {
                            musicRef.current.src = playlist[currentTrackIndex];
                            musicRef.current.volume = tempMusicVolume ?? 0.45;
                            musicRef.current.play().catch(() => { });
                          }
                        }
                      }}
                      className={`px-3 py-2 rounded-xl backdrop-blur-md border text-lg
    ${musicOn ? activeBtn : inactiveBtn}`}
                    >
                      🎵
                    </button>

                    <span className="text-xs mt-1 opacity-80">Music</span>
                  </div>

                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>
        {showVoicePanel && (
          <div
            className={`
                absolute top-14 right-2 md:top-20 md:right-4
                ${theme === "light"
                ? "bg-white/90 text-black"
                : "bg-black/90 text-white"}
                backdrop-blur-lg

                p-2 md:p-4         /* tighter padding on mobile */
                rounded-xl
                border ${theme === "light" ? "border-black/10" : "border-white/20"}
                shadow-xl

                w-40 md:w-56       /* smaller width on mobile */
                max-h-60 md:max-h-none  /* limit height on mobile */
                overflow-y-auto    /* allow scroll if needed */

                z-[9999] flex flex-col gap-2 md:gap-3
                animate-fadeIn
              `}
          >
            <button
              onClick={() => setShowVoicePanel?.(false) || setShowMusicPanel?.(false)}
              className="
              self-end
              text-sm md:text-base     /* SMALLER X */
              opacity-60 hover:opacity-100
              leading-none
            "
            >
              ✕
            </button>

            <span className="text-sm font-semibold opacity-80 text-center">Voice Settings</span>
            <label className="flex justify-between items-center text-sm py-1">
              <span>Enable Voice</span>
              <input
                type="checkbox"
                checked={voiceOn}
                onChange={(e) => {
                  const val = e.target.checked;
                  setVoiceOn(val);
                  if (!val) {
                    // Voice OFF
                    // (no playback needed, just disable)
                  } else {
                    // Voice ON – apply current settings
                    setVoiceGender(tempVoiceGender);
                    setVoiceVolume(tempVoiceVolume);
                  }
                }}
              />
            </label>

            <label className="flex justify-between text-sm">
              <span>Female</span>
              <input
                type="radio"
                name="temp-voice-gender"
                checked={tempVoiceGender === "female"}
                onChange={() => setTempVoiceGender("female")}
              />
            </label>

            <label className="flex justify-between text-sm">
              <span>Male</span>
              <input
                type="radio"
                name="temp-voice-gender"
                checked={tempVoiceGender === "male"}
                onChange={() => setTempVoiceGender("male")}
              />
            </label>

            <div className="flex flex-col flex  gap-1">
              <span className="opacity-70 text-xs mb-1">Volume: {Math.round(tempVoiceVolume * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={tempVoiceVolume}
                onChange={(e) => setTempVoiceVolume(parseFloat(e.target.value))}
              />
            </div>

            {/* CONFIRM BUTTON */}
            <button
              onClick={() => {
                setVoiceGender(tempVoiceGender);
                setVoiceVolume(tempVoiceVolume);
                setShowVoicePanel(false);
              }}
              className="bg-red-600 hover:bg-red-700
                        rounded-lg
                        py-1 px-2      /* smallest, clean */
                        text-xs        /* smaller font */
                        md:py-2 md:px-4 md:text-sm
                        font-semibold
                        mt-2"
            >
              Confirm
            </button>

          </div>
        )}



        {/* --- MUSIC SETTINGS --- */}
        {showMusicPanel && (
          <div
            className={`
                absolute top-14 right-2 md:top-20 md:right-4
                ${theme === "light"
                ? "bg-white/90 text-black"
                : "bg-black/90 text-white"}
                backdrop-blur-lg

                p-2 md:p-4         /* tighter padding on mobile */
                rounded-xl
                border ${theme === "light" ? "border-black/10" : "border-white/20"}
                shadow-xl

                w-40 md:w-56       /* smaller width on mobile */
                max-h-60 md:max-h-none  /* limit height on mobile */
                overflow-y-auto    /* allow scroll if needed */

                z-[9999] flex flex-col gap-2 md:gap-3
                animate-fadeIn
              `}
          >
            <button
              onClick={() => setShowVoicePanel?.(false) || setShowMusicPanel?.(false)}
              className="
                  self-end
                  text-sm md:text-base     /* SMALLER X */
                  opacity-60 hover:opacity-100
                  leading-none
                "
            >
              ✕
            </button>


            <span className="text-sm font-semibold opacity-80 text-center">Music Settings</span>
            <label className="flex justify-between items-center text-sm py-1">
              <span>Enable Music</span>
              <input
                type="checkbox"
                checked={musicOn}
                onChange={(e) => {
                  const val = e.target.checked;
                  setMusicOn(val);

                  if (!val) {
                    // Music OFF
                    musicRef.current?.pause();
                  } else {
                    // Music ON – resume or start default
                    if (musicRef.current) {
                      musicRef.current.src = playlist[currentTrackIndex];
                      musicRef.current.volume = tempMusicVolume ?? 0.45;
                      musicRef.current.play().catch(() => { });
                    }
                  }
                }}
              />
            </label>

            <div className={`${theme}-theme-slider flex flex-col gap-1`}>
              <span className="text-xs opacity-70 text-center">
                Volume: {Math.round(tempMusicVolume * 100)}%
              </span>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={tempMusicVolume}
                onChange={(e) => setTempMusicVolume(parseFloat(e.target.value))}
              />
            </div>
            <div className="flex justify-center gap-1 mt-1">

              {/* Play / Pause (grey icon) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!musicRef.current) return;

                  if (musicRef.current.paused) {
                    musicRef.current.play().catch(() => { });
                  } else {
                    musicRef.current.pause();
                  }

                  setMusicOn(!musicRef.current.paused);
                }}
                className="text-xl opacity-70 hover:opacity-100 transition"
              >
                {musicRef.current?.paused ? "▶️" : "⏸"}
              </button>

              {/* Next Track (grey icon) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  let nextIndex = currentTrackIndex + 1;

                  if (nextIndex >= playlist.length) {
                    const reshuffled = shuffleArray(MUSIC_TRACKS);
                    setPlaylist(reshuffled);
                    nextIndex = 0;
                  }

                  setCurrentTrackIndex(nextIndex);
                }}
                className="text-xl opacity-70 hover:opacity-100 transition"
              >
                ⏭
              </button>

            </div>

            <div className="text-xs font-bold opacity-90 text-center">
              🎧 {playlist[currentTrackIndex]?.split("/").pop().replace(".mp3", "")}
            </div>

            {/* CONFIRM BUTTON */}
            <button
              onClick={() => {
                if (musicRef.current) {
                  musicRef.current.volume = tempMusicVolume;
                }
                setShowMusicPanel(false);
              }}
              className="
                   bg-red-600 hover:bg-red-700
                    rounded-lg
                    py-1 px-2      /* smallest, clean */
                    text-xs        /* smaller font */
                    md:py-2 md:px-4 md:text-sm
                    font-semibold
                    mt-2
                "
            >
              Confirm
            </button>

          </div>
        )}


        <audio
          ref={musicRef}
          preload="auto"

          src={playlist[currentTrackIndex]}
        />

        <div className="w-full min-h-screen flex flex-col justify-between p-1 md:p-6 backdrop-brightness-50">

          <div className="text-center mt-10">
            {!roundActive && !preCountdown && !restActive && !goodWork && (
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] tracking-wide">
                Welcome, Fellow Boxer!
              </h1>
            )}

            {currentRound > 0 && sessionRounds > 0 && (
              <div className="text-2xl md:text-3xl font-bold mb-4 drop-shadow opacity-90 tracking-wide">
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
                bg-black/30 p-6 rounded-2xl backdrop-blur-md mt-8
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
                    className={`bg-black/40 px-4 py-3 rounded-xl text-center shadow-lg 
                              ${MOVE_COLORS[m]}`}
                  >
                    <div className="text-xl md:text-2xl font-semibold">
                      🥊 {m}
                    </div>

                    {/* Small description */}
                    <div className="text-sm md:text-base opacity-80 mt-1">
                      {MOVE_DESCRIPTIONS[m]}
                    </div>
                  </motion.div>
                ))}
                <div className="flex flex-col mt-6 items-center gap-2 opacity-80 text-center text-base md:text-lg"></div>
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
              {voiceOn && (
                <div className="w-full max-w-md flex justify-center">
                  <button
                    onClick={() => {
                      if (combo.length > 0) speak(` ${combo.join(", ")}`);
                    }}
                    className="mt-4 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 text-sm"
                  >
                    Repeat Combo 🔁
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MAIN SCREEN SETTINGS */}
          {!roundActive && !preCountdown && !restActive && !goodWork && (
            <div className="flex flex-col items-center gap-6 mb-16
            bg-black/30 p-6 rounded-2xl backdrop-blur-md
            border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)]
            w-full max-w-3xl mx-auto">

              <h2 className="text-xl font-bold opacity-90 mb-2 text-center mx-auto">
                Select an intensity preset or customize your training.
              </h2>
              {/* INTENSITY SELECTOR */}
              <div className="flex flex-col items-center gap-3 w-full max-w-lg">
                <h3 className="text-lg font-bold opacity-90">
                  🔥Intensity Presets
                </h3>

                <div className="grid grid-cols-2 gap-3 md:flex md:flex-row">

                  <button
                    onClick={() => applyIntensity("light")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold
                    ${intensity === "light" ? "bg-green-600" : "bg-green-700/40 hover:bg-green-700/60"}`}
                  >
                    Light
                  </button>

                  <button
                    onClick={() => applyIntensity("moderate")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold
                    ${intensity === "moderate" ? "bg-yellow-600" : "bg-yellow-700/40 hover:bg-yellow-700/60"}`}
                  >
                    Moderate
                  </button>

                  <button
                    onClick={() => applyIntensity("hard")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold
                    ${intensity === "hard" ? "bg-red-600" : "bg-red-700/40 hover:bg-red-700/60"}`}
                  >
                    Hard
                  </button>

                  <button
                    onClick={() => applyIntensity("beast")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold
                    ${intensity === "beast" ? "bg-red-800" : "bg-red-900/40 hover:bg-red-900/60"}`}
                  >
                    Beast
                  </button>

                </div>
                {intensity && (
                  <>
                    <p className="text-xs opacity-60 mt-1 text-center font-bold">
                      {intensity === "light" && "Easy pace — focus on technique. (Combo speed: Slow)"}
                      {intensity === "moderate" && "Balanced session — stay sharp. (Combo speed: Normal)"}
                      {intensity === "hard" && "Push your limits — dig deep. (Combo speed: Fast)"}
                      {intensity === "beast" && "Beast mode — all out! (Combo speed: Extreme)"}
                    </p>

                    {/* Switch back to custom mode */}
                    <button
                      onClick={() => {
                        setIntensity(null);
                      }}
                      className="text-xs  font-bold mt-2 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 opacity-80"
                    >
                      Switch to Custom Mode
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 my-4 w-full max-w-lg">
                <div className="flex-1 h-[1px] bg-white/15 rounded-full"></div>
                <span className="text-sm opacity-80 font-semibold">OR</span>
                <div className="flex-1 h-[1px] bg-white/15 rounded-full"></div>
              </div>
              <div className={`${theme}-theme-radio`}>
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full max-w-lg md:justify-between text-center md:text-left">
                  <div className="font-bold text-lg">Number of Moves:</div>
                  <div className="flex flex-wrap gap-3 md:gap-6 justify-center text-white justify-center md:justify-start">
                    {[1, 2, 3, 4].map(n => (
                      <label key={n} className="flex items-center gap-2">
                        <input name="moves" type="radio" checked={moveCount === n} disabled={intensityLocked} onChange={() => !intensityLocked && setMoveCount(n)}
                          className="
         
          h-4 w-4 appearance-none rounded-full border border-gray-400
          checked:bg-white checked:border-white
          disabled:opacity-50
        "/>
                        <span>{n}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full max-w-lg md:justify-between text-center md:text-left">
                  <div className="font-bold text-lg">Round Duration:</div>
                  <div className="flex flex-wrap gap-3 md:gap-6 justify-center text-white justify-center md:justify-start">
                    {[30, 60, 90, 120].map(d => (
                      <label key={d} className="flex items-center gap-2">
                        <input name="duration" type="radio" checked={roundDuration === d} disabled={intensityLocked} onChange={() => !intensityLocked && setRoundDuration(d)}
                          className="
         
          h-4 w-4 appearance-none rounded-full border border-gray-400
          checked:bg-white checked:border-white
          disabled:opacity-50
        "/>
                        <span>{d}s</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full max-w-lg md:justify-between text-center md:text-left">
                  <div className="font-bold text-lg">Session Rounds:</div>
                  <div className="flex flex-wrap gap-3 md:gap-6 justify-center text-white justify-center md:justify-start">
                    {[2, 3, 4, 5].map(r => (
                      <label key={r} className="flex items-center gap-2">
                        <input name="rounds" type="radio" checked={sessionRounds === r} disabled={intensityLocked} onChange={() => !intensityLocked && setSessionRounds(r)}
                          className="
         
          h-4 w-4 appearance-none rounded-full border border-gray-400
          checked:bg-white checked:border-white
          disabled:opacity-50
        "/>
                        <span>{r}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* COMBO SPEED */}
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full max-w-lg md:justify-between text-center md:text-left ">
                  <div className="font-bold text-lg">Combo Speed:</div>

                  <div className="flex flex-wrap gap-3 md:gap-6 justify-center text-white justify-center md:justify-start">
                    {["slow", "normal", "fast", "extreme"].map((speed) => (
                      <label key={speed} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="comboSpeed"
                          checked={comboSpeed === speed}
                          disabled={intensityLocked}
                          onChange={() => !intensityLocked && setComboSpeed(speed)}
                          className="
         
          h-4 w-4 appearance-none rounded-full border border-gray-400
          checked:bg-white checked:border-white
          disabled:opacity-50
        "
                        />
                        <span className="capitalize">{speed}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>


              {/* Voice + Sound settings */}
              {/* SOUND + VOICE TOGGLES */}



              <div className="w-full flex flex-col md:flex-row md:justify-center md:items-center gap-4 mt-6">
                <button
                  onClick={startSession}
                  className="px-6 py-3 font-semibold bg-red-600 rounded-2xl text-xl shadow-md hover:bg-red-700 text-center md:min-w-[180px]"
                >
                  Start Training
                </button>

                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setShowMainExitModal(true);
                  }}
                  className="px-6 py-3  font-semibold bg-gray-700 rounded-2xl text-xl shadow-md hover:bg-gray-800 text-center md:min-w-[180px]"
                >
                  End Training
                </button>
              </div>

            </div>
          )}

          {(roundActive || restActive) && (
            <button

              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setShowEarlyModal(true);
              }}
              className="mx-auto mt-6 mb-10 px-6 py-3 
                      bg-white/10 hover:bg-white/20 
                      backdrop-blur-md
                      border border-white/10 
                      rounded-2xl text-base font-medium
                      transition-all duration-200"
            >
              End Session Early
            </button>
          )}

          <div
            className={`
              text-center text-l mb-6 font-semibold
                
              ${theme === "light"
                ? "text-black"
                : "text-white"}
            `}
          >
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
      <style>
        {`
  /* Radio - remove blue and use black */
  input[type="radio"] {
    accent-color: #333;
  }

  /* If using light theme, make them darker */
  .light-theme-radio input[type="radio"] {
    accent-color: #333;
  }

  /* If neon theme, make them white */
  .neon-theme-radio input[type="radio"] {
    accent-color: #333;
  }
`}
      </style>
      <style>
        {`
  /* Reset native styling */
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    width: 100%;
  }

  /* Track */
  input[type="range"]::-webkit-slider-runnable-track {
    background: #8a8a8a;       /* clean grey */
    height: 4px;
    border-radius: 9999px;
    border: none;
  }

  /* Thumb */
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: #8a8a8a;       /* soft grey */
    width: 16px;
    height: 16px;
    border-radius: 9999px;
    border: none;              /* 🚫 removes the white box */
    margin-top: -6px;          /* centers on the track */
  }

  /* Firefox track */
  input[type="range"]::-moz-range-track {
    background: #8a8a8a;
    height: 4px;
    border-radius: 9999px;
  }

  /* Firefox filled portion */
  input[type="range"]::-moz-range-progress {
    background: #373636ff;
  }

  /* Firefox thumb */
  input[type="range"]::-moz-range-thumb {
    background: #cfcfcf;
    width: 16px;
    height: 16px;
    border-radius: 9999px;
    border: none;
  }
`}
      </style>



    </div>
  );
}
