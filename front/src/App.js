import EvStationIcon from '@mui/icons-material/EvStation';
import { Box, Container, Typography } from '@mui/material';
import React, { useState } from 'react';
import LocationInput from './components/LocationInput';
import StationList from './components/StationList';


function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [stations, setStations] = useState([]);

  // "Locate Me" handler used if the user clicks the icon inside the input
  // (Note: this function is also passed to LocationInput via its icon button)
  const handleUseCurrentLocation = () => {
    console.log("Locate Me clicked");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Current location:", latitude, longitude);
          setCurrentLocation({ lat: latitude, lon: longitude });
          // Reverse geocoding will update the input field automatically.
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        {/* <Paper
          sx={{
            p: 3,
            backgroundColor: 'background.paper',
            boxShadow: 3,
            borderRadius: 2,
          }}
        > */}
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Header with Title and Icon */}
          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
            <EvStationIcon fontSize="large" color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              ChargeSpot
            </Typography>
          </Box>
          {/* Location Input with integrated "Locate Me" icon and separate Search button */}
          <LocationInput
            currentLocation={currentLocation}
            setCurrentLocation={setCurrentLocation}
            setStations={setStations}
            onUseCurrentLocation={handleUseCurrentLocation}
          />
          {/* Station List */}
          <StationList stations={stations} currentLocation={currentLocation} />
        </Box>
        {/* </Paper> */}
      </Container>
    </Box>
  );
}

export default App;
