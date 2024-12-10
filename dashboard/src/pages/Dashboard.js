import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function Dashboard() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom component="div">
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Total Missed Calls
            </Typography>
            <Typography variant="h3">
              0
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Messages Sent
            </Typography>
            <Typography variant="h3">
              0
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Active Businesses
            </Typography>
            <Typography variant="h3">
              0
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Response Rate
            </Typography>
            <Typography variant="h3">
              0%
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body1">
              No recent activity to display
            </Typography>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
