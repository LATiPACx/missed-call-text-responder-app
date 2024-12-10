import { Box, Typography, Paper, Grid, Switch, FormControlLabel, TextField } from '@mui/material';

export default function Settings() {
 return (
   <Box>
     <Typography variant="h4" gutterBottom>Settings</Typography>

     <Grid container spacing={3}>
       <Grid item xs={12} md={6}>
         <Paper sx={{ p: 3 }}>
           <Typography variant="h6" gutterBottom>
             AI Response Settings
           </Typography>
           <FormControlLabel
             control={<Switch defaultChecked />}
             label="Enable AI Responses"
           />
           <TextField
             fullWidth
             multiline
             rows={4}
             margin="normal"
             label="Default Response Template"
             defaultValue="Thanks for calling! How can we help you today?"
           />
         </Paper>
       </Grid>

       <Grid item xs={12} md={6}>
         <Paper sx={{ p: 3 }}>
           <Typography variant="h6" gutterBottom>
             Notification Settings
           </Typography>
           <FormControlLabel
             control={<Switch defaultChecked />}
             label="Email Notifications"
           />
           <FormControlLabel
             control={<Switch defaultChecked />}
             label="SMS Notifications"
           />
         </Paper>
       </Grid>
     </Grid>
   </Box>
 );
}