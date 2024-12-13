import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import songSecureData from '../songsecure_data.json';

function sortedStringify(obj) {
 if (typeof obj !== 'object' || obj === null) {
   return JSON.stringify(obj, null, 2);
 }
 
 const sortedObj = {};
 Object.keys(obj).sort().forEach(key => {
   sortedObj[key] = typeof obj[key] === 'object' ? sortedStringify(obj[key]) : obj[key];
 });
 return JSON.stringify(sortedObj, null, 2);
}

export default function BusinessAISettings({ businessName, businessId }) {
 const [info, setInfo] = useState('');
 
 useEffect(() => {
   loadBusinessInfo();
 }, [businessId]);

 async function loadBusinessInfo() {
   if (businessId) {
     try {
       const docRef = doc(db, 'businessInfo', businessId);
       const docSnap = await getDoc(docRef);
       
       if (docSnap.exists()) {
         setInfo(sortedStringify(docSnap.data().businessData));
       } else {
         // Initialize with default data for SongSecure
         if (businessName === 'SongSecure') {
           setInfo(sortedStringify(songSecureData));
         }
       }
     } catch (error) {
       console.error('Error loading business info:', error);
     }
   }
 }

 async function saveBusinessInfo() {
   if (businessId) {
     try {
       const docRef = doc(db, 'businessInfo', businessId);
       await setDoc(docRef, {
         businessData: JSON.parse(info),
         lastUpdated: new Date()
       });
       console.log('Business info saved successfully');
     } catch (error) {
       console.error('Error saving business info:', error);
     }
   }
 }

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
       onClick={saveBusinessInfo}
     >
       Save Changes
     </button>
   </div>
 );
}