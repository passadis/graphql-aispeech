import React from "react";
import { useQuery } from "@apollo/client";
import { GET_TRANSCRIPTION } from "../graphql/queries";

const TranscriptionDetails = ({ id }) => {
  const { loading, error, data } = useQuery(GET_TRANSCRIPTION, {
    variables: { id },
    skip: !id, // Skip query if no ID is selected
  });

  if (!id) return <p>Select a transcription to view details.</p>;
  if (loading) return <p>Loading transcription details...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { filename, transcription, fileUrl } = data.getTranscription;

  return (
    <div>
      <h2>Transcription Details</h2>
      <p><strong>Filename:</strong> {filename}</p>
      <p><strong>Transcription:</strong></p>
      <div
        style={{
          backgroundColor: "#f0f0f0",
          padding: "1rem",
          borderRadius: "5px",
          whiteSpace: "pre-wrap",
        }}
      >
        {transcription}
      </div>
      <a href={fileUrl} download>
        <button style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>Download WAV File</button>
      </a>
    </div>
  );
};

export default TranscriptionDetails;
