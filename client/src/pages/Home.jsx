import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import BeaconRing from "../components/BeaconRing.jsx";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="home">
        <div className="home__hero">
          <BeaconRing />
          <div className="home__hero-content">
            <p className="home__eyebrow">Point-to-point file transfer</p>
            <h1 className="home__title">
              Send a file.
              <br />
              Share a code.
            </h1>
            <p className="home__subtitle">
              No accounts, no installs. Upload a file, get a 6-character code,
              and hand it off however you talk to people.
            </p>
          </div>
        </div>

        <div className="home__choices">
          <button className="home__choice-card" onClick={() => navigate("/send")}>
            <span className="home__choice-icon">↑</span>
            <span className="home__choice-label">Send File</span>
            <span className="home__choice-desc">Upload and get your code</span>
          </button>
          <button
            className="home__choice-card home__choice-card--secondary"
            onClick={() => navigate("/receive")}
          >
            <span className="home__choice-icon">↓</span>
            <span className="home__choice-label">Receive File</span>
            <span className="home__choice-desc">Enter a code to download</span>
          </button>
        </div>
      </div>
    </Layout>
  );
}
