import { useState, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [language, setLanguage] = useState("en-US");
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [file, setFile] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("language", language);

      sendToBackend(formData);
      audioChunksRef.current = [];
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const uploadAudio = () => {
    if (!file) {
      alert("Please select file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    sendToBackend(formData);
  };

  const sendToBackend = async (formData) => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/transcribe",
        formData
      );

      if (res.data.success) {
        setTranscript(res.data.transcript);
      } else {
        setTranscript(res.data.error);
      }
    } catch {
      setTranscript("Backend error");
    }
  };

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <h1>Speech To Text Converter</h1>
      </header>

      {/* MAIN CONTENT */}
      <div className="container">
        
        {/* Language */}
        <select
          className="select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en-US">English</option>
          <option value="hi-IN">Hindi</option>
          <option value="te-IN">Telugu</option>
          <option value="ta-IN">Tamil</option>
          <option value="kn-IN">Kannada</option>
        </select>

        {/* Recording */}
        {!recording ? (
          <button className="btn" onClick={startRecording}>
            🎤 Start Recording
          </button>
        ) : (
          <button className="btn stop" onClick={stopRecording}>
            ⏹ Stop Recording
          </button>
        )}

        {/* File Upload */}
        <input
          className="file"
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button className="btn" onClick={uploadAudio}>
          📁 Upload Audio
        </button>

        {/* Output */}
        <textarea
          className="textarea"
          value={transcript}
          readOnly
        />
      </div>

      {/* FOOTER */}
      <footer className="footer">
      <p>©Poornima Project | Speech To Text App</p>
      </footer>
    </div>
  );
}

export default App;