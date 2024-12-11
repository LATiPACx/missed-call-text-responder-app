// src/pages/Businesses.js

import { useState, useEffect } from 'react';
import { 
 Box, Typography, Paper, Button, Grid, Table, 
 TableBody, TableCell, TableContainer, TableHead, 
 TableRow, Dialog, DialogTitle, DialogContent,
 DialogActions, TextField, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Businesses() {
 const [businesses, setBusinesses] = useState([]);
 const [open, setOpen] = useState(false);
 const [editBusiness, setEditBusiness] = useState(null);
 const [formData, setFormData] = useState({
   name: '',
   phone: '',
   email: '',
   settings: {
     aiResponses: true,
     defaultPrompt: ''
   }
 });

 useEffect(() => {
   fetchBusinesses();
 }, []);

 async function fetchBusinesses() {
   const querySnapshot = await getDocs(collection(db, 'businesses'));
   setBusinesses(querySnapshot.docs.map(doc => ({
     id: doc.id,
     ...doc.data()
   })));
 }

 const handleOpen = (business = null) => {
   if (business) {
     setEditBusiness(business);
     setFormData(business);
   } else {
     setEditBusiness(null);
     setFormData({
       name: '',
       phone: '',
       email: '',
       settings: {
         aiResponses: true,
         defaultPrompt: ''
       }
     });
   }
   setOpen(true);
 };

 const handleClose = () => {
   setOpen(false);
   setEditBusiness(null);
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     if (editBusiness) {
       await updateDoc(doc(db, 'businesses', editBusiness.id), formData);
     } else {
       await addDoc(collection(db, 'businesses'), {
         ...formData,
         createdAt: new Date()
       });
     }
     fetchBusinesses();
     handleClose();
   } catch (error) {
     console.error('Error saving business:', error);
   }
 };

 const handleDelete = async (id) => {
   if (window.confirm('Are you sure you want to delete this business?')) {
     try {
       await deleteDoc(doc(db, 'businesses', id));
       fetchBusinesses();
     } catch (error) {
       console.error('Error deleting business:', error);
     }
   }
 };

 return (
   <Box>
     <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
       <Typography variant="h4">Businesses</Typography>
       <Button 
         variant="contained" 
         startIcon={<AddIcon />}
         onClick={() => handleOpen()}
       >
         Add Business
       </Button>
     </Box>

     <TableContainer component={Paper}>
       <Table>
         <TableHead>
           <TableRow>
             <TableCell>Name</TableCell>
             <TableCell>Phone</TableCell>
             <TableCell>Email</TableCell>
             <TableCell>Actions</TableCell>
           </TableRow>
         </TableHead>
         <TableBody>
           {businesses.map((business) => (
             <TableRow key={business.id}>
               <TableCell>{business.name}</TableCell>
               <TableCell>{business.phone}</TableCell>
               <TableCell>{business.email}</TableCell>
               <TableCell>
                 <IconButton onClick={() => handleOpen(business)}>
                   <EditIcon />
                 </IconButton>
                 <IconButton onClick={() => handleDelete(business.id)}>
                   <DeleteIcon />
                 </IconButton>
               </TableCell>
             </TableRow>
           ))}
         </TableBody>
       </Table>
     </TableContainer>

     <Dialog open={open} onClose={handleClose}>
       <DialogTitle>{editBusiness ? 'Edit Business' : 'Add Business'}</DialogTitle>
       <DialogContent>
         <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
           <TextField
             fullWidth
             label="Business Name"
             margin="normal"
             value={formData.name}
             onChange={(e) => setFormData({...formData, name: e.target.value})}
           />
           <TextField
             fullWidth
             label="Phone"
             margin="normal"
             value={formData.phone}
             onChange={(e) => setFormData({...formData, phone: e.target.value})}
           />
           <TextField
             fullWidth
             label="Email"
             margin="normal"
             value={formData.email}
             onChange={(e) => setFormData({...formData, email: e.target.value})}
           />
           <TextField
             fullWidth
             label="Default Response"
             margin="normal"
             multiline
             rows={4}
             value={formData.settings?.defaultPrompt || ''}
             onChange={(e) => setFormData({
               ...formData, 
               settings: {
                 ...formData.settings,
                 defaultPrompt: e.target.value
               }
             })}
           />
         </Box>
       </DialogContent>
       <DialogActions>
         <Button onClick={handleClose}>Cancel</Button>
         <Button onClick={handleSubmit} variant="contained">
           {editBusiness ? 'Update' : 'Add'}
         </Button>
       </DialogActions>
     </Dialog>
   </Box>
 );
}