import twilio from 'twilio';
import apiKeyService from './apiKey.service.js';
import Tellocall from '../models/callLogs.js'
import axios from 'axios';

class TwilioService {
    constructor() {
        this.twilioClient = null;
        this.twilioPhoneNumber = null;
        this.fromWhatsAppNumber = null;
        this._loaded = false;
    }
    async _loadCredentials() {
        if (this._loaded) return;

        const record = await apiKeyService.getAPUIkeyByName("metawhatapp");
        if (!record) {
            throw new Error("API key record with name='whatapp' not found");
        }

        const { GRAPH_API_BASE, token, phoneNumberId } = record.keys;
        console.log("keys: ", record.keys)
        if (!GRAPH_API_BASE || !token || !phoneNumberId) {
            throw new Error("Incomplete WhatsApp credentials in your api_keys table");
        }

        this.baseUrl = GRAPH_API_BASE;
        this.accessToken = token;
        this.phoneNumberId = phoneNumberId;
        this._loaded = true;
    }

    async init() {
        const data = await apiKeyService.getAPUIkeyByName("twillo");
        if (!data) throw new Error("Twilio keys not found");

        const twilioKey = data.get({ plain: true });
        const { sid, auth_token, phone_number, dphone } = twilioKey.keys;

        this.twilioClient = twilio(sid, auth_token);
        this.twilioPhoneNumber = dphone;
        this.fromWhatsAppNumber = phone_number;

        if (!this.twilioPhoneNumber) {
            throw new Error("Twilio phone number is missing in API key config");
        }
    }

    async createCall({ location, hospital }) {
        if (!this.twilioClient || !this.twilioPhoneNumber) {
            throw new Error("Twilio client not initialized");
        }

        const tamilMessage = `Avasaram! Oru vipathu ${location} pagudiyil nadandhathu. Noyyali ${hospital} maruthuvamanaiyil anumathikkappattullaar.`;
        const englishMessage = `Emergency! An accident has occurred at ${location}. The patient has been admitted to ${hospital}.`;

        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say({ voice: 'Aditi', language: 'ta-IN' }, tamilMessage);
        twiml.pause({ length: 1 });
        twiml.say({ voice: 'Polly.Matthew', language: 'en-US' }, englishMessage);

        const call = await this.twilioClient.calls.create({
            from: this.twilioPhoneNumber,
            to: "+916369486726",
            twiml: twiml.toString()
        });

        console.log("Call SID:", call.sid);
    }

    async relayCall(emergencyContact, victimPhone
        // , name, photo, type, location, hospital
    ) {
        if (!this.twilioClient || !this.twilioPhoneNumber) {
            throw new Error("Twilio client not initialized");
        }

        const twiml = new twilio.twiml.VoiceResponse();
        const dial = twiml.dial({ callerId: this.twilioPhoneNumber, record: true });
        dial.number(victimPhone);

        console.log(this.twilioPhoneNumber);

        const call = await this.twilioClient.calls.create({
            from: this.twilioPhoneNumber,
            to: emergencyContact,
            twiml: twiml.toString(),
        });

        // ✅ Use call.sid, not undefined call_sid
        // const calladd = await Tellocall.create({
        //     name,            // now defined
        //     call_sid: call.sid,
        //     photo,
        //     type,            // now defined
        //     location,
        //     hospital,
        //     victim_phone: victimPhone,
        //     emergency_contact: emergencyContact,
        //     status: 1,
        // });

        console.log("Relay call SID:", call.sid);
        return call;
    }

