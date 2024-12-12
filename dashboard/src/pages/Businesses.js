import { useState, useEffect } from 'react';
import { 
Box, Typography, Paper, Button, Grid, Table, 
TableBody, TableCell, TableContainer, TableHead, 
TableRow, Dialog, DialogTitle, DialogContent,
DialogActions, TextField, IconButton, Tabs, Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import ConversationView from '../components/ConversationView';
import BusinessAISettings from '../components/BusinessAISettings';

function TabPanel({ children, value, index }) {
return (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);
}

export default function Businesses() {
const [businesses, setBusinesses] = useState([]);
const [selectedBusiness, setSelectedBusiness] = useState(null);
const [tabValue, setTabValue] = useState(0);
const [conversations, setConversations] = useState([]);
const [formOpen, setFormOpen] = useState(false);
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

useEffect(() => {
  if (selectedBusiness) {
    fetchConversations(selectedBusiness.id);
  }
}, [selectedBusiness]);

async function fetchBusinesses() {
  const querySnapshot = await getDocs(collection(db, 'businesses'));
  setBusinesses(querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })));
}

async function fetchConversations(businessId) {
  const q = query(
    collection(db, 'smsMessages'),
    where('businessId', '==', businessId)
  );
  const snapshot = await getDocs(q);
  const phoneNumbers = [...new Set(snapshot.docs.map(doc => doc.data().phoneNumber))];
  setConversations(phoneNumbers);
}

const handleBusinessClick = (business) => {
  setSelectedBusiness(business);
  setTabValue(0);
};

const handleFormOpen = (business = null) => {
  if (business) {
    setFormData(business);
  } else {
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
  setFormOpen(true);
};

const handleFormClose = () => {
  setFormOpen(false);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (formData.id) {
      await updateDoc(doc(db, 'businesses', formData.id), formData);
    } else {
      await addDoc(collection(db, 'businesses'), {
        ...formData,
        createdAt: new Date()
      });
    }
    fetchBusinesses();
    handleFormClose();
  } catch (error) {
    console.error('Error saving business:', error);
  }
};

const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this business?')) {
    try {
      await deleteDoc(doc(db, 'businesses', id));
      fetchBusinesses();
      if (selectedBusiness?.id === id) {
        setSelectedBusiness(null);
      }
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
        onClick={() => handleFormOpen()}
      >
        Add Business
      </Button>
    </Box>

    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {businesses.map((business) => (
                <TableRow 
                  key={business.id}
                  onClick={() => handleBusinessClick(business)}
                  sx={{ 
                    cursor: 'pointer',
                    backgroundColor: selectedBusiness?.id === business.id ? '#f5f5f5' : 'inherit',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <TableCell>{business.name}</TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => {
                      e.stopPropagation();
                      handleFormOpen(business);
                    }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(business.id);
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      <Grid item xs={12} md={8}>
        {selectedBusiness ? (
          <Paper>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Details" />
                <Tab label="Business Info" />
                <Tab label="Conversations" />
                <Tab label="Call Logs" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>{selectedBusiness.name}</Typography>
              <Typography>Phone: {selectedBusiness.phone}</Typography>
              <Typography>Email: {selectedBusiness.email}</Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <BusinessAISettings />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>SMS Conversations</Typography>
              {conversations.length > 0 ? (
                conversations.map((phoneNumber) => (
                  <Button
                    key={phoneNumber}
                    variant="outlined"
                    sx={{ display: 'block', mb: 2, width: '100%', textAlign: 'left' }}
                    onClick={() => setSelectedBusiness({ ...selectedBusiness, selectedPhone: phoneNumber })}
                  >
                    {phoneNumber}
                  </Button>
                ))
              ) : (
                <Typography color="textSecondary">No conversations yet</Typography>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>Call History</Typography>
              <Typography color="textSecondary">Call logs feature coming soon</Typography>
            </TabPanel>
          </Paper>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography color="textSecondary">
              Select a business to view details
            </Typography>
          </Paper>
        )}
      </Grid>
    </Grid>

    <Dialog open={formOpen} onClose={handleFormClose} maxWidth="sm" fullWidth>
      <DialogTitle>{formData.id ? 'Edit Business' : 'Add Business'}</DialogTitle>
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
        <Button onClick={handleFormClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {formData.id ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>

    {selectedBusiness?.selectedPhone && (
      <Dialog 
        open={true} 
        onClose={() => setSelectedBusiness({ ...selectedBusiness, selectedPhone: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Conversation with {selectedBusiness.selectedPhone}</DialogTitle>
        <DialogContent>
          <ConversationView
            businessId={selectedBusiness.id}
            phoneNumber={selectedBusiness.selectedPhone}
          />
        </DialogContent>
      </Dialog>
    )}
  </Box>
);
}