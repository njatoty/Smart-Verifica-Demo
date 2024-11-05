import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import fileService from '../Components/services/fileService';

export const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Create a new socket connection
        const socketInstance = io(fileService.API_BASE_URL);

        // Set the socket instance to the state
        setSocket(socketInstance);

        // Listen for socket connection
        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to socket server');
        });

        // Listen for socket disconnection
        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from socket server');
        });

        // Cleanup on component unmount or socket changes
        return () => {
            socketInstance.disconnect(); // Close the connection
        };
    }, []);


    return { socket, isConnected };
};
