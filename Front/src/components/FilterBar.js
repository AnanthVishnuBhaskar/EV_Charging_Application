// src/components/FilterBar.jsx
import React, { useState } from 'react';
import { Box, Chip, Slider, Menu, MenuItem, IconButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

function FilterBar({
    distanceValue,
    setDistanceValue,
    typeValue,
    setTypeValue,
    stationTypes,
    onSortToggle,
    ascending,
    minDistance,
    maxDistance,
}) {
    const [anchorElType, setAnchorElType] = useState(null);

    const handleTypeClick = (event) => {
        setAnchorElType(event.currentTarget);
    };

    const handleTypeClose = () => {
        setAnchorElType(null);
    };

    const handleTypeSelect = (val) => {
        setTypeValue(val);
        handleTypeClose();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                overflowX: 'auto',
                p: 1,
                mb: 2,
                borderRadius: 2,
                backgroundColor: '#fff',
                boxShadow: 1,
            }}
        >
            {/* Distance Filter */}
            <Box display="flex" alignItems="center" gap={1}>
                <Slider
                    value={distanceValue}
                    onChange={(e, newVal) => setDistanceValue(newVal)}
                    valueLabelDisplay="auto"
                    min={minDistance}
                    max={maxDistance}
                    step={1}
                    sx={{ width: 120 }}
                />
                <Chip
                    label={distanceValue === maxDistance ? `All Distances` : `${distanceValue} km`}
                    variant="outlined"
                />
            </Box>

            {/* Type Filter */}
            <Chip
                icon={<FilterListIcon fontSize="small" />}
                label={`Type: ${typeValue}`}
                onClick={handleTypeClick}
                color={typeValue !== 'All' ? 'primary' : 'default'}
                sx={{ cursor: 'pointer' }}
            />
            <Menu anchorEl={anchorElType} open={Boolean(anchorElType)} onClose={handleTypeClose}>
                <MenuItem onClick={() => handleTypeSelect('All')}>All</MenuItem>
                {stationTypes.map((type) => (
                    <MenuItem key={type} onClick={() => handleTypeSelect(type)}>
                        {type}
                    </MenuItem>
                ))}
            </Menu>

            {/* Sort Toggle */}
            <IconButton onClick={onSortToggle}>
                <SortIcon />
            </IconButton>
            <Chip label={ascending ? 'Ascending' : 'Descending'} variant="outlined" />
        </Box>
    );
}

export default FilterBar;
