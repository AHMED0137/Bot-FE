import React, { useEffect, useMemo, useState } from "react";
import candleGif from "./static/candle.gif";
import logo from "./static/testLogo.png";

const Home = () => {
  const [username, setUsername] = useState("U");
  const [showMenu, setShowMenu] = useState(false);
  const [clock, setClock] = useState("");
  const [signals, setSignals] = useState([]);
  const [modal, setModal] = useState({ show: false, message: "", gif: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const signalsPerPage = 4;
  const BACKEND_URL = "https://bot-app-production.up.railway.app";

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/user`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsername(data.username || "U"));

    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString("en-GB", { hour12: false });
      setClock(now);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSignals = async () => {
      const res = await fetch(`${BACKEND_URL}/api/signals`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.error) setSignals(data.reverse());
    };

    fetchSignals();
    const interval = setInterval(fetchSignals, 3000);
    return () => clearInterval(interval);
  }, []);

  const getNextMinute = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const newMinutes = (minutes + 1) % 60;
    const newHours = minutes + 1 === 60 ? (hours + 1) % 24 : hours;
    return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(
      2,
      "0"
    )}:00`;
  };

  const paginatedSignals = useMemo(() => {
    const start = (currentPage - 1) * signalsPerPage;
    return signals.slice(start, start + signalsPerPage);
  }, [signals, currentPage]);

  const handleBot = async (type) => {
    const BACKEND_URL = "https://bot-app-production.up.railway.app";
    const endpoint = `${BACKEND_URL}/api/${type}_bot`;
    const res = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
    });
    setModal({
      show: true,
      message: res.ok
        ? `${type === "start" ? "✅ Bot started!" : "🛑 Bot stopped!"}`
        : "❌ Failed!",
      gif: type === "start" && res.ok ? candleGif : null,
    });
  };

  const handleLogout = async () => {
    await fetch(`${BACKEND_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center px-4">
      <div className="w-full rounded-xl p-6 shadow-lg">
        {/* Navbar */}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <div
              className="w-10 h-10 bg-slate-800 text-sky-400 font-bold rounded-full flex items-center justify-center text-lg shadow cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
            >
              {username.charAt(0).toUpperCase()}
            </div>
            {showMenu && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded shadow-md w-40 p-3 z-50">
                <p className="font-semibold text-blue-800 mb-2">{username}</p>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 w-full"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center">
          <img src={logo} alt="Logo" className="h-[14rem] mb-2" />
        </div>

        {/* Bot Controls */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => handleBot("start")}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-6 py-2 rounded-md text-lg shadow"
          >
            Start Bot
          </button>
          <button
            onClick={() => handleBot("stop")}
            className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-6 py-2 rounded-md text-lg shadow"
          >
            Stop Bot
          </button>
        </div>

        {/* Clock */}
        <div className="flex justify-center mt-6">
          <div className="bg-slate-800 text-white text-xl px-6 py-2 rounded-lg shadow flex flex-col sm:flex-row gap-2 items-center">
            <span className="font-semibold">🕒 Current Time:</span>
            <span className="font-mono text-sky-400">{clock}</span>
          </div>
        </div>

        {/* Signals */}
        <div className="w-[90%] md:w-[40%] min-h-[100px] mt-8 mx-auto grid grid-cols-1 gap-6">
          {paginatedSignals.length > 0 ? (
            paginatedSignals.map((signal, i) => (
              <div
                key={i}
                className="relative bg-white rounded-xl shadow-md p-4 transition-transform hover:scale-105"
              >
                <ColorBar signal={signal} clock={clock} />
                <div className="flex justify-between mb-2">
                  <div className="text-lg font-semibold text-gray-700">
                    {signal.pair}
                  </div>
                  <div className="text-gray-500 font-semibold">
                    {getNextMinute(signal.time)}
                  </div>
                </div>
                <div
                  className={`text-white text-center font-bold py-2 rounded-lg text-lg ${
                    signal.signal === "BUY"
                      ? "bg-green-500"
                      : signal.signal === "SELL"
                      ? "bg-red-500"
                      : "bg-gray-400"
                  }`}
                >
                  {signal.signal}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-white italic">
              No signals yet. Please wait...
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-4 gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 bg-purple-800 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white font-semibold text-lg">
            Page {currentPage} of {Math.ceil(signals.length / signalsPerPage)}
          </span>
          <button
            disabled={currentPage * signalsPerPage >= signals.length}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-[#2D4356] text-white rounded cursor-pointer hover:bg-green-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {modal.show && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setModal({ ...modal, show: false })}
        >
          <div
            className="bg-[#f2f2f5] p-6 rounded-xl shadow-lg w-[90%] max-w-md text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModal({ ...modal, show: false })}
              className="absolute top-0 right-1 text-2xl"
              style={{ backgroundColor: "transparent", color: "black" }}
            >
              &times;
            </button>
            {modal.gif && (
              <img
                src={modal.gif}
                alt="Loading"
                className="mx-auto mb-4 w-44 h-auto object-contain"
              />
            )}
            <p className="text-blue-900 text-lg">{modal.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 7-Second ColorBar Component
const ColorBar = ({ signal, clock }) => {
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const [h, m, s] = clock.split(":").map(Number);
    const [signalH, signalM] = signal.time.split(":").map(Number);
    const nextTime = new Date();
    nextTime.setHours(signalH);
    nextTime.setMinutes(signalM + 1);
    nextTime.setSeconds(0);

    const now = new Date();
    now.setHours(h);
    now.setMinutes(m);
    now.setSeconds(s);

    const diff = nextTime - now;

    if (diff > 0 && diff <= 7000) {
      setShowBar(true);
      const timer = setTimeout(() => setShowBar(false), 7000);
      return () => clearTimeout(timer);
    }
  }, [clock, signal]);

  if (!showBar) return null;

  return (
    <div
      className={`absolute top-0 left-0 h-2 w-full rounded-t-lg ${
        signal.signal === "BUY" ? "bg-green-500" : "bg-red-500"
      }`}
    />
  );
};

export default Home;
