import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const location = useLocation();

  const isDarkTheme = document.documentElement.classList.contains('dark');
  const toastStyle = {
    background: isDarkTheme ? "#000000" : "#FFFFFF",
    color: isDarkTheme ? "#FFFFFF" : "#374151",
    fontSize: "21px",
  };

  const isAdminPage = location.pathname.startsWith('/adminpage');

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    const newSocket = io(wsUrl, {
      transports: ['websocket'],
      secure: true,
      rejectUnauthorized: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('WebSocket Connected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket Connection Error:', error);
    });

    setSocket(newSocket);
    fetchPlayers();

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('playerUpdated', (updatedPlayer) => {
      setPlayers(prev => {
        const newPlayers = prev.map(player =>
          player.id === updatedPlayer.id ? updatedPlayer : player
        );

        // Only show toast if on admin page
        if (isAdminPage) {
          if (updatedPlayer.operation === 'update') {
            toast.success("Player updated successfully!", {
              style: toastStyle,
            });
          } else {
            toast.success("Player sold successfully!", {
              style: toastStyle,
            });
          }
        }

        return newPlayers;
      });
    });

    return () => {
      socket.off('playerUpdated');
    };
  }, [socket, isAdminPage]);

  const fetchPlayers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/players`);
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, players, fetchPlayers }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext; 