import React, { useState } from "react";
import TranscriptionList from "./TranscriptionList";
import TranscriptionDetails from "./TranscriptionDetails";

const TranscriptionApp = () => {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Transcription Management</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div style={{ flex: 1 }}>
          <h2>Available Transcriptions</h2>
          <TranscriptionList onSelect={setSelectedId} />
        </div>
        <div style={{ flex: 2 }}>
          <h2>Details</h2>
          <TranscriptionDetails id={selectedId} />
        </div>
      </div>
    </div>
  );
};

export default TranscriptionApp;
