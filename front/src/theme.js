// ./theme.js
import { createTheme } from '@mui/material/styles';

const sustainableTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            // A sustainable green
            main: '#4CAF50',
        },
        secondary: {
            // Optionally, a contrasting accent; adjust if needed.
            main: '#FF1493',
        },
        background: {
            default: '#FFFFFF', // Plain white background
            paper: '#FFFFFF',
        },
        text: {
            primary: '#333333', // Dark text for good contrast on white
            secondary: '#555555',
        },
    },
    typography: {
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    },
});

export default sustainableTheme;
