import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPLOAD_FILE_MUTATION } from "../graphql/mutations";
import { Spinner, PrimaryButton } from "@fluentui/react";

const Home = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [uploadFile] = useMutation(UPLOAD_FILE_MUTATION);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setIsUploading(true);
    setTranscription(""); // Clear any previous result

    try {
      const { data } = await uploadFile({
        variables: { file },
      });

      if (data?.uploadFile?.success) {
        setTranscription(data.uploadFile.message);
      } else {
        alert("Upload failed: " + (data?.uploadFile?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error during upload:", error);
      alert("An error occurred during the file upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", color: "#333" }}>
      <h1>Audio Transcription</h1>
      <p>Upload an audio file to generate a transcript.</p>
      <input type="file" onChange={handleFileChange} accept="audio/*" style={{ margin: "10px 0" }} />
      <br />
      <PrimaryButton
        text={isUploading ? "Uploading..." : "Upload and Transcribe"}
        onClick={handleUpload}
        disabled={isUploading || !file}
        styles={{
          root: {
            marginTop: "10px",
          },
        }}
      />
      {isUploading && <Spinner label="Uploading and transcribing..." />}
      {transcription && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#f4f4f4",
          }}
        >
          <h2>Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
