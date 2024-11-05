import { useState, useEffect } from 'react';

// Custom hook to manage user data in localStorage
export const useUser = () => {
    const [user, setUser] = useState(() => {
        // Initialize user state from localStorage
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null; // Parse the JSON string or return null if not found
    });

    // Function to update user in localStorage and state
    const updateUser = (newUser) => {
        setUser(newUser); // Update state
        localStorage.setItem('user', JSON.stringify(newUser)); // Save to localStorage
    };

    // Function to clear user from localStorage and state
    const clearUser = () => {
        setUser(null); // Clear state
        localStorage.removeItem('user'); // Remove from localStorage
    };

    // Effect to update localStorage whenever user state changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    return { user, updateUser, clearUser }; // Return user data and functions
};

export default useUser;
