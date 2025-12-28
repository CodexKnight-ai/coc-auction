import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [players, setPlayers] = useState([]);
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/adminpage");

  const fetchPlayers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/players`);
      const data = await res.json();
      setPlayers(data);
    } catch (err) {
      console.error("Failed to fetch players:", err);
    }
  };

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL;

    const socket = io(wsUrl, {
      transports: ["polling", "websocket"], // REQUIRED
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
      fetchPlayers(); // sync state AFTER connection
    });

    socket.on("reconnect", () => {
      console.log("WebSocket reconnected");
      fetchPlayers(); // resync missed events
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket error:", err.message);
    });

    // Handle player updates
    socket.on("playerUpdated", (updatedPlayer) => {
      // console.log("Received player update:", updatedPlayer);
      setPlayers(prevPlayers => {
        // First check by MongoDB _id if available
        if (updatedPlayer._id) {
          const existingById = prevPlayers.find(p => p._id === updatedPlayer._id);
          if (existingById) {
            return prevPlayers.map(p => 
              p._id === updatedPlayer._id ? { ...p, ...updatedPlayer } : p
            );
          }
        }
        
        // Fall back to checking by id field
        const existingByPlayerId = prevPlayers.find(p => p.id === updatedPlayer.id);
        if (existingByPlayerId) {
          return prevPlayers.map(p => 
            p.id === updatedPlayer.id ? { ...p, ...updatedPlayer } : p
          );
        }
        
        // If player doesn't exist, add them
        return [...prevPlayers, updatedPlayer];
      });

      if (isAdminPage) {
        toast.success(
          updatedPlayer.operation === "update"
            ? "Player updated successfully"
            : "Player sold successfully"
        );
      }
    });

    // Handle team updates
    // socket.on("teamUpdated", (updatedTeam) => {
    //   // console.log("Team balance updated:", updatedTeam);
    //   // You can add team state management here if needed
    // });

    // Cleanup function
    return () => {
      socket.off("connect");
      socket.off("reconnect");
      socket.off("connect_error");
      socket.off("playerUpdated");
      socket.off("teamUpdated");
      socket.disconnect();
    };
  }, [isAdminPage]);

  return (
    <WebSocketContext.Provider
      value={{
        socket: socketRef.current,
        players,
        refetchPlayers: fetchPlayers,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebSocket must be used inside WebSocketProvider");
  }
  return ctx;
};
