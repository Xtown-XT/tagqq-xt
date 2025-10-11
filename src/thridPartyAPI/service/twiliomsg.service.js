// // File: src/thirdPartyAPI/service/twiliomsg.service.js
// import twilio from 'twilio';
// import apiKeyService from './apiKey.service.js';

// class TwiliomsgService {
//     constructor() {
//         this.twilioClient = null;
//         this.twilioPhoneNumber = null;
//     }

//     async init() {
//         const data = await apiKeyService.getAPUIkeyByName("twillo");
//         if (!data) throw new Error("Twilio keys not found");

//         const twilioKey = data.get({ plain: true });
//         const { sid, auth_token, phone_number } = twilioKey.keys;

//         this.twilioClient = twilio(sid, auth_token);
//         this.twilioPhoneNumber = phone_number;

//         if (!this.twilioPhoneNumber) {
//             throw new Error("Twilio phone number is missing in API key config");
//         }
//     }

//     async sendWhatsAppMessage(toNumber, message) {
//         if (!this.twilioClient || !this.twilioPhoneNumber) {
//             throw new Error('Twilio client not initialized. Call init() first.');
//         }

//         if (!toNumber || !message) {
//             throw new Error('Recipient number and message are required');
//         }

//         const formattedTo = `whatsapp:${toNumber}`;

//         try {
//             const response = await this.twilioClient.messages.create({
//                 from: this.twilioPhoneNumber,
//                 to: +919677445120,
//                 body: message,
//             });

//             return {
//                 success: true,
//                 sid: response.sid,
//                 status: response.status,
//             };
//         } catch (error) {
//             console.error('WhatsApp message send error:', error);
//             throw new Error(`Failed to send WhatsApp message: ${error.message}`);
//         }
//     }
// }

// const twilioService = new TwilioService();
// // Initialize Twilio service
// (async () => {
//     try {
//         await twilioService.init();
//         console.log("Twilio service initialized successfully");
//     } catch (err) {
//         console.error("Error initializing Twilio service:", err.message);
//     }
// })();


// export default TwiliomsgService;



// // Only for test/demo purposes
// (async () => {
//     try {
//         await twiliomsgService.init();
//         console.log("Twilio initialized");

//         const result = await twiliomsgService.sendWhatsAppMessage(
//             '+919677445120',
//             'Hello from test script!'
//         );

//         console.log('Message sent:', result);
//     } catch (err) {
//         console.error('Error:', err.message);
//     }
// })();


// File: src/thirdPartyAPI/service/twiliomsg.service.js

// import twilio from 'twilio';
// import apiKeyService from './apiKey.service.js';

// class TwiliomsgService {
//     constructor() {
//         this.twilioClient = null;
//         this.fromWhatsAppNumber = null;
//     }

//     async init() {
//     const data = await apiKeyService.getAPUIkeyByName("twillo");
//     if (!data) throw new Error("Twilio keys not found");

//     const twilioKey = data.get({ plain: true });
//     const { sid, auth_token, phone_number, dphone } = twilioKey.keys;

//     if (!sid || !auth_token || !phone_number) {
//         throw new Error("Twilio credentials are incomplete");
//     }

//     this.twilioClient = twilio(sid, auth_token);

//     // Use dynamic number
//     this.twilioPhoneNumber = dphone;

//     this.fromWhatsAppNumber = `whatsapp:${phone_number}`;
// }

//     async createCall({ location, hospital }) {
//         if (!this.twilioClient || !this.twilioPhoneNumber) {
//             throw new Error("Twilio client not initialized");
//         }

//         const tamilMessage = `Avasaram! Oru vipathu ${location} pagudiyil nadandhathu. Noyyali ${hospital} maruthuvamanaiyil anumathikkappattullaar.`;
//         const englishMessage = `Emergency! An accident has occurred at ${location}. The patient has been admitted to ${hospital}.`;

//         const twiml = new twilio.twiml.VoiceResponse();
//         twiml.say({ voice: 'Aditi', language: 'ta-IN' }, tamilMessage);
//         twiml.pause({ length: 1 });
//         twiml.say({ voice: 'Polly.Matthew', language: 'en-US' }, englishMessage);

