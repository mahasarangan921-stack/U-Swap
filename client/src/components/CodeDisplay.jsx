import { useState } from "react";
import BeaconRing from "./BeaconRing.jsx";
import "./CodeDisplay.css";

export default function CodeDisplay({ code, link, filename, size, expiresAt }) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const copy = async (text, setter) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch {
      // Clipboard API may be unavailable; fail silently, button remains usable
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const expiryLabel = expiresAt
    ? new Date(expiresAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="code-display">
      <div className="code-display__stage">
        <BeaconRing />
        <div className="code-display__content">
          <p className="code-display__eyebrow">Transfer ready</p>
          <div className="code-display__chars">
            {code.split("").map((char, i) => (
              <span
                key={i}
                className="code-display__char"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {char}
              </span>
            ))}
          </div>
          <p className="code-display__filename" title={filename}>
            {filename} · {formatSize(size)}
          </p>
        </div>
      </div>

      <div className="code-display__actions">
        <button
          className="code-display__action-btn"
          onClick={() => copy(code, setCodeCopied)}
        >
          {codeCopied ? "Code copied" : "Copy code"}
        </button>
        <button
          className="code-display__action-btn code-display__action-btn--secondary"
          onClick={() => copy(link, setLinkCopied)}
        >
          {linkCopied ? "Link copied" : "Copy link"}
        </button>
      </div>

      <div className="code-display__meta">
        <p>Share the code over a call or text — or send the link directly.</p>
        {expiryLabel && <p className="code-display__expiry">Expires {expiryLabel}</p>}
      </div>
    </div>
  );
}
