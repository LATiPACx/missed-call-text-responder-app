import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function CallLogs() {
 const calls = []; // Will be populated from Firebase

 return (
   <Box>
     <Typography variant="h4" gutterBottom>
       Call Logs
     </Typography>

     <TableContainer component={Paper}>
       <Table>
         <TableHead>
           <TableRow>
             <TableCell>Date/Time</TableCell>
             <TableCell>Phone Number</TableCell>
             <TableCell>Business</TableCell>
             <TableCell>Status</TableCell>
             <TableCell>Response</TableCell>
           </TableRow>
         </TableHead>
         <TableBody>
           {calls.length > 0 ? (
             calls.map((call) => (
               <TableRow key={call.id}>
                 <TableCell>{call.timestamp}</TableCell>
                 <TableCell>{call.phoneNumber}</TableCell>
                 <TableCell>{call.business}</TableCell>
                 <TableCell>{call.status}</TableCell>
                 <TableCell>{call.response}</TableCell>
               </TableRow>
             ))
           ) : (
             <TableRow>
               <TableCell colSpan={5} align="center">
                 No calls logged yet
               </TableCell>
             </TableRow>
           )}
         </TableBody>
       </Table>
     </TableContainer>
   </Box>
 );
}