//         const call = await this.twilioClient.calls.create({
//             from: this.twilioPhoneNumber,
//             to: "+916369486726", // You can make this dynamic too
//             twiml: twiml.toString()
//         });

//         console.log("Call SID:", call.sid);
//     }

//     async relayCall({ emergencyContact, victimPhone }) {
//         if (!this.twilioClient || !this.twilioPhoneNumber) {
//             throw new Error("Twilio client not initialized");
//         }

//         const twiml = new twilio.twiml.VoiceResponse();
//         const dial = twiml.dial({ callerId: this.twilioPhoneNumber, record: true });
//         console.log(this.twilioPhoneNumber)
//         dial.number(victimPhone);

//         const call = await this.twilioClient.calls.create({
//             from: this.twilioPhoneNumber,
//             to: emergencyContact,
//             twiml: twiml.toString(),
//         });

//         console.log("Relay call SID:", call.sid);
//     }
//     async sendMessage(to, message) {
//         if (!this.twilioClient || !this.twilioPhoneNumber) {
//             throw new Error("Twilio client not initialized");
//         }

//         if (!to || !message) {
//             throw new Error("Missing recipient number or message");
//         }

//         try {
//             const result = await this.twilioClient.messages.create({
//                 body: message,
//                 from: this.twilioPhoneNumber,
//                 to,
//             });
//             return { success: true, sid: result.sid };
//         } catch (err) {
//             console.error("Failed to send SMS:", err.message);
//             return { success: false, error: err.message };
//         }
//     }

//     async sendWhatsAppMessage(toNumber, message) {
//         if (!this.twilioClient || !this.fromWhatsAppNumber) {
//             throw new Error('Twilio client not initialized. Call init() first.');
//         }

//         if (!toNumber || !message) {
//             throw new Error('Recipient number and message are required');
//         }

//         if (!/^\+\d{10,15}$/.test(toNumber)) {
//             throw new Error('Invalid phone number format');
//         }

//         const formattedTo = `whatsapp:${toNumber}`;

//         try {
//             console.log(this.fromWhatsAppNumber)
//             const response = await this.twilioClient.messages.create({
//                 from: this.fromWhatsAppNumber,
//                 to: formattedTo,
//                 body: message,
//             });

//             return {
//                 success: true,
//                 sid: response.sid,
//                 status: response.status,
//             };
//         } catch (error) {
//             console.error('❌ WhatsApp message send error:', error);
//             throw new Error(`Failed to send WhatsApp message: ${error.message}`);
//         }
//     }
// }

// // Create instance
// const twiliomsgService = new TwiliomsgService();

// twiliomsgService.init()
//     .then(() => console.log("✅ Twilio service initialized"))
//     .catch((err) => console.error("❌ Initialization failed:", err.message));

// export default twiliomsgService;

// // Optional: Init immediately (for background/test purposes)
// // (async () => {
// //     try {
// //         await twiliomsgService.init();
// //         console.log("Twilio service initialized successfully");

// //         // Test message
// //         const result = await twiliomsgService.sendWhatsAppMessage(
// //             '+916369486726',
// //             'Hello Punda paya!'
// //         );
// //         console.log('Message sent:', result);
// //     } catch (err) {
// //         console.error("Error:", err.message);
// //     }
// // })();


// // (async () => {
// //     try {
// //         await twiliomsgService.init();
// //         console.log("✅ Twilio service initialized");

// //         const toNumber = '+918608703560'; // Replace with a valid number in E.164 format
// //         const message = 'Hello from Twilio test via WhatsApp!';

// //         const result = await twiliomsgService.sendWhatsAppMessage(toNumber, message);
// //         console.log('✅ Message sent:', result);

// //     } catch (error) {
// //         console.error('❌ Error:', error.message);
// //     }
// // })();

// // export default twiliomsgService;


 import twilio from 'twilio';
import apiKeyService from './apiKey.service.js';

class TwilioService {
    constructor() {
        this.twilioClient = null;
        this.twilioPhoneNumber = null;
        this.fromWhatsAppNumber = null;
    }

