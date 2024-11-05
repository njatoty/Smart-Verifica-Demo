import { useEffect } from 'react';
import {useSocket} from './useSocket'; // Import the context

const useSocketEvent = (eventName, callback) => {
    const { socket, isConnected } = useSocket(); // Get socket and connection status

    useEffect(() => {
        if (!isConnected) return; // Do nothing if the socket is not connected
        // Listen for the specific event
        socket.on(eventName, callback);
        // Clean up the event listener on unmount
        return () => {
            socket.off(eventName, callback);
        };
    }, [socket, eventName, callback, isConnected]); // Add isConnected to dependencies
};

export default useSocketEvent;
