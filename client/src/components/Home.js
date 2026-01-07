import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id);
    toast.success("Created a new Room ID");
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (!roomId.trim() || !username.trim()) {
      toast.error("Room ID and Username are required");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: { username },
    });
    toast.success("Joined room successfully");
  };

  return (
    <div className="landing-page">
      {/* --- Navbar --- */}
      <nav className="navbar navbar-dark bg-dark border-bottom border-secondary">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
         
            <span className="fw-bold text-light">CodeCast</span>
          </a>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="hero-section text-light d-flex align-items-center">
        <div className="container">
          <div className="row align-items-center">
            {/* Left Column: Marketing Text */}
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">
                Real-time collaboration for <span className="text-success">Developers</span>
              </h1>
              <p className="lead text-secondary mb-4">
                Code, compile, and debug together in real-time. Share your room ID
                and start pair programming instantly. No setup required.
              </p>
              <div className="d-flex gap-3">
                <a href="#features" className="btn btn-outline-light btn-lg">
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Column: The Join Form */}
            <div className="col-lg-5 offset-lg-1">
              <div className="card border-0 shadow-lg rounded-4 bg-dark-card">
                <div className="card-body p-4 p-md-5">
                  <h4 className="text-light mb-4 text-center fw-bold">Join a Session</h4>
                  <form onSubmit={joinRoom}>
                    <div className="form-group mb-3">
                      <label className="text-secondary small mb-1">Room ID</label>
                      <input
                        type="text"
                        className="form-control form-control-lg bg-dark text-light border-secondary"
                        placeholder="Enter Room ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                      />
                    </div>
                    <div className="form-group mb-4">
                      <label className="text-secondary small mb-1">Username</label>
                      <input
                        type="text"
                        className="form-control form-control-lg bg-dark text-light border-secondary"
                        placeholder="Enter Username"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                      />
                    </div>
                    <button type="submit" className="btn btn-success btn-lg w-100 mb-3 fw-bold">
                      Join Now
                    </button>
                    <div className="text-center">
                      <span className="text-secondary">No Room ID? </span>
                      <a
                        onClick={generateRoomId}
                        href="#"
                        className="text-success text-decoration-none fw-bold"
                      >
                        Create New Room
                      </a>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-5 bg-darker">
        <div className="container py-5">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="feature-card p-4 rounded-3 h-100">
                <div className="mb-3 text-success h1">⚡</div>
                <h3 className="text-light h5">Real-time Sync</h3>
                <p className="text-secondary">
                  Type code and see changes instantly across all connected clients with zero latency.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card p-4 rounded-3 h-100">
                <div className="mb-3 text-success h1">🔒</div>
                <h3 className="text-light h5">Secure Rooms</h3>
                <p className="text-secondary">
                  Generated unique UUIDs ensure your coding sessions remain private and secure.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card p-4 rounded-3 h-100">
                <div className="mb-3 text-success h1">🎨</div>
                <h3 className="text-light h5">Syntax Highlighting</h3>
                <p className="text-secondary">
                  Beautiful syntax highlighting for JavaScript, Python, C++, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-dark text-center py-4 border-top border-secondary">
        <div className="container">
          <p className="text-secondary mb-0">
            Built with 💚 by <span className="text-light">Akshar Pandey</span> &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;