    async init() {
        const data = await apiKeyService.getAPUIkeyByName("twillo");
        if (!data) throw new Error("Twilio keys not found");

        const twilioKey = data.get({ plain: true });
        const { sid, auth_token, phone_number, dphone } = twilioKey.keys;
        console.log(phone_number)
        console.log(dphone)
        this.twilioClient = twilio(sid, auth_token);
        this.twilioPhoneNumber = dphone;
        this.fromWhatsAppNumber = phone_number

        if (!this.twilioPhoneNumber) {
            throw new Error("Twilio phone number is missing in API key config");
        }
    }

    async createCall({ location, hospital }) {
        if (!this.twilioClient || !this.twilioPhoneNumber) {
            throw new Error("Twilio client not initialized");
        }

        const tamilMessage = `Avasaram! Oru vipathu ${location} pagudiyil nadandhathu. Noyyali ${hospital} maruthuvamanaiyil anumathikkappattullaar.`;
        const englishMessage = `Emergency! An accident has occurred at ${location}. The patient has been admitted to ${hospital}`;

        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say({ voice: 'Aditi', language: 'ta-IN' }, tamilMessage);
        twiml.pause({ length: 1 });
        twiml.say({ voice: 'Polly.Matthew', language: 'en-US' }, englishMessage);

        const call = await this.twilioClient.calls.create({
            from: this.twilioPhoneNumber,
            to: "+916369486726", // You can make this dynamic too
            twiml: twiml.toString()
        });

        console.log("Call SID:", call.sid);
    }

    async relayCall({ emergencyContact, victimPhone }) {
        if (!this.twilioClient || !this.twilioPhoneNumber) {
            throw new Error("Twilio client not initialized");
        }

        const twiml = new twilio.twiml.VoiceResponse();
        const dial = twiml.dial({ callerId: this.twilioPhoneNumber, record: true });
        dial.number(victimPhone);

        const call = await this.twilioClient.calls.create({
            from: this.twilioPhoneNumber,
            to: emergencyContact,
            twiml: twiml.toString(),
        });

        console.log("Relay call SID:", call.sid);
    }
    async sendMessage(to, message) {
        if (!this.twilioClient || !this.twilioPhoneNumber) {
            throw new Error("Twilio client not initialized");
        }

        if (!to || !message) {
            throw new Error("Missing recipient number or message");
        }

        try {
            const result = await this.twilioClient.messages.create({
                body: message,
                from: this.twilioPhoneNumber,
                to,
            });
            return { success: true, sid: result.sid };
        } catch (err) {
            console.error("Failed to send SMS:", err.message);
            return { success: false, error: err.message };
        }
    }
     async sendWhatsAppMessage(toNumber, message) {
        if (!this.twilioClient || !this.fromWhatsAppNumber) {
            throw new Error('Twilio client not initialized. Call init() first.');
        }
        console.log(this.fromWhatsAppNumber)
        if (!toNumber || !message) {
            throw new Error('Recipient number and message are required');
        }

        if (!/^\+\d{10,15}$/.test(toNumber)) {
            throw new Error('Invalid phone number format');
        }

        const formattedTo = `whatsapp:${toNumber}`;

        try {
            console.log(this.fromWhatsAppNumber)
            const response = await this.twilioClient.messages.create({
                from: this.fromWhatsAppNumber,
                to: formattedTo,
                body: message,
            });

            return {
                success: true,
                sid: response.sid,
                status: response.status,
            };
        } catch (error) {
            console.error('❌ WhatsApp message send error:', error);
            throw new Error(`Failed to send WhatsApp message: ${error.message}`);
        }
    }
}

const twilioService = new TwilioService();
// Initialize Twilio service
(async () => {
    try {
        await twilioService.init();
        console.log("Twilio service initialized successfully");
    } catch (err) {
        console.error("Error initializing Twilio service:", err.message);
    }
})();

export default twilioService;


(async ()=> {
    try{
        await twilioService.init()
        const res = await twilioService.relayCall({
      emergencyContact: "+918608703560",
      victimPhone: "+916369486726",
    })
        console.log(res)
        return res
    }
    catch (error){
        console.log(error)
    }
})();