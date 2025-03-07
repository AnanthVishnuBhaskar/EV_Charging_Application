// src/components/TopNavBar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';

function TopNavBar() {
    return (
        <AppBar position="static" sx={{ backgroundColor: '#fff', color: '#1a1a1a', boxShadow: 0, borderBottom: '1px solid #e0e0e0' }}>
            <Toolbar variant="dense">
                {/* Brand or quick nav links */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 2 }}>
                    ChargeSpot
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button sx={{ textTransform: 'none', color: '#1a1a1a' }}>Explore</Button>
                <Button sx={{ textTransform: 'none', color: '#1a1a1a' }}>Flights</Button>
                <Button sx={{ textTransform: 'none', color: '#1a1a1a' }}>Hotels</Button>
                <Button sx={{ textTransform: 'none', color: '#1a1a1a' }}>Rentals</Button>
            </Toolbar>
        </AppBar>
    );
}

export default TopNavBar;
