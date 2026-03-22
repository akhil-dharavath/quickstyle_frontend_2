import { createSlice } from '@reduxjs/toolkit';

const getInitialGender = () => {
    try {
        const saved = localStorage.getItem('gender_preference');
        return saved || 'Men'; // Default to Men if nothing saved
    } catch {
        return 'Men';
    }
};

const initialState = {
    gender: getInitialGender(),
    isDarkMode: false, // We can move theme here eventually if needed
    userLocation: null,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setGender: (state, action) => {
            state.gender = action.payload;
            localStorage.setItem('gender_preference', action.payload);
        },
        toggleGender: (state) => {
            const newGender = state.gender === 'Men' ? 'Women' : 'Men';
            state.gender = newGender;
            localStorage.setItem('gender_preference', newGender);
        },
        setUserLocation: (state, action) => {
            state.userLocation = action.payload;
        },
        toggleTheme: (state) => {
            state.isDarkMode = !state.isDarkMode;
            localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
            const root = window.document.documentElement;
            if (state.isDarkMode) {
                root.classList.add('dark');
                root.classList.remove('light');
            } else {
                root.classList.add('light');
                root.classList.remove('dark');
            }
        },
        initTheme: (state) => {
            const savedTheme = localStorage.getItem('theme');
            const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
            state.isDarkMode = isDark;
            const root = window.document.documentElement;
            if (isDark) {
                root.classList.add('dark');
                root.classList.remove('light');
            } else {
                root.classList.add('light');
                root.classList.remove('dark');
            }
        }
    },
});

export const { setGender, toggleGender, setUserLocation, toggleTheme, initTheme } = uiSlice.actions;
export default uiSlice.reducer;
