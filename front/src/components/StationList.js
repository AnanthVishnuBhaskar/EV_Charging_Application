// src/components/StationList.jsx
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BusinessIcon from '@mui/icons-material/Business';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReviewsIcon from '@mui/icons-material/RateReview';
import StraightenIcon from '@mui/icons-material/Straighten';
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

// Helper: calculates distance between two coordinates (in km)
function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// DetailRow renders an icon alongside a text value.
// If value is falsy, it displays "Not Available" in green.
const DetailRow = ({ IconComponent, value, fallback = "Not Available" }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <IconComponent sx={{ mr: 0.5, color: 'primary.main' }} />
        <Typography variant="body2" sx={{ color: value ? 'text.secondary' : "#4CAF50" }}>
            {value ? value : fallback}
        </Typography>
    </Box>
);

function StationList({ stations, currentLocation }) {
    // Card expansion state for hover effect
    const [expandedStationId, setExpandedStationId] = useState(null);
    const [ascending, setAscending] = useState(true);
    // Fixed maximum for distance filter in miles
    const fixedMax = 100;

    // Temporary filter state and applied filters
    const [filterValues, setFilterValues] = useState({
        distance: fixedMax,
        types: []
    });
    const [appliedFilters, setAppliedFilters] = useState({
        distance: fixedMax,
        types: []
    });

    // For the filter popover
    const [anchorElFilter, setAnchorElFilter] = useState(null);

    // Pagination: show 10 items per page
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const toggleSortOrder = () => {
        setAscending((prev) => !prev);
    };

    const handleFilterClick = (event) => {
        setAnchorElFilter(event.currentTarget);
    };

    const handleFilterClose = () => {
        setAnchorElFilter(null);
    };

    const handleDistanceChange = (_e, newValue) => {
        setFilterValues((prev) => ({ ...prev, distance: newValue }));
    };

    const handleTypeToggle = (type) => {
        setFilterValues((prev) => ({
            ...prev,
            types: prev.types.includes(type)
                ? prev.types.filter((t) => t !== type)
                : [...prev.types, type]
        }));
    };

    const handleApplyFilters = () => {
        setAppliedFilters(filterValues);
        setCurrentPage(1); // Reset to first page when filters are applied
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

    const computedMin = 0;
    const computedMax = fixedMax;
    const effectiveDistance = appliedFilters.distance;

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

    // Pagination: compute stations for the current page
    const paginatedStations = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStations.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStations, currentPage]);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredStations.length / itemsPerPage))
            setCurrentPage((prev) => prev + 1);
    };

    // Expand/collapse only the card being hovered
    const handleMouseEnter = (stationId) => {
        setExpandedStationId(stationId);
    };
    const handleMouseLeave = () => {
        setExpandedStationId(null);
    };

    const filterPopoverOpen = Boolean(anchorElFilter);
    const filterPopoverId = filterPopoverOpen ? 'filter-popover' : undefined;

    // Calculate the results count text in the format "X–Y of Z"
    const totalResults = filteredStations.length;
    const startResult = totalResults === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endResult = Math.min(currentPage * itemsPerPage, totalResults);
    const resultsText = `${startResult}–${endResult} of ${totalResults}`;

    return (
        <Box sx={{ p: 2 }}>
            {/* Results Count with arrow buttons at top right */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 1 }}>
                <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
                    <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                    {resultsText}
                </Typography>
                <IconButton
                    onClick={handleNextPage}
                    disabled={currentPage >= Math.ceil(filteredStations.length / itemsPerPage)}
                >
                    <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Filter/Sort Section */}
            <Box
                sx={{
                    p: 1,
                    mb: 2,
                    background: 'transparent',
                    border: 'none',
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
                        min={computedMin}
                        max={computedMax}
                        step={1}
                        sx={{
                            color: 'primary.main',
                            '& .MuiSlider-valueLabel': {
                                backgroundColor: 'primary.main',
                                borderRadius: '60%',
                                color: 'white',
                                alignItems: 'center',
                                justifyContent: 'center',
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
                {paginatedStations.map((station) => {
                    const lat = station.AddressInfo?.Latitude;
                    const lon = station.AddressInfo?.Longitude;
                    const title = station.AddressInfo?.Title || "Not Available";

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
                                        <Box display="flex" alignItems="center">
                                            <StraightenIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {distanceMiles.toFixed(2)} miles
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" sx={{ color: "#4CAF50" }}>
                                            Not Available
                                        </Typography>
                                    )}
                                </CardContent>
                                <Collapse in={isExpanded} timeout={700} unmountOnExit>
                                    <CardContent sx={{ backgroundColor: '#f9f9f9', borderTop: '1px solid #ddd' }}>
                                        {/* Address */}
                                        <DetailRow
                                            IconComponent={LocationOnIcon}
                                            value={
                                                station.AddressInfo
                                                    ? `${station.AddressInfo.AddressLine1 || ""}${station.AddressInfo.Town ? `, ${station.AddressInfo.Town}` : ""}${station.AddressInfo.StateOrProvince ? `, ${station.AddressInfo.StateOrProvince}` : ""}${station.AddressInfo.Postcode ? `, ${station.AddressInfo.Postcode}` : ""}${station.AddressInfo.Country && station.AddressInfo.Country.Title ? `, ${station.AddressInfo.Country.Title}` : ""}`
                                                    : null
                                            }
                                        />
                                        {/* Timings */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <AccessTimeIcon sx={{ mr: 0.5, color: "#4CAF50" }} />
                                            {station.OpeningTimes && station.OpeningTimes.length > 0 ? (
                                                <Box sx={{ ml: 1 }}>
                                                    {station.OpeningTimes.map((time, index) => (
                                                        <Typography key={index} variant="body2" sx={{ color: 'text.secondary' }}>
                                                            {time.DayOfWeek}: {time.OpeningTime} - {time.ClosingTime}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" sx={{ ml: 1, color: "#4CAF50" }}>
                                                    Not Available
                                                </Typography>
                                            )}
                                        </Box>
                                        {/* Reviews */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <ReviewsIcon sx={{ mr: 0.5, color: "#4CAF50" }} />
                                            {station.Reviews && station.Reviews.length > 0 ? (
                                                <Box sx={{ ml: 1 }}>
                                                    {station.Reviews.map((review, index) => (
                                                        <Typography key={index} variant="body2" sx={{ color: 'text.secondary' }}>
                                                            {review}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" sx={{ ml: 1, color: "#4CAF50" }}>
                                                    Not Available
                                                </Typography>
                                            )}
                                        </Box>
                                        {/* Usage Cost */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <MonetizationOnIcon sx={{ mr: 0.5, color: "#4CAF50" }} />
                                            <Typography variant="body2" sx={{ color: "#4CAF50" }}>
                                                {station.UsageCost ? station.UsageCost : "Not Available"}
                                            </Typography>
                                        </Box>
                                        {/* Operator Info */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <BusinessIcon sx={{ mr: 0.5, color: 'primary.main' }} />
                                            <Typography variant="body2">
                                                {station.OperatorInfo ? (
                                                    station.OperatorInfo.WebsiteURL ? (
                                                        <a
                                                            href={station.OperatorInfo.WebsiteURL}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: "#4CAF50", textDecoration: "underline" }}
                                                        >
                                                            {station.OperatorInfo.Title || "Not Available"}
                                                        </a>
                                                    ) : (
                                                        station.OperatorInfo.Title || "Not Available"
                                                    )
                                                ) : (
                                                    <span style={{ color: "#4CAF50" }}>Not Available</span>
                                                )}
                                            </Typography>
                                        </Box>
                                        {/* General Comments */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <ChatBubbleIcon sx={{ mr: 0.5, color: "#4CAF50" }} />
                                            <Typography variant="body2" sx={{ color: "#4CAF50" }}>
                                                {station.GeneralComments ? station.GeneralComments : "Not Available"}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Collapse>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Pagination Arrows (if more than one page) */}
            {filteredStations.length > itemsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2 }}>
                    <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                        {resultsText}
                    </Typography>
                    <IconButton
                        onClick={handleNextPage}
                        disabled={currentPage >= Math.ceil(filteredStations.length / itemsPerPage)}
                    >
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
}

export default StationList;
