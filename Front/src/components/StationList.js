// src/components/StationList.jsx
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Slider,
    Typography
} from '@mui/material';
import React, { useMemo, useState } from 'react';

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function StationList({ stations, currentLocation }) {
    const [selectedStation, setSelectedStation] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [ascending, setAscending] = useState(true);

    // Set default filter distance to Infinity (i.e., no filtering)
    const [selectedDistance, setSelectedDistance] = useState(Infinity);
    const [selectedType, setSelectedType] = useState("All");
    const [anchorElType, setAnchorElType] = useState(null);

    const toggleSortOrder = () => {
        setAscending((prev) => !prev);
    };

    const handleTypeChipClick = (event) => {
        setAnchorElType(event.currentTarget);
    };

    const handleTypeMenuClose = () => {
        setAnchorElType(null);
    };

    const handleTypeSelect = (value) => {
        setSelectedType(value);
        handleTypeMenuClose();
    };

    const stationTypes = useMemo(() => {
        const types = new Set();
        stations.forEach((station) => {
            if (station.UsageType && station.UsageType.Title) {
                types.add(station.UsageType.Title);
            }
        });
        return Array.from(types);
    }, [stations]);

    const sortedStations = useMemo(() => {
        if (!currentLocation) return stations;
        return [...stations].sort((a, b) => {
            const aLat = a.AddressInfo?.Latitude;
            const aLon = a.AddressInfo?.Longitude;
            const bLat = b.AddressInfo?.Latitude;
            const bLon = b.AddressInfo?.Longitude;
            if (
                aLat !== undefined &&
                aLon !== undefined &&
                bLat !== undefined &&
                bLon !== undefined
            ) {
                const aDistance = haversineDistance(currentLocation.lat, currentLocation.lon, aLat, aLon);
                const bDistance = haversineDistance(currentLocation.lat, currentLocation.lon, bLat, bLon);
                return ascending ? aDistance - bDistance : bDistance - aDistance;
            }
            return 0;
        });
    }, [stations, currentLocation, ascending]);

    const distances = useMemo(() => {
        if (!currentLocation) return [];
        return stations
            .map((station) => {
                const lat = station.AddressInfo?.Latitude;
                const lon = station.AddressInfo?.Longitude;
                if (lat !== undefined && lon !== undefined) {
                    return haversineDistance(currentLocation.lat, currentLocation.lon, lat, lon);
                }
                return null;
            })
            .filter((d) => d !== null);
    }, [stations, currentLocation]);

    const computedMin = distances.length > 0 ? Math.floor(Math.min(...distances)) : 0;
    const computedMax = distances.length > 0 ? Math.ceil(Math.max(...distances)) : 100;
    // effectiveDistance: if slider is set to Infinity (default), we use computedMax so that all results show.
    const effectiveDistance = selectedDistance === Infinity ? computedMax : selectedDistance;

    const filteredStations = useMemo(() => {
        if (!currentLocation) return sortedStations;
        return sortedStations.filter((station) => {
            const lat = station.AddressInfo?.Latitude;
            const lon = station.AddressInfo?.Longitude;
            if (lat !== undefined && lon !== undefined) {
                const distance = haversineDistance(currentLocation.lat, currentLocation.lon, lat, lon);
                const meetsDistance = distance <= effectiveDistance;
                const meetsType =
                    selectedType === "All" ||
                    (station.UsageType && station.UsageType.Title === selectedType);
                return meetsDistance && meetsType;
            }
            return false;
        });
    }, [sortedStations, currentLocation, effectiveDistance, selectedType]);

    const handleViewDetails = (station) => {
        setSelectedStation(station);
        setDetailsOpen(true);
    };

    const handleDetailsClose = () => {
        setDetailsOpen(false);
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Filters & Sort Section */}
            <Paper
                sx={{
                    p: 1,
                    mb: 2,
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    border: '1px solid #ccc',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
                    {/* Distance Slider with Value Label as a Blob */}
                    <Box display="flex" alignItems="center" gap={1}>
                        <Slider
                            value={selectedDistance === Infinity ? computedMax : selectedDistance}
                            onChange={(e, newValue) => setSelectedDistance(newValue)}
                            valueLabelDisplay="on"
                            min={computedMin}
                            max={computedMax}
                            step={1}
                            sx={{
                                width: 120,
                                color: 'primary.main',
                                '& .MuiSlider-valueLabel': {
                                    backgroundColor: 'primary.main',
                                    borderRadius: '50%',
                                    color: 'white',
                                },
                            }}
                        />
                    </Box>
                    {/* Type Filter Chip */}
                    <Chip
                        label={`Type: ${selectedType}`}
                        onClick={handleTypeChipClick}
                        size="small"
                        color={selectedType !== "All" ? "primary" : "default"}
                        sx={{
                            textTransform: 'none',
                            cursor: 'pointer',
                            ...(selectedType !== "All" && {
                                backgroundColor: 'primary.main',
                                color: 'white',
                            }),
                        }}
                        icon={<FilterListIcon fontSize="small" />}
                    />
                    <Menu
                        anchorEl={anchorElType}
                        open={Boolean(anchorElType)}
                        onClose={handleTypeMenuClose}
                    >
                        <MenuItem onClick={() => handleTypeSelect("All")}>All</MenuItem>
                        {stationTypes.map((type) => (
                            <MenuItem key={type} onClick={() => handleTypeSelect(type)}>
                                {type}
                            </MenuItem>
                        ))}
                    </Menu>
                    {/* Sort Button */}
                    <IconButton onClick={toggleSortOrder}>
                        <SortIcon />
                    </IconButton>
                </Box>
            </Paper>

            {/* Station Cards */}
            <Grid container spacing={2}>
                {filteredStations.map((station) => {
                    const lat = station.AddressInfo?.Latitude;
                    const lon = station.AddressInfo?.Longitude;
                    const title = station.AddressInfo?.Title || "Unknown Station";

                    let distanceKm = null;
                    let distanceMiles = null;
                    if (currentLocation && lat !== undefined && lon !== undefined) {
                        distanceKm = haversineDistance(currentLocation.lat, currentLocation.lon, lat, lon);
                        distanceMiles = distanceKm * 0.621371;
                    }

                    return (
                        <Grid item xs={12} sm={6} md={4} key={station.ID || station.AddressInfo?.ID}>
                            <Card
                                variant="outlined"
                                sx={{
                                    height: '100%',
                                    backgroundColor: 'background.paper',
                                    borderRadius: 2,
                                    boxShadow: 3,
                                }}
                            >
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <ElectricCarIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {title}
                                        </Typography>
                                    </Box>
                                    {distanceKm !== null ? (
                                        <Typography variant="body2" color="text.secondary">
                                            Distance: {distanceKm.toFixed(2)} km / {distanceMiles.toFixed(2)} miles
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Distance not available
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        onClick={() => handleViewDetails(station)}
                                        variant="contained"
                                        sx={{
                                            backgroundColor: 'primary.main',
                                            '&:hover': { backgroundColor: 'primary.dark' },
                                            textTransform: 'none',
                                            borderRadius: '50px',
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onClose={handleDetailsClose} maxWidth="sm" fullWidth>
                <DialogTitle>Station Details</DialogTitle>
                <DialogContent dividers>
                    {selectedStation ? (
                        <>
                            <Typography variant="h6">
                                {selectedStation.AddressInfo?.Title || "Unknown Station"}
                            </Typography>
                            <DialogContentText sx={{ mt: 1 }}>
                                <strong>Address:</strong>{" "}
                                {selectedStation.AddressInfo?.AddressLine1 || "N/A"}
                                {selectedStation.AddressInfo?.Town ? `, ${selectedStation.AddressInfo?.Town}` : ""}
                                {selectedStation.AddressInfo?.StateOrProvince ? `, ${selectedStation.AddressInfo?.StateOrProvince}` : ""}
                                {selectedStation.AddressInfo?.Postcode ? `, ${selectedStation.AddressInfo?.Postcode}` : ""}
                                {selectedStation.AddressInfo?.Country?.Title ? `, ${selectedStation.AddressInfo?.Country.Title}` : ""}
                            </DialogContentText>
                            {selectedStation.UsageCost && (
                                <DialogContentText sx={{ mt: 1 }}>
                                    <strong>Pricing:</strong> {selectedStation.UsageCost}
                                </DialogContentText>
                            )}
                            {selectedStation.OperatorInfo && (
                                <DialogContentText sx={{ mt: 1 }}>
                                    <strong>Operator:</strong> {selectedStation.OperatorInfo.Title || "N/A"}
                                    {selectedStation.OperatorInfo.WebsiteURL && (
                                        <>
                                            {" "}
                                            (<a href={selectedStation.OperatorInfo.WebsiteURL} target="_blank" rel="noopener noreferrer">
                                                Website
                                            </a>)
                                        </>
                                    )}
                                </DialogContentText>
                            )}
                            {selectedStation.GeneralComments && (
                                <DialogContentText sx={{ mt: 1 }}>
                                    <strong>Comments:</strong> {selectedStation.GeneralComments}
                                </DialogContentText>
                            )}
                        </>
                    ) : (
                        <DialogContentText>Loading station details...</DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleDetailsClose}
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': { backgroundColor: 'primary.light' },
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default StationList;
