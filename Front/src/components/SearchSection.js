// src/components/SearchSection.jsx
import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationInput from './LocationInput'; // your existing location input

function SearchSection({ currentLocation, setCurrentLocation, setStations, onLocateMe }) {
    return (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                boxShadow: 1,
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Where do you want to Charge?
            </Typography>
            <LocationInput
                currentLocation={currentLocation}
                setCurrentLocation={setCurrentLocation}
                setStations={setStations}
            />
            <Box display="flex" justifyContent="flex-start" mt={1}>
                <Button
                    variant="outlined"
                    startIcon={<MyLocationIcon />}
                    onClick={onLocateMe}
                    sx={{
                        textTransform: 'none',
                        mr: 2,
                    }}
                >
                    Locate Me
                </Button>
                {/* Additional search or date/time filters if needed */}
            </Box>
        </Paper>
    );
}

export default SearchSection;
