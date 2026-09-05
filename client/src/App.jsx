import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Send from "./pages/Send.jsx";
import Receive from "./pages/Receive.jsx";
import ReceiveByLink from "./pages/ReceiveByLink.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/send" element={<Send />} />
      <Route path="/receive" element={<Receive />} />
      <Route path="/r/:token" element={<ReceiveByLink />} />
    </Routes>
  );
}
