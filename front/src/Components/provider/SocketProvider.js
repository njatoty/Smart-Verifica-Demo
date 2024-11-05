import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false); // Track connection status
    const socket = useMemo(() => io(process.env.REACT_APP_API_URL), []); // Replace with your server URL

    useEffect(() => {
        // Listen for socket connection
        socket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true); // Update state on successful connection
        });

        // Listen for socket disconnection
        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false); // Update state on disconnection
        });

        // Handle connection error
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false); // Update state on connection error
            console.log(process.env.REACT_APP_API_URL)
        });

        return () => {
            socket.disconnect(); // Clean up when provider unmounts
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
