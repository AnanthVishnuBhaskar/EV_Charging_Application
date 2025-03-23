import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    TextField
} from '@mui/material';
import React, { useEffect, useState } from 'react';

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW5hbnRobWFwIiwiYSI6ImNtN2s1aHg3MTBlcmQyaXB6Y291aGZxbmIifQ.Tei2a_qoimgh7AYue_7qmQ"; // Replace with your valid token

function LocationInput({ currentLocation, setCurrentLocation, setStations, onUseCurrentLocation }) {
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    // When currentLocation changes and the input is empty, use reverse geocoding to populate the input.
    useEffect(() => {
        async function fetchReverseGeocode() {
            if (currentLocation && value === '') {
                const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${currentLocation.lon},${currentLocation.lat}.json?access_token=${MAPBOX_TOKEN}`;
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    if (data.features && data.features.length > 0) {
                        setValue(data.features[0].place_name);
                    }
                } catch (error) {
                    console.error("Reverse geocoding error:", error);
                }
            }
        }
        fetchReverseGeocode();
    }, [currentLocation, value]);

    // Fetch autocomplete suggestions whenever input changes.
    useEffect(() => {
        async function fetchSuggestions() {
            if (value.trim().length === 0) {
                setSuggestions([]);
                return;
            }
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?autocomplete=true&access_token=${MAPBOX_TOKEN}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data.features) {
                    setSuggestions(data.features);
                }
            } catch (err) {
                console.error("Error fetching suggestions:", err);
            }
        }
        fetchSuggestions();
    }, [value]);

    // When input is cleared, reset suggestions and clear location/stations.
    useEffect(() => {
        if (value === '') {
            setSuggestions([]);
            setCurrentLocation(null);
            setStations([]);
        }
    }, [value, setCurrentLocation, setStations]);

    // Handler for Search button: perform forward geocoding.
    const handleSearch = async () => {
        if (value.trim().length === 0) {
            alert("Please enter a location.");
            return;
        }
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${MAPBOX_TOKEN}`;
        try {
            const response = await fetch(geocodeUrl);
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const [lon, lat] = feature.center;
                if (!isNaN(lat) && !isNaN(lon)) {
                    setCurrentLocation({ lat, lon });
                    setValue(feature.place_name);
                    // Fetch station data from your backend.
                    const stationData = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/charging-stations`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ latitude: lat, longitude: lon }),
                    }).then((res) => res.json());
                    setStations(stationData.stations);
                    setSuggestions([]);
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

    // Form submission triggers search.
    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    // When a suggestion is clicked, update input (without triggering search).
    const handleSuggestionClick = (suggestion) => {
        setValue(suggestion.place_name);
        setSuggestions([]);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 600,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            <TextField
                fullWidth
                label="Search Location (City, Address)"
                variant="outlined"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={onUseCurrentLocation}>
                                <MyLocationIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{
                    transition: 'box-shadow 0.3s ease',
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                    '&:focus-within': { boxShadow: '0 0 10px rgba(0,0,0,0.3)' },
                }}
            />

            {/* Separate Search Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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

            {/* Absolutely positioned suggestions */}
            {suggestions.length > 0 && (
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
                    <List>
                        {suggestions.map((suggestion) => (
                            <ListItemButton key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)}>
                                <ListItemText primary={suggestion.place_name} />
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
}

export default LocationInput;
