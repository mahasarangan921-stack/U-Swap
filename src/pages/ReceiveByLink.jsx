import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import api from "../api.js";
import "./Receive.css";

export default function ReceiveByLink() {
  const { token } = useParams();
  const [status, setStatus] = useState("checking");
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    api
      .get(`/verify/link/${token}`)
      .then((res) => {
        setFileInfo(res.data);
        setStatus("found");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "This link is invalid or has expired.");
        setStatus("error");
      });
  }, [token]);

  const download = () => {
    window.location.href = `/api/download/link/${token}`;
    setDownloaded(true);
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
          <p className="receive__eyebrow">Shared file</p>

          {status === "checking" && <h1 className="receive__title">Verifying…</h1>}

          {status === "error" && (
            <>
              <h1 className="receive__title">Link unavailable</h1>
              <p className="receive__error">{error}</p>
            </>
          )}

          {status === "found" && fileInfo && (
            <div className="receive__result">
              <h1 className="receive__title" style={{ marginBottom: 8 }}>
                File ready
              </h1>
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
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
