// functions/src/businessHelpers.js
const admin = require('firebase-admin');

async function getBusinessByPhone(phoneNumber) {
 const businessesRef = admin.firestore().collection('businesses');
 const snapshot = await businessesRef.where('phone', '==', phoneNumber).get();
 return snapshot.empty ? null : snapshot.docs[0].data();
}

async function associateCallWithBusiness(callId, businessId) {
 await admin.firestore().collection('missedCalls').doc(callId).update({
   businessId: businessId
 });
}

module.exports = {
 getBusinessByPhone,
 associateCallWithBusiness
};