    async sendMessage(to, message,
        //  name, photo, type, location, hospital
        ) {
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

            // const { sid, from: twilioNumber, to: recipient } = result;

            // const calladd = await Tellocall.create({
            //     name,
            //     photo,
            //     call_sid: sid,
            //     type,
            //     location,
            //     hospital,
            //     victim_phone: recipient,       // the “to” you sent
            //     emergency_contact: twilioNumber, // your Twilio number
            //     status: 2,
            // });
            return { success: true, sid: result.sid };
        } catch (err) {
            console.error("Failed to send SMS:", err.message);
            return { success: false, error: err.message };
        }
    }

    async sendWhatsAppMessage(to, message, name, photo, type, location, hospital) {
        if (!this.twilioClient || !this.fromWhatsAppNumber) {
            throw new Error("Twilio client not initialized");
        }

        if (!to || !message) {
            throw new Error("Missing recipient number or message");
        }

        try {
            const result = await this.twilioClient.messages.create({
                body: message,
                from: `whatsapp:${this.fromWhatsAppNumber}`,
                to: `whatsapp:${to}`
            });

            const { sid, from: twilioNumber, to: recipient } = result;

            const calladd = await Tellocall.create({
                name,
                photo,
                call_sid: sid,
                type,
                location,
                hospital,
                victim_phone: recipient,       // the “to” you sent
                emergency_contact: twilioNumber, // your Twilio number
                status: 3,
            });

            return { success: true, sid: result.sid };
        } catch (err) {
            console.error("Failed to send WhatsApp message:", err.message);
            return { success: false, error: err.message };
        }
    }

    async sendmetaWhatsAppMessage({ to, name, message, photo, type, location, hospital }) {
  await this._loadCredentials();

  // 1) Basic validations
  if (!to || typeof to !== 'string' || !to.startsWith('+')) {
    throw new Error("'to' parameter is missing or invalid");
  }

  const allowedTypes = ['emergency', 'relay', 'whatsapp', 'sms', 'meta_whatsapp'];
  const trimmedType = type?.trim?.();
  if (!allowedTypes.includes(trimmedType)) {
    throw new Error(`Invalid type value: "${type}"`);
  }

  // 2) Build the payload for a free‑form text message
  const payload = {
  messaging_product: "whatsapp",
  to,
  type: "template",
  template: {
    name: "hello_world",
    language: { code: "en_US" }
  }
};


  const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
  const headers = {
    Authorization: `Bearer ${this.accessToken}`,
    "Content-Type": "application/json"
  };

  console.log("→ Meta WhatsApp URL:", url);
  console.log("→ Meta WhatsApp Payload:", JSON.stringify(payload, null, 2));

  try {
    // 3) Send the request
    const resp = await axios.post(url, payload, { headers });

    // 4) Log the full response so you can inspect it
    console.log("← Meta API response:", JSON.stringify(resp.data, null, 2));

    // 5) Confirm it actually delivered
    const messageId = resp.data?.messages?.[0]?.id;
    if (!messageId) {
      throw new Error(`No message ID in response: ${JSON.stringify(resp.data)}`);
    }

    // 6) Only now record in your DB
    await Tellocall.create({
      name,
      photo,
      call_sid: messageId,
      type: trimmedType,
      location,
      hospital,
      victim_phone: to,
      emergency_contact: this.phoneNumberId,
      status: 3
    });

    return { success: true, messageId };
  } catch (err) {
    const errorMessage = err.response?.data || err.message;
    console.error("Meta WhatsApp send error:", errorMessage);
    return { success: false, error: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage) };
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


// // Optional test runner
// (async () => {
//     try {
//         await twilioService.init();
//         console.log("Twilio service initialized");

//         // Uncomment either one to test
//         await twilioService.relayCall({
//             emergencyContact: "+918608703560",
//             victimPhone: "+916369486726"
//         });(async () => {
//     try {
//         await twilioService.init();
//         console.log("Twilio service initialized successfully");

//         const response = await twilioService.sendMessage(
//             '+916369486726',
//             'Hi there! This is a test message from Twilio service.'
//         );
//         console.log("SMS sent:", response);
//     } catch (err) {
//         console.error("Error:", err.message);
//     }
// })();

//         // await twilioService.createCall({
//         //     location: "Coimbatore",
//         //     hospital: "Ganga Hospital"
//         // });

//     } catch (err) {
//         console.error("Error:", err.message);
//     }
// })();


// ✅ Wrap everything in one async IIFE
// (async () => {
//     try {
//         await twilioService.init();
//         console.log("Twilio service initialized successfully");

//         const response = await twilioService.sendMessage(
//             '+916369486726',
//             'Hi there! This is a test message from Twilio service.'
//         );
//         console.log("SMS sent:", response);
//     } catch (err) {
//         console.error("Error:", err.message);
//     }
// })();


// // Create instance
// const twiliomsgService = new TwiliomsgService();

// // Optional: Init immediately (for background/test purposes)
// (async () => {
//     try {
//         await twiliomsgService.init();
//         console.log("Twilio service initialized successfully");

//         // Test message
//         const result = await twiliomsgService.sendWhatsAppMessage(
//             '+916369486726',
//             'Hello from test script!'
//         );
//         console.log('Message sent:', result);
//     } catch (err) {
//         console.error("Error:", err.message);
//     }
// })();