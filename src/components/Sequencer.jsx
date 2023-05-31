import styles from "../styles/Sequencer.module.css";
import * as Tone from "tone";
import { useState } from "react";

function Sequencer() {
  const numChannels = 5;
  const create8BitSynth = () => {
    return new Tone.Synth({
      oscillator: {
        type: "square",
      },
      envelope: {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.2,
        release: 1,
      },
    }).toDestination();
  };

  const [synth, setSynth] = useState(create8BitSynth());
  const [sequences, setSequences] = useState(
    Array(numChannels)
      .fill()
      .map(() =>
        Array(32)
          .fill()
          .map(() => Array(8).fill(false))
      )
  );

  const [currentBar, setCurrentBar] = useState(1);
  const noteNames = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];

  const toggleNoteInSequence = (noteIndex, step, channel) => {
    const newSequences = [...sequences];
    newSequences[channel][step][noteIndex] =
      !newSequences[channel][step][noteIndex];
    setSequences(newSequences);
    if (newSequences[channel][step][noteIndex]) {
      playNote(noteNames[noteIndex]);
    }
  };

  const playNote = (note) => {
    synth.triggerAttackRelease(note, "8n");
    addNoteToSequence(note, currentBar);
  };

  const removeNoteFromSequence = (note, bar) => {
    const newSequence = [...sequences];
    newSequence[bar - 1] = newSequence[bar - 1].filter(
      (noteData) => noteData.note !== note
    );
    setSequences(newSequence);
  };

  const changeNoteLength = (length) => {
    setCurrentNoteLength(length);
  };

  const changeCurrentBar = (bar) => {
    setCurrentBar(bar);
  };

  return (
    <div className={styles.main}>
      <h1>Simple 8-bit Music Player</h1>
      {Array(numChannels)
        .fill(null)
        .map((_, channel) => (
          <div key={channel} className={styles.channel}>
            <h2>Channel {channel + 1}</h2>
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
                      }`}
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
