import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const LANGUAGES = [
  "python3", "java", "cpp", "nodejs", "c", "ruby", "go",
  "scala", "bash", "sql", "pascal", "csharp", "php", "swift", "rust", "r",
];

function EditorPage() {
  // 1. REFS
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  
  // 2. ROUTER HOOKS
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  // 3. STATE HOOKS
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  // 4. EFFECTS (Socket Initialization)
  useEffect(() => {
    // Only run if we have the required state
    if (!location.state?.username) return;

    const init = async () => {
      socketRef.current = await initSocket();

      // Error Handling
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        navigate("/");
      }

      // Join Room
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state.username,
      });

      // Listen for Joined
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state.username) {
          toast.success(`${username} joined the room.`);
        }
        setClients(clients);
        
        // Sync code to the new user
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      });

      // Listen for Disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };

    init();

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, [location.state, navigate, roomId]);

  // 5. CONDITIONAL REDIRECT (Must be after Hooks)
  if (!location.state) {
    return <Navigate to="/" />;
  }

  // 6. COMPONENT ACTIONS
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied!");
    } catch (err) {
      toast.error("Could not copy Room ID");
    }
  };

  const leaveRoom = () => navigate("/");

  const runCode = async () => {
    setIsCompiling(true);
    setIsTerminalOpen(true);
    try {
      const response = await axios.post("localhost:12345/compile", {
        code: codeRef.current,
        language: selectedLanguage,
      });
      setOutput(response.data.output || "Code executed successfully (no output).");
    } catch (error) {
      setOutput(error.response?.data?.error || "Error: Could not connect to compiler.");
    } finally {
      setIsCompiling(false);
    }
  };

  // 7. RENDER
  return (
    <div className="container-fluid vh-100 p-0 d-flex flex-column overflow-hidden bg-dark">
      <div className="d-flex flex-grow-1 overflow-hidden">
        
        {/* Sidebar */}
        <div className="d-flex flex-column border-end border-secondary bg-dark" style={{ width: "260px" }}>
          <div className="p-3 border-bottom border-secondary">
            <h5 className="text-light m-0 small fw-bold text-uppercase">Collaborators</h5>
          </div>

          <div className="flex-grow-1 overflow-auto p-3">
            <div className="d-flex flex-wrap gap-3">
              {clients.map((client) => (
                <Client key={client.socketId} username={client.username} />
              ))}
            </div>
          </div>

          <div className="p-3 border-top border-secondary">
            <button className="btn btn-outline-success btn-sm w-100 mb-2" onClick={copyRoomId}>
              Copy Room ID
            </button>
            <button className="btn btn-danger btn-sm w-100" onClick={leaveRoom}>
              Leave Room
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="d-flex flex-column flex-grow-1">
          {/* Top Bar */}
          <div className="bg-dark p-2 px-3 d-flex justify-content-between align-items-center border-bottom border-secondary">
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small">Language:</span>
              <select 
                className="form-select form-select-sm bg-dark text-light border-secondary w-auto"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
            
            <button 
              className="btn btn-success btn-sm px-4 fw-bold" 
              onClick={runCode} 
              disabled={isCompiling}
            >
              {isCompiling ? "Running..." : "Run Code"}
            </button>
          </div>

          {/* Code Editor */}
          <div className="flex-grow-1 overflow-hidden bg-dark">
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={(code) => {
                codeRef.current = code;
              }}
            />
          </div>

          {/* Terminal */}
          {isTerminalOpen && (
            <div className="border-top border-secondary bg-black" style={{ height: '30%', minHeight: '150px' }}>
              <div className="d-flex justify-content-between px-3 py-1 bg-dark text-secondary small border-bottom border-secondary">
                <span>Output Console</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setIsTerminalOpen(false)}>✖</span>
              </div>
              <pre className="p-3 text-light font-monospace small h-100 overflow-auto m-0">
                {output || "> Ready to compile..."}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
