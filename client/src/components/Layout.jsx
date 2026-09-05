import { Link } from "react-router-dom";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <div className="layout__grain" aria-hidden="true" />
      <header className="layout__header">
        <Link to="/" className="layout__logo">
          ARMA<span className="layout__logo-accent">TRANSFER</span>
        </Link>
      </header>
      <main className="layout__main">{children}</main>
      <footer className="layout__footer">
        <span>No accounts. No traces left behind.</span>
      </footer>
    </div>
  );
}
