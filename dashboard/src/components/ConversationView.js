// src/components/ConversationView.js
import { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function ConversationView({ businessId, phoneNumber }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (businessId && phoneNumber) {
      fetchMessages();
    }
  }, [businessId, phoneNumber]);

  async function fetchMessages() {
    const q = query(
      collection(db, 'smsMessages'),
      where('businessId', '==', businessId),
      where('phoneNumber', '==', phoneNumber),
      orderBy('timestamp', 'asc')
    );
    
    const snapshot = await getDocs(q);
    setMessages(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));
  }

  return (
    <Box sx={{ p: 2 }}>
      {messages.length > 0 ? (
        messages.map((msg) => (
          <Paper 
            key={msg.id} 
            sx={{ 
              p: 2, 
              mb: 2,
              ml: msg.sender === 'ai' ? 0 : 'auto',
              mr: msg.sender === 'ai' ? 'auto' : 0,
              maxWidth: '80%',
              backgroundColor: msg.sender === 'ai' ? '#e3f2fd' : '#f5f5f5'
            }}
          >
            <Typography variant="caption" display="block" gutterBottom>
              {new Date(msg.timestamp).toLocaleString()}
            </Typography>
            <Typography>{msg.message}</Typography>
          </Paper>
        ))
      ) : (
        <Typography color="textSecondary" align="center">
          No messages in this conversation yet
        </Typography>
      )}
    </Box>
  );
}