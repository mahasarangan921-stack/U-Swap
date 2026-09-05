import { useState, useRef } from "react";
import Layout from "../components/Layout.jsx";
import { verifyCode, downloadByCode } from "../api.js";
import "./Receive.css";

const STATUS = {
  IDLE: "idle",
  CHECKING: "checking",
  FOUND: "found",
  ERROR: "error",
};

export default function Receive() {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [status, setStatus] = useState(STATUS.IDLE);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const inputRefs = useRef([]);

  const code = digits.join("");

  const updateDigit = (index, value) => {
    const char = value.slice(-1).toUpperCase();
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().toUpperCase().slice(0, 6);
    const next = Array(6).fill("");
    pasted.split("").forEach((char, i) => (next[i] = char));
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const checkCode = async () => {
    if (code.length < 6) {
      setError("Enter all 6 characters.");
      return;
    }
    setStatus(STATUS.CHECKING);
    setError("");

    try {
      const res = await verifyCode(code);
      setFileInfo(res.data);
      setStatus(STATUS.FOUND);
    } catch (err) {
      const message = err.response?.data?.message || "Invalid or unknown code.";
      setError(message);
      setStatus(STATUS.ERROR);
    }
  };

  const download = () => {
    window.location.href = downloadByCode(code);
    setDownloaded(true);
  };

  const reset = () => {
    setDigits(Array(6).fill(""));
    setStatus(STATUS.IDLE);
    setFileInfo(null);
    setError("");
    setDownloaded(false);
    inputRefs.current[0]?.focus();
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Layout>
      <div className="receive">
        <div className="receive__panel">
          <p className="receive__eyebrow">Receive file</p>
          <h1 className="receive__title">
            {status === STATUS.FOUND ? "File found" : "Enter the code"}
          </h1>

          {status !== STATUS.FOUND && (
            <>
              <div className="receive__digits" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    className="receive__digit"
                    value={d}
                    maxLength={1}
                    inputMode="text"
                    onChange={(e) => updateDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                  />
                ))}
              </div>

              {error && <p className="receive__error">{error}</p>}

              <button
                className="receive__submit-btn"
                onClick={checkCode}
                disabled={status === STATUS.CHECKING}
              >
                {status === STATUS.CHECKING ? "Checking…" : "Find file"}
              </button>
            </>
          )}

          {status === STATUS.FOUND && fileInfo && (
            <div className="receive__result">
              <p className="receive__filename">{fileInfo.filename}</p>
              <p className="receive__filesize">{formatSize(fileInfo.size)}</p>

              <button className="receive__download-btn" onClick={download}>
                {downloaded ? "Download started" : "Download file"}
              </button>

              {downloaded && (
                <p className="receive__success">
                  Your download has started. This file is now removed from our servers.
                </p>
              )}

              <button className="receive__reset-btn" onClick={reset}>
                Receive another file
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
