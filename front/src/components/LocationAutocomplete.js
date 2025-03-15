// src/components/LocationAutocomplete.jsx
import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Paper, InputAdornment, IconButton, Box, Button } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';

const MAPBOX_TOKEN = "YOUR_MAPBOX_TOKEN"; // Replace with your valid token

function LocationAutocomplete({ currentLocation, setCurrentLocation, setStations }) {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);

    // Fetch suggestions from Mapbox as the user types.
    useEffect(() => {
        async function fetchSuggestions() {
            if (!inputValue.trim()) {
                setOptions([]);
                return;
            }
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                inputValue
            )}.json?autocomplete=true&access_token=${MAPBOX_TOKEN}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data.features) {
                    setOptions(data.features);
                }
            } catch (err) {
                console.error("Error fetching suggestions:", err);
            }
        }
        fetchSuggestions();
    }, [inputValue]);

    // Handler for when a location is selected from the suggestions.
    const handleSelect = async (event, newValue) => {
        if (newValue) {
            const [lon, lat] = newValue.center;
            if (!isNaN(lat) && !isNaN(lon)) {
                setCurrentLocation({ lat, lon });
                setInputValue(newValue.place_name);
                try {
                    const stationData = await fetch(`http://localhost:8000/api/charging-stations`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ latitude: lat, longitude: lon }),
                    }).then((res) => res.json());
                    setStations(stationData.stations);
                } catch (error) {
                    console.error("Error fetching stations:", error);
                }
            } else {
                alert("Invalid coordinates received.");
            }
        }
    };

    // Handler for the "Locate Me" icon inside the input.
    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lon: longitude });
                    // Reverse geocode to update the input field.
                    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`;
                    try {
                        const response = await fetch(url);
                        const data = await response.json();
                        if (data.features && data.features.length > 0) {
                            setInputValue(data.features[0].place_name);
                        }
                    } catch (error) {
                        console.error("Error in reverse geocoding:", error);
                    }
                },
                (error) => {
                    console.error("Error obtaining location:", error);
                    alert("Unable to retrieve your current location.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    // Handler for the Search button: perform forward geocoding and fetch station data.
    const handleSearch = async () => {
        if (inputValue.trim().length === 0) {
            alert("Please enter a location.");
            return;
        }
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(inputValue)}.json?access_token=${MAPBOX_TOKEN}`;
        try {
            const response = await fetch(geocodeUrl);
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const [lon, lat] = feature.center;
                if (!isNaN(lat) && !isNaN(lon)) {
                    setCurrentLocation({ lat, lon });
                    setInputValue(feature.place_name);
                    const stationData = await fetch(`http://localhost:8000/api/charging-stations`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ latitude: lat, longitude: lon }),
                    }).then((res) => res.json());
                    setStations(stationData.stations);
                    setOptions([]);
                } else {
                    alert("Invalid coordinates received.");
                }
            } else {
                alert("Location not found. Please enter a valid location.");
            }
        } catch (error) {
            console.error("Error during geocoding:", error);
            alert("An error occurred while fetching the location.");
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Input and Search Button in one row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Autocomplete
                    freeSolo
                    options={options}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.place_name)}
                    onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                    onChange={handleSelect}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            autoFocus
                            label="Search Location (City, Address)"
                            variant="outlined"
                            fullWidth
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleLocateMe}>
                                            <MyLocationIcon />
                                        </IconButton>
                                        {params.InputProps.endAdornment}
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                transition: 'box-shadow 0.3s ease',
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '&:focus-within': { boxShadow: '0 0 10px rgba(0,0,0,0.3)' },
                            }}
                        />
                    )}
                    PaperComponent={(props) => (
                        <Paper {...props} sx={{ boxShadow: 3, mt: 1, backgroundColor: 'background.paper' }} />
                    )}
                />
                <Button
                    variant="contained"
                    onClick={handleSearch}
                    startIcon={<SearchIcon />}
                    sx={{
                        textTransform: 'none',
                        borderRadius: '50px',
                        px: 2,
                        py: 1,
                    }}
                >
                    Search
                </Button>
            </Box>
            {/* Suggestions rendered absolutely */}
            {options.length > 0 && (
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%',
                        zIndex: 9999,
                        boxShadow: 3,
                        mt: 1,
                    }}
                >
                    {options.map((option) => (
                        <Box key={option.id}>
                            <Box
                                component="button"
                                onClick={() => {
                                    setInputValue(option.place_name);
                                    setOptions([]);
                                }}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '8px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                {option.place_name}
                            </Box>
                        </Box>
                    ))}
                </Paper>
            )}
        </Box>
    );
}

export default LocationAutocomplete;
