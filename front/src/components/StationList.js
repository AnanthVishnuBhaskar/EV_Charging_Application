// src/components/StationList.jsx
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import TuneIcon from '@mui/icons-material/Tune';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Checkbox,
    Collapse, FormControlLabel,
    Grid,
    IconButton, Paper,
    Popover,
    Slider, Typography
} from '@mui/material';
import React, { useMemo, useState } from 'react';

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function StationList({ stations, currentLocation }) {
    const [expandedStationId, setExpandedStationId] = useState(null);
    const [ascending, setAscending] = useState(true);
    // Fixed maximum value for distance filter (in miles)
    const fixedMax = 100;
    const [selectedDistance, setSelectedDistance] = useState(fixedMax);
    // Multi-select filtering for station types
    const [selectedTypes, setSelectedTypes] = useState([]);
    // For filter popover
    const [anchorElFilter, setAnchorElFilter] = useState(null);

    const toggleSortOrder = () => {
        setAscending((prev) => !prev);
    };

    const handleFilterClick = (event) => {
        setAnchorElFilter(event.currentTarget);
    };

    const handleFilterClose = () => {
        setAnchorElFilter(null);
    };

    const handleTypeToggle = (type) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
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
                // Compute distance in km then convert to miles
                const aDistance = haversineDistance(currentLocation.lat, currentLocation.lon, aLat, aLon) * 0.621371;
                const bDistance = haversineDistance(currentLocation.lat, currentLocation.lon, bLat, bLon) * 0.621371;
                return ascending ? aDistance - bDistance : bDistance - aDistance;
            }
            return 0;
        });
    }, [stations, currentLocation, ascending]);

    // We now use fixed values for the slider
    const computedMin = 0;
    const computedMax = fixedMax;
    const effectiveDistance = selectedDistance;

    const filteredStations = useMemo(() => {
        if (!currentLocation) return sortedStations;
        return sortedStations.filter((station) => {
            const lat = station.AddressInfo?.Latitude;
            const lon = station.AddressInfo?.Longitude;
            if (lat !== undefined && lon !== undefined) {
                // Compute distance in km then convert to miles for filtering
                const distanceKm = haversineDistance(currentLocation.lat, currentLocation.lon, lat, lon);
                const distanceMiles = distanceKm * 0.621371;
                const meetsDistance = distanceMiles <= effectiveDistance;
                const meetsType =
                    selectedTypes.length === 0 ||
                    (station.UsageType && selectedTypes.includes(station.UsageType.Title));
                return meetsDistance && meetsType;
            }
            return false;
        });
    }, [sortedStations, currentLocation, effectiveDistance, selectedTypes]);

    const handleCardClick = (stationId) => {
        setExpandedStationId((prev) => (prev === stationId ? null : stationId));
    };

    // Popover open state for filters
    const filterPopoverOpen = Boolean(anchorElFilter);
    const filterPopoverId = filterPopoverOpen ? 'filter-popover' : undefined;

    return (
        <Box sx={{ p: 2 }}>
            {/* Filters, Sort, and Filter Popover Trigger */}
            <Paper
                sx={{
                    p: 1,
                    mb: 2,
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    border: '1px solid #ccc',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 3,
                        flexWrap: 'wrap',
                    }}
                >
                    <IconButton onClick={handleFilterClick} sx={{ p: 1 }}>
                        <TuneIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    </IconButton>
                    <IconButton onClick={toggleSortOrder} sx={{ p: 1 }}>
                        <SwapVertIcon
                            sx={{
                                transform: ascending ? 'rotate(0deg)' : 'rotate(180deg)',
                                transition: 'transform 0.3s',
                                color: 'primary.main',
                                fontSize: 28,
                            }}
                        />
                    </IconButton>
                </Box>
            </Paper>

            {/* Filter Popover */}
            <Popover
                id={filterPopoverId}
                open={filterPopoverOpen}
                anchorEl={anchorElFilter}
                onClose={handleFilterClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box sx={{ p: 2, width: 300 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Distance Filter
                    </Typography>
                    <Slider
                        value={selectedDistance}
                        onChange={(_e, newValue) => setSelectedDistance(newValue)}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value} miles`}
                        min={computedMin}
                        max={computedMax}
                        step={1}
                        sx={{
                            color: 'primary.main',
                            '& .MuiSlider-valueLabel': {
                                backgroundColor: 'primary.main',
                                borderRadius: '50%',
                                color: 'white',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                // Adjust the position to prevent clipping at the ends
                                transform: 'translateX(-50%) translateY(-120%) scale(1)',
                                // Remove any override that hides the pointer:
                                // (if you previously set &:before { display: 'none' }, remove it)
                            },
                        }}
                    />

                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                        Type Filters
                    </Typography>
                    {stationTypes.map((type) => (
                        <FormControlLabel
                            key={type}
                            control={
                                <Checkbox
                                    checked={selectedTypes.includes(type)}
                                    onChange={() => handleTypeToggle(type)}
                                    color="primary"
                                />
                            }
                            label={type}
                        />
                    ))}
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                        <Button size="small" onClick={handleFilterClose}>
                            Apply
                        </Button>
                    </Box>
                </Box>
            </Popover>

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

                    const stationId = station.ID || station.AddressInfo?.ID;
                    const isExpanded = stationId === expandedStationId;

                    return (
                        <Grid item xs={12} sm={6} md={4} key={stationId}>
                            <Card
                                variant="outlined"
                                sx={{
                                    height: '100%',
                                    backgroundColor: 'background.paper',
                                    borderRadius: 2,
                                    boxShadow: 3,
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleCardClick(stationId)}
                            >
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <ElectricCarIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {title}
                                        </Typography>
                                    </Box>
                                    {distanceKm !== null ? (
                                        <Typography variant="body2" color="text.secondary">
                                            Distance: {distanceMiles.toFixed(2)} miles
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Distance not available
                                        </Typography>
                                    )}
                                </CardContent>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <CardContent sx={{ backgroundColor: '#f9f9f9', borderTop: '1px solid #ddd' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <LocationOnIcon sx={{ mr: 0.5, color: 'primary.main' }} />
                                            <Typography variant="body2">
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "blue", textDecoration: "underline" }}
                                                >
                                                    {station.AddressInfo
                                                        ? `${station.AddressInfo.AddressLine1 || "N/A"}${station.AddressInfo.Town ? `, ${station.AddressInfo.Town}` : ""}${station.AddressInfo.StateOrProvince ? `, ${station.AddressInfo.StateOrProvince}` : ""}${station.AddressInfo.Postcode ? `, ${station.AddressInfo.Postcode}` : ""}${station.AddressInfo.Country && station.AddressInfo.Country.Title ? `, ${station.AddressInfo.Country.Title}` : ""}`
                                                        : "N/A"}
                                                </a>
                                            </Typography>
                                        </Box>
                                        {station.OpeningTimes && station.OpeningTimes.length > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                    <AccessTimeIcon sx={{ mr: 0.5, color: 'primary.main' }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                        Timings:
                                                    </Typography>
                                                </Box>
                                                {station.OpeningTimes.map((time, index) => (
                                                    <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                                        {time.DayOfWeek}: {time.OpeningTime} - {time.ClosingTime}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        )}
                                        {station.Reviews && station.Reviews.length > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                    <RateReviewIcon sx={{ mr: 0.5, color: 'primary.main' }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                        Reviews:
                                                    </Typography>
                                                </Box>
                                                {station.Reviews.map((review, index) => (
                                                    <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                                        {review}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        )}
                                        {station.UsageCost && (
                                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                                <MonetizationOnIcon sx={{ mr: 0.5, color: 'primary.main' }} />
                                                <Typography variant="body2">
                                                    {station.UsageCost}
                                                </Typography>
                                            </Box>
                                        )}
                                        {station.OperatorInfo && (
                                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                                <BusinessIcon sx={{ mr: 0.5, color: 'primary.main' }} />
                                                <Typography variant="body2">
                                                    {station.OperatorInfo.WebsiteURL ? (
                                                        <a
                                                            href={station.OperatorInfo.WebsiteURL}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: "blue", textDecoration: "underline" }}
                                                        >
                                                            {station.OperatorInfo.Title}
                                                        </a>
                                                    ) : (
                                                        station.OperatorInfo.Title || "N/A"
                                                    )}
                                                </Typography>
                                            </Box>
                                        )}
                                        {station.GeneralComments && (
                                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                                <ChatBubbleIcon sx={{ mr: 0.5, color: 'primary.main' }} />
                                                <Typography variant="body2">
                                                    {station.GeneralComments}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Collapse>
                                <CardActions sx={{ justifyContent: 'flex-end' }}>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCardClick(stationId);
                                        }}
                                    >
                                        <ExpandMoreIcon
                                            sx={{
                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.3s',
                                            }}
                                        />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}

export default StationList;
