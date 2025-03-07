import React, { useState } from 'react';
import ReactMapGL, { Marker, NavigationControl, FullscreenControl, ScaleControl } from 'react-map-gl';
import { Box } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';

function MapComponent({ location, stations }) {
    const [viewport, setViewport] = useState({
        latitude: location.lat,
        longitude: location.lon,
        zoom: 12,
        width: '100%',
        height: '80vh',
    });

    // Filter stations to only include those with valid numeric coordinates.
    const validStations = stations.filter((station) => {
        if (!station.AddressInfo) return false;
        const lat = station.AddressInfo.Latitude;
        const lon = station.AddressInfo.Longitude;
        return typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon);
    });

    return (
        <Box sx={{ position: 'relative', height: '80vh', width: '100%' }}>
            <ReactMapGL
                {...viewport}
                mapboxApiAccessToken="pk.eyJ1IjoiYW5hbnRobWFwIiwiYSI6ImNtN2s1aHg3MTBlcmQyaXB6Y291aGZxbmIifQ.Tei2a_qoimgh7AYue_7qmQ" // Replace with your valid token.
                mapStyle="mapbox://styles/mapbox/streets-v11"
                onViewportChange={(nextViewport) => setViewport(nextViewport)}
            >
                {/* Render user location marker if valid */}
                {location && !isNaN(location.lat) && !isNaN(location.lon) && (
                    <Marker key="user-location" latitude={location.lat} longitude={location.lon}>
                        <div
                            style={{
                                background: 'blue',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                border: '2px solid white',
                            }}
                        />
                    </Marker>
                )}
                {/* Render markers for valid stations */}
                {validStations.map((station) => {
                    const lat = station.AddressInfo.Latitude;
                    const lon = station.AddressInfo.Longitude;
                    return (
                        <Marker key={station.ID || station.AddressInfo.ID} latitude={lat} longitude={lon}>
                            <div
                                style={{
                                    background: 'red',
                                    borderRadius: '50%',
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid white',
                                }}
                            />
                        </Marker>
                    );
                })}

                {/* Map controls */}
                <div style={{ position: 'absolute', right: 10, top: 10 }}>
                    <NavigationControl />
                </div>
                <div style={{ position: 'absolute', right: 10, top: 70 }}>
                    <FullscreenControl />
                </div>
                <div style={{ position: 'absolute', left: 10, bottom: 10 }}>
                    <ScaleControl maxWidth={100} unit="metric" />
                </div>
            </ReactMapGL>
        </Box>
    );
}

export default MapComponent;
