// ./theme.js
import { createTheme } from '@mui/material/styles';

const fluorescentTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            // A bright neon green
            main: '#39FF14',
        },
        secondary: {
            // For example, a contrasting bright pink
            main: '#FF1493',
        },
        // Optionally adjust the background to enhance the fluorescent look.
        background: {
            default: '#000000', // Dark background to make fluorescent colors pop
            paper: '#222222',
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#CCCCCC',
        },
    },
    typography: {
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    },
});

export default fluorescentTheme;
