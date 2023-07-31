import styles from "../styles/Sequencer.module.css";
import * as Tone from "tone";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { faPause } from "@fortawesome/free-solid-svg-icons";

function Sequencer() {
  const defaultWaveforms = [
    "square",
    "square",
    "sawtooth",
    "triangle",
    "noise",
  ];
  const noteNames = [
    "C5",
    "B4",
    "A#4",
    "A4",
    "G#4",
    "G4",
    "F#4",
    "F4",
    "E4",
    "D#4",
    "D4",
    "C#4",
    "C4",
  ];
  const numChannels = 2;
  const [synths, setSynths] = useState([]);

  const [waveforms, setWaveforms] = useState(defaultWaveforms);
  const [isPlaying, setIsPlaying] = useState(false);
  const synthsRef = useRef(null);
  const sequencesRef = useRef(null);
  const [sequences, setSequences] = useState(
    Array(numChannels)
      .fill()
      .map(() =>
        Array(32)
          .fill()
          .map(() => Array(8).fill(false))
      )
  );
  const [currentStep, setCurrentStep] = useState(0);
  const createSynths = () => {
    synths.forEach((synth) => synth.dispose());

    const newSynths = waveforms.map((waveform) => {
      if (waveform !== "noise") {
        return new Tone.Synth({
          oscillator: {
            type: waveform,
          },
          envelope: {
            attack: 0.05,
            decay: 0.2,
            sustain: 0.2,
            release: 1,
          },
        }).toDestination();
      } else {
        return new Tone.NoiseSynth().toDestination();
      }
    });

    setSynths(newSynths);
    synthsRef.current = newSynths;
  };

  const toggleNoteInSequence = (noteIndex, step, channel) => {
    const newSequences = [...sequences];
    newSequences[channel][step][noteIndex] =
      !newSequences[channel][step][noteIndex];

    setSequences(newSequences);
    sequencesRef.current = newSequences;
    if (newSequences[channel][step][noteIndex]) {
      playNote(noteNames[noteIndex]);
    }
  };

  const playNote = (note) => {
    synthsRef.current.forEach((synth) =>
      synth.triggerAttackRelease(note, "8n")
    );
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
    } else {
      Tone.Transport.start();
    }
    setIsPlaying(!isPlaying);
  };

  const changeWaveform = (channel, newWaveform) => {
    const newWaveforms = [...waveforms];
    newWaveforms[channel] = newWaveform;
    setWaveforms(newWaveforms);
    createSynths();
  };

  useEffect(() => {
    createSynths();
  }, [waveforms]);

  useEffect(() => {
    const loop = new Tone.Loop((time) => {
      setCurrentStep(
        Tone.Transport.getTicksAtTime(time) % sequencesRef.current[0].length
      );
      sequencesRef.current.forEach((channelNotes, channel) => {
        channelNotes.forEach((stepNotes, step) => {
          stepNotes.forEach((isActive, noteIndex) => {
            if (isActive && step === currentStep) {
              synthsRef.current[channel].triggerAttackRelease(
                noteNames[noteIndex],
                "8n",
                time
              );
            }
          });
        });
      });
    }, "16n");

    if (isPlaying) {
      loop.start(0);
      Tone.Transport.start();
    } else {
      loop.stop(0);
      Tone.Transport.stop();
    }

    return () => {
      loop.dispose();
    };
  }, [currentStep, isPlaying, noteNames]);

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Simple 8-bit Music Player</h1>

      {isPlaying ? (
        <FontAwesomeIcon
          icon={faPause}
          className={styles.playPause}
          onClick={togglePlayPause}
        />
      ) : (
        <FontAwesomeIcon
          icon={faPlay}
          className={styles.playPause}
          onClick={togglePlayPause}
        />
      )}
      {Array(numChannels)
        .fill(null)
        .map((_, channel) => (
          <div key={channel} className={styles.channel}>
            <h2 className={styles.channelNum}>Channel {channel + 1}</h2>
            <select onChange={(e) => changeWaveform(channel, e.target.value)}>
              <option value="square">Square</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
              <option value="noise">Noise</option>
            </select>
            {noteNames.map((note, noteIndex) => (
              <div key={note} className={styles.noteContainer}>
                <div className={styles.noteLabel}>{note}</div>
                <div className={styles.grid}>
                  {Array.from({ length: 32 }, (_, step) => (
                    <div
                      key={step}
                      className={`${styles.step} ${
                        sequences[channel][step][noteIndex]
                          ? styles.activeStep
                          : ""
                      } ${step === currentStep ? styles.currentStep : ""}`}
                      onClick={() =>
                        toggleNoteInSequence(noteIndex, step, channel)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export default Sequencer;
