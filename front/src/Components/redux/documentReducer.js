
import { configureStore, createSlice } from '@reduxjs/toolkit';

const documentSlice = createSlice({
    name: 'documents',
    initialState: {
        prevalidationCount: 0,
        returnedCount: 0,
        rejectedCount: 0,
        validationV2Count: 0,
        validatedCount: 0
    },
    reducers: {
        affectPrevalidation: (state, action) => {
            state.prevalidationCount = action.payload;
        },
        incrementPrevalidation: (state, action) => {
            const incrementValue = action.payload ?? 1;
            state.prevalidationCount += incrementValue;
        },
        decrementPrevalidation: (state) => {
            if (state.prevalidationCount > 0) state.prevalidationCount -= 1;
        },
        affectReturned: (state, action) => {
            state.returnedCount = action.payload;
        },
        incrementReturned: (state, action) => {
            const incrementValue = action.payload ?? 1;
            state.returnedCount += incrementValue;
        },
        decrementReturned: (state) => {
            if (state.returnedCount > 0) state.returnedCount -= 1;
        },
        affectRejected: (state, action) => {
            state.rejectedCount = action.payload;
        },
        incrementRejected: (state, action) => {
            const incrementValue = action.payload ?? 1;
            state.rejectedCount += incrementValue;
        },
        decrementRejected: (state) => {
            if (state.rejectedCount > 0) state.rejectedCount -= 1;
        },
        affectValidation2: (state, action) => {
            state.validationV2Count = action.payload;
        },
        incrementValidationV2: (state, action) => {
            const incrementValue = action.payload ?? 1;
            state.validationV2Count += incrementValue;
        },
        decrementValidationV2: (state) => {
            if (state.validationV2Count > 0) state.validationV2Count -= 1;
        },
        affectValidated: (state, action) => {
            state.validatedCount = action.payload;
        },
        incrementValidated: (state, action) => {
            const incrementValue = action.payload ?? 1;
            state.validatedCount += incrementValue;
        },
        decrementValidated: (state) => {
            if (state.validatedCount > 0) state.validatedCount -= 1;
        },
        resetCounts: (state) => {
            state.prevalidationCount = 0;
            state.returnedCount = 0;
            state.rejectedCount = 0;
            state.validationV2Count = 0;
            state.validatedCount = 0;
        },
    },
});

export const {
    incrementPrevalidation,
    decrementPrevalidation,
    incrementReturned,
    decrementReturned,
    incrementRejected,
    decrementRejected,
    incrementValidationV2,
    decrementValidationV2,
    incrementValidated,
    decrementValidated,
    resetCounts,
    affectPrevalidation,
    affectReturned,
    affectRejected,
    affectValidated,
    affectValidation2
} = documentSlice.actions;

export default documentSlice.reducer;