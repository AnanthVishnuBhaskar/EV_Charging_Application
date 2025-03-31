// src/components/ResultsSection.jsx
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Grid,
    Typography,
    Pagination
} from '@mui/material';
import React from 'react';

function ResultsSection({ stations, currentPage, itemsPerPage }) {
    // Calculate total number of stations
    const total = stations.length;
    // Calculate the index of the first and last station in the current page
    const start = total > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const end = Math.min(currentPage * itemsPerPage, total);

    return (
        <Box>
            {/* Header with results count */}
            <Box
                sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
                    Results
                </Typography>
                <Chip
                    label={`${start}-${end} of ${total}`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                />
            </Box>

            <Grid container spacing={2}>
                {stations.map((station) => (
                    <Grid item xs={12} sm={6} md={4} key={station.ID || station.name}>
                        <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 1 }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <ElectricCarIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {station.name || 'Unknown Station'}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Distance from location: {station.distance} km
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button variant="contained" sx={{ textTransform: 'none' }}>
                                    View Details
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Optionally, add a Pagination component here */}
            {/* Example:
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={Math.ceil(total / itemsPerPage)} page={currentPage} onChange={(_e, page) => {}} color="primary" />
      </Box>
      */}
        </Box>
    );
}

export default ResultsSection;
