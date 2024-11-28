// store.js
import documentReducer from './documentReducer';
import currencyReducer from './currencyReducer';
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
    reducer: {
        documents: documentReducer,
        currency: currencyReducer
    },
});

export default store;
