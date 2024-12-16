import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { LIST_TRANSCRIPTIONS } from "../graphql/queries";

const TranscriptionList = ({ onSelect }) => {
  const { loading, error, data } = useQuery(LIST_TRANSCRIPTIONS);
  const [search, setSearch] = useState("");

  if (loading) return <p>Loading transcriptions...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const filteredTranscriptions = data.listTranscriptions.filter((t) =>
    t.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search by filename"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem",
          width: "100%",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      <ul style={{ listStyle: "none", padding: "0" }}>
        {filteredTranscriptions.map((t) => (
          <li key={t.id}>
            <button
              className="transcription-button"
              onClick={() => onSelect(t.id)}
            >
              {t.filename}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TranscriptionList;
