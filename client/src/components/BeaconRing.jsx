import "./BeaconRing.css";

export default function BeaconRing({ active = true }) {
  return (
    <div className={`beacon-ring ${active ? "beacon-ring--active" : ""}`} aria-hidden="true">
      <div className="beacon-ring__ring beacon-ring__ring--1" />
      <div className="beacon-ring__ring beacon-ring__ring--2" />
      <div className="beacon-ring__ring beacon-ring__ring--3" />
      <div className="beacon-ring__sweep" />
    </div>
  );
}
