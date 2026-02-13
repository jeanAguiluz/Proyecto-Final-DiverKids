import React from 'react';
import { useProvideAuth } from './useAuth';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }) {
    const auth = useProvideAuth();
    
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}
