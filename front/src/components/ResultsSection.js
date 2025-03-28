// src/components/ResultsSection.jsx
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import { Box, Button, Card, CardActions, CardContent, Chip, Grid, Typography } from '@mui/material';
import React from 'react';

function ResultsSection({ stations }) {
    // If you need a dialog or additional state, manage it here

    return (
        <Box>
            {/* Top header for results count */}
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
                    label={`Results: ${stations.length}`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                />
            </Box>

            <Grid container spacing={2}>
                {stations.map((station) => {
                    // Calculate distance from currentLocation if needed
                    // ...
                    return (
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
                                        {/* Distance, type, or other info */}
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
                    );
                })}
            </Grid>
        </Box>
    );
}

export default ResultsSection;
