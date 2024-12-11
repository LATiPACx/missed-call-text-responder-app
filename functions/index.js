const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');
const twilio = require('twilio');

admin.initializeApp();

const openai = new OpenAI({
 apiKey: "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"
});

const accountSid = "AC0998c199cfae9324ff1494228d111532";
const authToken = "da7356e28e1fd035583dbb8b9e7ba739";
const twilioClient = twilio(accountSid, authToken);

const businessData = require('./songsecure_data.json');

async function getBusinessId() {
 const businessesRef = admin.firestore().collection('businesses');
 const snapshot = await businessesRef.where('phone', '==', '+15129655650').get();
 if (!snapshot.empty) {
   return snapshot.docs[0].id;
 }
 return null;
}

exports.handleMissedCall = functions.https.onRequest(async (req, res) => {
 console.log('DEBUG: Incoming payload:', JSON.stringify(req.body, null, 2));

 try {
   const { MessageSid, From, Body, Digits } = req.body;

   if (!From) {
     throw new Error('Invalid request: Missing "From" phone number.');
   }

   if (Digits === '1') {
     console.log(`DEBUG: Received keypress 1 from ${From}`);
     
     res.type('text/xml');
     res.send(`<?xml version="1.0" encoding="UTF-8"?>
       <Response>
         <Say voice="alice">Thanks, you will receive a text message from us within a couple minutes.</Say>
         <Hangup/>
       </Response>`);

     try {
       handleMissedCallWithConsent(From).catch(error => {
         console.error('Error in async missed call handling:', error);
       });
     } catch (error) {
       console.error('Error initiating missed call handling:', error);
     }
     return;
   }

   if (MessageSid && Body) {
     console.log(`DEBUG: Received SMS from ${From}: ${Body}`);
     await handleIncomingSmsEvent(From, Body, MessageSid);
   } else {
     console.log(`DEBUG: Received event, but no message body detected.`);
   }

   res.status(200).json({ status: 'success' });
 } catch (error) {
   console.error('Error processing request:', error);
   if (req.body.CallSid) {
     res.type('text/xml');
     res.send(`<?xml version="1.0" encoding="UTF-8"?>
       <Response>
         <Say voice="alice">Thanks, you will receive a text message from us within a couple minutes.</Say>
         <Hangup/>
       </Response>`);
   } else {
     res.status(500).json({ error: error.message });
   }
 }
});

async function handleMissedCallWithConsent(phoneNumber) {
 try {
   const callId = `${phoneNumber}-${Date.now()}`;
   const processedRef = admin.firestore().collection('processedCalls').doc(callId);
   const processedDoc = await processedRef.get();

   if (processedDoc.exists) {
     console.log(`DEBUG: Call ${callId} already processed, skipping`);
     return;
   }

   await processedRef.set({
     phoneNumber,
     timestamp: admin.firestore.FieldValue.serverTimestamp(),
     processed: true
   });

   const businessId = await getBusinessId();
   const message = await generateAiResponse(phoneNumber, 'MISSED_CALL');
   
   await admin.firestore().collection('missedCalls').add({
     phoneNumber,
     callId,
     businessId,
     timestamp: admin.firestore.FieldValue.serverTimestamp(),
     response: message,
     consent: true
   });

   // Store initial AI message
   await admin.firestore().collection('smsMessages').add({
     phoneNumber,
     message: message,
     messageId: `ai-${Date.now()}`,
     businessId,
     sender: 'ai',
     timestamp: new Date().toISOString(),
     createdAt: admin.firestore.FieldValue.serverTimestamp()
   });

   await twilioClient.messages.create({
     body: message,
     to: phoneNumber,
     from: "+15125153550"
   });

   console.log(`DEBUG: Response sent successfully to ${phoneNumber}`);
 } catch (error) {
   console.error('Error handling missed call with consent:', error);
   throw error;
 }
}

async function handleIncomingSmsEvent(phoneNumber, userMessage, messageId) {
 try {
   const processedRef = admin.firestore().collection('processedMessages').doc(messageId);
   const processedDoc = await processedRef.get();

   if (processedDoc.exists) {
     console.log(`DEBUG: Message ${messageId} already processed, skipping`);
     return;
   }

   await processedRef.set({
     phoneNumber,
     timestamp: admin.firestore.FieldValue.serverTimestamp(),
     processed: true
   });

   const businessId = await getBusinessId();

   // Store user message
   await admin.firestore().collection('smsMessages').add({
     phoneNumber,
     message: userMessage,
     messageId,
     businessId,
     sender: 'user',
     timestamp: new Date().toISOString(),
     createdAt: admin.firestore.FieldValue.serverTimestamp()
   });

   const aiResponse = await generateAiResponse(phoneNumber, userMessage);
   
   // Store AI response
   await admin.firestore().collection('smsMessages').add({
     phoneNumber,
     message: aiResponse,
     messageId: `ai-${Date.now()}`,
     businessId,
     sender: 'ai',
     timestamp: new Date().toISOString(),
     createdAt: admin.firestore.FieldValue.serverTimestamp()
   });

   const charCount = aiResponse.length;
   const baseTypingTime = (charCount / 200) * 60 * 1000;
   const thinkingTime = Math.random() * 2000 + 1000;
   const variability = (Math.random() * 0.4 + 0.8);
   const totalDelay = Math.floor(thinkingTime + (baseTypingTime * variability));
   const maxDelay = 20000;
   const delay = Math.min(totalDelay, maxDelay);

   console.log(`DEBUG: Message length ${charCount}, waiting ${delay}ms before sending`);
   await new Promise(resolve => setTimeout(resolve, delay));

   await twilioClient.messages.create({
     body: aiResponse,
     to: phoneNumber,
     from: "+15125153550"
   });

   console.log(`DEBUG: AI response sent successfully to ${phoneNumber}`);
 } catch (error) {
   console.error('Error handling incoming SMS:', error);
 }
}

async function generateAiResponse(phoneNumber, userMessage) {
 if (userMessage === 'MISSED_CALL') {
   return "Hey, sorry we missed your call here at SongSecure. How can I help you?";
 }

 const systemPrompt = `You are a helpful assistant for SongSecure. Your communication style should be:
- Direct and natural - avoid repetitive sales language
- Honest and transparent
- Focus on answering the actual question asked
- Vary your responses and language
- If someone asks if you're a bot, be honest but focus on how you can help
Use this business information only when relevant: ${JSON.stringify(businessData)}`;

 const userPrompt = `Respond naturally to: "${userMessage}"
- Address the actual question or concern raised
- Don't repeat previous points
- Be direct and honest
- Keep responses concise
- If they're skeptical, acknowledge it and focus on being helpful`;

 const completion = await openai.chat.completions.create({
   model: "gpt-4o",
   messages: [
     { role: "system", content: systemPrompt },
     { role: "user", content: userPrompt }
   ],
   max_tokens: 800,
   temperature: 0.7
 });

 return completion.choices[0].message.content;
}