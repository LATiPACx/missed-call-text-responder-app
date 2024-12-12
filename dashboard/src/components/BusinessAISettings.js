import React, { useState, useEffect } from 'react';
import songSecureData from '../songsecure_data.json';

export default function BusinessAISettings({ businessName }) {
 const [info, setInfo] = useState('');
 
 useEffect(() => {
   if (businessName === 'SongSecure') {
     setInfo(JSON.stringify(songSecureData, null, 2));
   }
 }, [businessName]);

 const containerStyle = {
   display: 'flex',
   flexDirection: 'column',
   height: 'calc(100vh - 200px)',
   padding: '24px'
 };

 const textareaStyle = {
   width: '100%',
   flex: 1,
   padding: '16px',
   marginBottom: '16px',
   border: '1px solid #ccc',
   borderRadius: '4px',
   resize: 'none'
 };

 const buttonStyle = {
   alignSelf: 'flex-end',
   padding: '8px 16px',
   backgroundColor: '#1976d2',
   color: 'white',
   border: 'none',
   borderRadius: '4px',
   cursor: 'pointer'
 };

 return (
   <div style={containerStyle}>
     <textarea
       style={textareaStyle}
       value={info}
       onChange={(e) => setInfo(e.target.value)}
       placeholder="Enter all business information here..."
     />
     <button 
       style={buttonStyle}
       onClick={() => console.log('Save clicked:', info)}
     >
       Save Changes
     </button>
   </div>
 );
}