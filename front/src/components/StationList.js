// src/components/StationList.jsx
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import TuneIcon from '@mui/icons-material/Tune';

import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Collapse,
    Divider,
    FormControlLabel,
    Grid,
    IconButton, Popover,
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
    const [expandedStationId, setExpandedStationId] = useState(null);
    const [ascending, setAscending] = useState(true);
    // Fixed maximum for distance filter in miles (a more meaningful value)
    const fixedMax = 100;

    // filterValues holds current changes in the popover
    const [filterValues, setFilterValues] = useState({
        distance: fixedMax,
        types: []
    });
    // appliedFilters are used for filtering the stations displayed
    const [appliedFilters, setAppliedFilters] = useState({
        distance: fixedMax,
        types: []
    });

    // For the filter popover
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

    // Update temporary distance filter in popover
    const handleDistanceChange = (_e, newValue) => {
        setFilterValues((prev) => ({ ...prev, distance: newValue }));
    };

    // Toggle type selection in temporary state
    const handleTypeToggle = (type) => {
        setFilterValues((prev) => ({
            ...prev,
            types: prev.types.includes(type)
                ? prev.types.filter((t) => t !== type)
                : [...prev.types, type]
        }));
    };

    // Apply filters when "Apply" is clicked
    const handleApplyFilters = () => {
        setAppliedFilters(filterValues);
        handleFilterClose();
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
                // Calculate distance in km and convert to miles
                const aDistance =
                    haversineDistance(currentLocation.lat, currentLocation.lon, aLat, aLon) *
                    0.621371;
                const bDistance =
                    haversineDistance(currentLocation.lat, currentLocation.lon, bLat, bLon) *
                    0.621371;
                return ascending ? aDistance - bDistance : bDistance - aDistance;
            }
            return 0;
        });
    }, [stations, currentLocation, ascending]);

    // Using fixed slider values for distance filtering (in miles)
    const computedMin = 0;
    const computedMax = fixedMax;
    const effectiveDistance = appliedFilters.distance;

    // Filter stations using applied filters (not the temporary ones)
    const filteredStations = useMemo(() => {
        if (!currentLocation) return sortedStations;
        return sortedStations.filter((station) => {
            const lat = station.AddressInfo?.Latitude;
            const lon = station.AddressInfo?.Longitude;
            if (lat !== undefined && lon !== undefined) {
                const distanceKm = haversineDistance(currentLocation.lat, currentLocation.lon, lat, lon);
                const distanceMiles = distanceKm * 0.621371;
                const meetsDistance = distanceMiles <= effectiveDistance;
                const meetsType =
                    appliedFilters.types.length === 0 ||
                    (station.UsageType && appliedFilters.types.includes(station.UsageType.Title));
                return meetsDistance && meetsType;
            }
            return false;
        });
    }, [sortedStations, currentLocation, effectiveDistance, appliedFilters.types]);

    // Use onMouseEnter/onMouseLeave to expand/collapse card on hover
    const handleMouseEnter = (stationId) => {
        setExpandedStationId(stationId);
    };

    const handleMouseLeave = () => {
        setExpandedStationId(null);
    };

    // Popover open state for filters
    const filterPopoverOpen = Boolean(anchorElFilter);
    const filterPopoverId = filterPopoverOpen ? 'filter-popover' : undefined;

    return (
        <Box sx={{ p: 2 }}>
            {/* Filters, Sort, and Filter Popover Trigger */}

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
                        Distance
                    </Typography>
                    <Slider
                        value={filterValues.distance}
                        onChange={handleDistanceChange}
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
                                transform: 'translateX(-50%) translateY(-120%) scale(1)',
                            },
                        }}
                    />

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Type
                    </Typography>
                    {stationTypes.map((type) => (
                        <FormControlLabel
                            key={type}
                            control={
                                <Checkbox
                                    checked={filterValues.types.includes(type)}
                                    onChange={() => handleTypeToggle(type)}
                                    color="primary"
                                />
                            }
                            label={type}
                            sx={{
                                alignItems: 'flex-start',
                                '& .MuiFormControlLabel-label': {
                                    marginTop: '0.2em',
                                    lineHeight: '1.2',
                                },
                            }}
                        />
                    ))}

                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                        <Button size="small" onClick={handleApplyFilters}>
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
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={() => handleMouseEnter(stationId)}
                                onMouseLeave={handleMouseLeave}
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
                                <Collapse in={isExpanded} timeout={700} unmountOnExit>
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
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}

export default StationList;
