import React, { createContext, useContext } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '../config/stripe';


const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const StripeContext = createContext();

export const useStripe = () => {
    const context = useContext(StripeContext);
    if (!context) {
        throw new Error('useStripe must be used within StripeProvider');
    }
    return context;
};

export const StripeProvider = ({ children }) => {
    const value = {
        stripePromise
    };

    return (
        <StripeContext.Provider value={value}>
            <Elements stripe={stripePromise}>
                {children}
            </Elements>
        </StripeContext.Provider>
    );
};
