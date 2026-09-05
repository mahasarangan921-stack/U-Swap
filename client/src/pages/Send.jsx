import { useState, useRef, useCallback } from "react";
import Layout from "../components/Layout.jsx";
import CodeDisplay from "../components/CodeDisplay.jsx";
import { uploadFile } from "../api.js";
import "./Send.css";

const STATUS = {
  IDLE: "idle",
  UPLOADING: "uploading",
  SUCCESS: "success",
  ERROR: "error",
};

export default function Send() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((selected) => {
    if (!selected) return;
    setFile(selected);
    setError("");
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    handleFile(dropped);
  };

  const startUpload = async () => {
    if (!file) return;
    setStatus(STATUS.UPLOADING);
    setProgress(0);
    setError("");

    try {
      const res = await uploadFile(file, setProgress);
      setResult(res.data);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      const message =
        err.response?.data?.message || "Upload failed. Please try again.";
      setError(message);
      setStatus(STATUS.ERROR);
    }
  };

  const reset = () => {
    setStatus(STATUS.IDLE);
    setFile(null);
    setResult(null);
    setProgress(0);
    setError("");
  };

  return (
    <Layout>
      <div className="send">
        {status === STATUS.SUCCESS && result ? (
          <CodeDisplay
            code={result.code}
            link={result.link}
            filename={result.filename}
            size={result.size}
            expiresAt={result.expiresAt}
          />
        ) : (
          <div className="send__panel">
            <p className="send__eyebrow">Send file</p>
            <h1 className="send__title">Choose a file to transfer</h1>

            <div
              className={`send__dropzone ${dragActive ? "send__dropzone--active" : ""} ${
                file ? "send__dropzone--filled" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {file ? (
                <>
                  <p className="send__file-name">{file.name}</p>
                  <p className="send__file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <p className="send__dropzone-label">Drop a file here or click to browse</p>
                  <p className="send__dropzone-hint">Files auto-delete after 24 hours</p>
                </>
              )}
            </div>

            {status === STATUS.UPLOADING && (
              <div className="send__progress">
                <div className="send__progress-track">
                  <div
                    className="send__progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="send__progress-label">{progress}%</span>
              </div>
            )}

            {error && <p className="send__error">{error}</p>}

            <button
              className="send__submit-btn"
              disabled={!file || status === STATUS.UPLOADING}
              onClick={startUpload}
            >
              {status === STATUS.UPLOADING ? "Uploading…" : "Upload & get code"}
            </button>

            {file && status !== STATUS.UPLOADING && (
              <button className="send__reset-btn" onClick={reset}>
                Choose a different file
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
