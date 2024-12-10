import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function Businesses() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Businesses</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Business
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Registered Businesses
            </Typography>
            {/* Business list will go here */}
            <Typography variant="body1" color="text.secondary">
              No businesses registered yet
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}