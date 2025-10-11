import { TwilioCall } from '../models/index.js';
import { ValidationError, DatabaseError } from 'sequelize';

class TwilioCallService {
  async createEmergencyCall({ call_sid, name, location, hospital, status, error_message = null, photo = null }) {
    try {
      return await TwilioCall.create({
        call_sid,
        name,
        photo,
        type: 'emergency',
        location,
        hospital,
        status,
        error_message,
      });
    } catch (err) {
      this.handleError(err);
    }
  }

  async createRelayCall({ call_sid, name, emergency_contact, victim_phone, status, error_message = null, photo = null }) {
    try {
      return await TwilioCall.create({
        call_sid,
        name,
        photo,
        type: 'relay',
        emergency_contact,
        victim_phone,
        status,
        error_message,
      });
    } catch (err) {
      this.handleError(err);
    }
  }

  async getAllCalls() {
    try {
      return await TwilioCall.findAll({ order: [['createdAt', 'DESC']] });
    } catch (err) {
      this.handleError(err);
    }
  }

  async getCallById(id) {
    try {
      const call = await TwilioCall.findByPk(id);
      if (!call) {
        throw new Error(`TwilioCall with ID ${id} not found`);
      }
      return call;
    } catch (err) {
      this.handleError(err);
    }
  }

  async deleteCallById(id) {
    try {
      const call = await this.getCallById(id);
      await call.destroy();
      return { message: 'Call deleted successfully' };
    } catch (err) {
      this.handleError(err);
    }
  }

  handleError(err) {
    if (err instanceof ValidationError) {
      throw new Error('Validation failed: ' + err.errors.map(e => e.message).join(', '));
    } else if (err instanceof DatabaseError) {
      throw new Error('Database error: ' + err.message);
    } else {
      throw new Error(err.message || 'Unknown error occurred');
    }
  }
}

const twilioCallService = new TwilioCallService();
export default twilioCallService;



// (async () => {
//   try {
//     console.log('\n🧪 Running TwilioCallService tests...\n');

//     // Dummy data for testing
//     const dummyName = 'Test User';
//     const dummyPhoto = null; // Or Buffer.from('...') if testing blob
//     const emergencyLocation = 'Coimbatore';
//     const emergencyHospital = 'Ganga Hospital';
//     const emergencyStatus = 'completed';

//     const relayContact = '+919999999999';
//     const relayVictim = '+918888888888';
//     const relayStatus = 'ringing';

//     // 1️⃣ Create Emergency Call
//     const emergency = await twilioCallService.createEmergencyCall({
//       call_sid: 'TEST-EMERGENCY-SID-001',
//       name: dummyName,
//       photo: dummyPhoto,
//       location: emergencyLocation,
//       hospital: emergencyHospital,
//       status: emergencyStatus,
//     });
//     console.log('✅ Emergency call created:', emergency.id);

//     // 2️⃣ Create Relay Call
//     const relay = await twilioCallService.createRelayCall({
//       call_sid: 'TEST-RELAY-SID-002',
//       name: dummyName,
//       photo: dummyPhoto,
//       emergency_contact: relayContact,
//       victim_phone: relayVictim,
//       status: relayStatus,
//     });
//     console.log('✅ Relay call created:', relay.id);

//     // 3️⃣ Get All Calls
//     const allCalls = await twilioCallService.getAllCalls();
//     console.log(`📄 Total calls in DB: ${allCalls.length}`);
//     allCalls.forEach(call => {
//       console.log(`   - [${call.type}] ${call.name} (${call.status})`);
//     });

//     // 4️⃣ Get Specific Call by ID
//     const foundCall = await twilioCallService.getCallById(emergency.id);
//     console.log('🔍 Retrieved by ID:', foundCall.dataValues);

//     // 5️⃣ Delete Relay Call
//     const deletedRelay = await twilioCallService.deleteCallById(relay.id);
//     console.log('🗑️ Relay call deleted:', deletedRelay.message);

//     // 6️⃣ Final Count
//     const afterDelete = await twilioCallService.getAllCalls();
//     console.log(`📉 Remaining calls after deletion: ${afterDelete.length}`);

//     console.log('\n✅ All service tests passed successfully.\n');
//   } catch (err) {
//     console.error('❌ Test failed:', err.message);
//   }
// })();

