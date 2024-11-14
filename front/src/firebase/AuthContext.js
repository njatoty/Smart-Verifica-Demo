import React, { useState, useEffect, useContext, useCallback } from "react";
import { auth, database } from './firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    
    const fetchUserData = useCallback((userId) => {
        const userRef = ref(database, `users/${userId}`);
        const unsubscribe = onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Only update state if necessary to avoid unnecessary renders
                setCurrentUser((prevUser) => {
                    if (!prevUser || prevUser.uid !== userId) {
                        return { uid: userId, ...data };
                    }
                    return prevUser; // Return previous state if it's unchanged
                });
            } else {
                setCurrentUser({ uid: userId }); // Set a minimal user object if no data found
            }
        });

        return () => {
            unsubscribe(); // Cleanup on unmount
        };
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserLoggedIn(true);
                fetchUserData(user.uid);
            } else {
                setCurrentUser(null);
                setUserLoggedIn(false);
            }
            // Set loading to false after user state has been handled
            setLoading(false);
        });

        return () => {
            unsubscribe(); // Cleanup on unmount
        };
    }, [fetchUserData]);


    const value = {
        currentUser,
        userLoggedIn,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
