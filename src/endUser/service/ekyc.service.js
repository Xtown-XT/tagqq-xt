import axios from 'axios';
// Import your Sequelize API Key model
import ApiKey from '../../thridPartyAPI/models/apiKeys.models.js';
import Publicurl from '../models/public_url.model.js';
import Profile from '../models/profile.models.js';
import { Sequelize } from 'sequelize';
const { literal, where } = Sequelize;


class QuickEKYCService {
  constructor() {
    this.baseUrl = 'https://api.quickekyc.com/api/v1';
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });
  }

  async _getKeyForClient() {
    console.log("🟡 Step 1: Attempting to fetch API key from DB");

    const record = await ApiKey.findOne({ where: { name: 'quickekyc' } });
    console.log("🟢 Step 2: Record fetched:", record);

    if (!record) {
      console.error("🔴 Step 3: No API key record found.");
      const err = new Error('API key record not found for QuickEKYC');
      err.status = 404;
      throw err;
    }

    console.log("🟢 Step 4: keys field =", record.keys);
    const apiKey = record.keys?.apikey;

    if (!apiKey) {
      console.error("🔴 Step 5: apikey missing in record.keys:", record.keys);
      const err = new Error('API key missing in QuickEKYC record');
      err.status = 500;
      throw err;
    }

    console.log("✅ Step 6: top key:", apiKey);
    return apiKey;
  }



  async generateOtp({ key, id_number }) {
    if (!key) {
      key = await this._getKeyForClient();
    }
    if (!key || !id_number) {
      const err = new Error('Both key and id_number are required for generateOtp');
      err.status = 400;
      throw err;
    }

    // 2) Check for existing Aadhaar
    const existing = await Profile.findOne({
      where: { id_number }
    });

    if (existing) {
      const err = new Error(`Aadhaar number ${id_number} already exists in our records`);
      err.status = 409;
      throw err;
    }

    // 3) Hit the external API
    try {
      const response = await this.httpClient.post(
        '/aadhaar-v2/generate-otp',
        { key, id_number }
      );
      
      return response.data; // e.g. { status: 'success', request_id: 12345 }
    } catch (err) {
      // Make sure _handleError either throws or returns a usable error
      // If it returns an object, use `return`; if it throws, no change needed.
      return this._handleError(err, 'generate-otp');
    }
  }


  async submitOtp({ key, request_id, otp, user_id, id_number, captain_id }) {
    // 1) Ensure you have all inputs
    if (!key) {
      key = await this._getKeyForClient();
    }
    if (!key || !request_id || !otp || !id_number) {
      const err = new Error('key, request_id, otp and id_number are required for submitOtp');
      err.status = 400;
      throw err;
    }

    try {
      // 2) Hit the external API
      const response = await this.httpClient.post(
        '/aadhaar-v2/submit-otp',
        { key, request_id, otp }
      );
      const ekycData = response.data;     // e.g. { status: 'success', data: { … } } or { status: 'error', message: '…' }

      // 3) Only persist to Profile if the API itself returned success
      if (ekycData.status === 'success' && user_id) {
        await Profile.create({
          docs_name: 'Aadhar',
          data: ekycData.data,
          user_id,
          id_number,
          captain_id,
          created_by: user_id,
          updated_by: user_id,
        });
      }

      // 4) Return the raw API response back to the caller
      return ekycData;
    } catch (err) {
      // _handleError should either throw or return a normalized error;
      // if it throws, this method will bubble that as an exception.
      // if it returns, we forward it:
      return this._handleError(err, 'submit-otp');
    }
  }


  async fetchRcFull({ key, id_number, user_id, created_by, owner_name }) {
  // 1) Validate input
  if (!id_number) {
    const err = new Error('id_number is required for fetchRcFull');
    err.status = 400;
    throw err;
  }

  // 🔹 Check how many RCs this user already has
  const rcCount = await Profile.count({
    where: { user_id, docs_name: 'RC' },
  });

  // 🔹 If not the first RC, enforce QR check
  if (rcCount > 0) {
    const currentUserQr = await Publicurl.findOne({
      where: { user_id },
    });

    if (!currentUserQr) {
      const err = new Error('You do not have a QR. Please generate or activate your QR to add more RCs.');
      err.status = 403;
      throw err;
    }

    if (!['Paid', 'Active'].includes(currentUserQr.status) || !currentUserQr.is_active) {
      const err = new Error('Your QR is inactive or unpaid. Please activate your QR to add more RCs.');
      err.status = 403;
      throw err;
    }
  }

  // 2) Prevent duplicate RC entries
  const existing = await Profile.findOne({
    where: { id_number, docs_name: 'RC' },
  });

  if (existing) {
    const ownerUserId = existing.user_id;
    const isSameUser = ownerUserId === user_id;

    // Check QR status for the user who already added this RC
    const ownerQr = await Publicurl.findOne({
      where: {
        user_id: ownerUserId,
        status: { [Op.in]: ['Paid', 'Active'] },
        is_active: true,
      },
    });

    if (!ownerQr) {
      const err = new Error(
        isSameUser
          ? 'You have already stored this vehicle. Please activate your QR to store a new RC.'
          : `This vehicle was already stored by another user (${ownerUserId}). Please ensure their QR is active.`
      );
      err.status = 409;
      err.data = {
        alreadyExists: true,
        ownerUserId,
        data: existing.data,
        requiresQrActivation: true,
      };
      throw err;
    }

    console.log('Existing RC found, but QR is valid. Proceeding...');
  }

    // 3) Ensure API key
    const apiKey = key ?? await this._getKeyForClient();
    if (!apiKey) {
      const err = new Error('Unable to obtain API key for fetchRcFull');
      err.status = 500;
      throw err;
    }

    console.log('🔑 Using QuickEkyc API key:', apiKey);

    // 4) Fetch RC data from external service
    let rcData;
    try {
      const response = await this.httpClient.post('/rc/rc-full', {
        key: apiKey,
        id_number,
      });
      rcData = response.data;
      console.log('✔️  rcData fetched:', rcData);
    } catch (err) {
      return this._handleError(err, 'rc-full');
    }

    // 5) Owner name validation
    const fetchedOwner = String(rcData.data.owner_name || '').trim().toLowerCase();
    const providedOwner = String(owner_name || '').trim().toLowerCase();
    if (fetchedOwner !== providedOwner) {
      const err = new Error(
        `Owner name mismatch: expected "${rcData.data.owner_name}", got "${owner_name}"`
      );
      err.status = 422;
      throw err;
    }

    // 6) Save RC data
    console.log('ℹ️  Creating Profile with:', {
      user_id,
      id_number,
      payloadBytes: JSON.stringify(rcData).length,
    });

    let created;
    try {
      created = await Profile.create({
        docs_name: 'RC',
        data: rcData,
        user_id,
        id_number,
        created_by,
        updated_by: created_by,
      });
      console.log('✅  Inserted Profile ID:', created.id);
    } catch (dbErr) {
      console.error('❌  Profile.create failed:', dbErr);
      const err = new Error('Database insert failed');
      err.status = 500;
      throw err;
    }

    // 7) Return
    return {
      alreadyExists: false,
      data: rcData,
      message: 'New RC data fetched and stored.',
      profileId: created.id,
    };
  }



  async fetchLicense({ key, id_number, dob, user_id }) {
    // 1) Validate input
    if (!key) {
      key = await this._getKeyForClient();
    }
    if (!key || !id_number || !dob) {
      const err = new Error('key, id_number, and dob are required for fetchLicense');
      err.status = 400;
      throw err;
    }

    // 2) Fetch driving license
    let licenseData;
    try {
      const response = await this.httpClient.post(
        '/driving-license/driving-license',
        { key, id_number, dob }
      );
      licenseData = response.data;
    } catch (err) {
      return this._handleError(err, 'license');
    }

    // 3) Persist if user_id provided
    if (user_id) {
      try {
        await Profile.create({
          docs_name: 'License',
          data: licenseData,
          user_id,
          created_by: user_id,
          updated_by: user_id,
        });
      } catch (dbErr) {
        console.error('❌  Profile.create failed:', dbErr);
        const err = new Error('Database insert failed for license');
        err.status = 500;
        throw err;
      }
    }

    return licenseData;
  }


  _handleError(err, endpoint) {
    if (err.response) {
      const { status, data } = err.response;
      const message = data?.message || JSON.stringify(data);
      const error = new Error(`QuickEKYC ${endpoint} failed: ${message}`);
      error.status = status;
      throw error;
    }
    throw err;
  }


  async fetchLicense({ key, id_number, dob, user_id }) {
    if (!key) key = await this._getKeyForClient();
    if (!key || !id_number || !dob) {
      const err = new Error('key, id_number, and dob are required for fetchLicense'); err.status = 400;
      throw err;
    }
    try {
      const payload = { key, id_number, dob };
      const response = await this.httpClient.post('/driving-license/driving-license', payload);
      const licenseData = response.data;
      if (user_id) {
        await Profile.create({ docs_name: 'License', data: licenseData, user_id, created_by: user_id, updated_by: user_id });
      }
      return licenseData;
    } catch (err) { this._handleError(err, 'license'); }
  }


  _handleError(err, endpoint) {
    if (err.response) {
      const { status, data } = err.response;
      const message = data?.message || JSON.stringify(data);
      const error = new Error(`QuickEKYC ${endpoint} failed: ${message}`);
      error.status = status;
      throw error;
    }
    throw err;
  }


  async fetchBankVerification({ key, id_number, ifsc, captain_id, user_id }) {
    // ensure we have an API key
    if (!key) {
      key = await this._getKeyForClient();
    }
    // id_number (account number) is mandatory; IFSC is optional
    if (!key || !id_number) {
      const err = new Error('key and id_number are required for fetchBankVerification');
      err.status = 400;
      throw err;
    }

    try {
      // build payload
      const payload = { key, id_number };
      if (ifsc) payload.ifsc = ifsc;

      // call the bank-verification endpoint
      const response = await this.httpClient.post(
        '/bank-verification',
        payload
      );

      // pull out the inner data
      let bankData = response.data.data;
      const status = response.data.status;

      if (status !== 'success') {
        const err = new Error(`QuickE-KYC bank verification failed: ${response.data.message || 'Unknown error'}`);
        err.status = 400;
        throw err;
      }

      // merge in the IFSC into your bankData object
      if (ifsc) {
        bankData = { ...bankData, ifsc };
      }

      // check for existing record
      const already = await Profile.findOne({
        where: { captain_id, docs_name: 'captain_bank' }
      });
      if (already) {
        const err = new Error(`Captain bank details already exist for captain_id ${captain_id}`);
        err.status = 409;
        throw err;
      }

      // persist in your Profile log
      if (captain_id) {
        await Profile.create({
          docs_name: 'captain_bank',
          data: bankData,
          captain_id,
          id_number,
          created_by: captain_id,
          updated_by: captain_id,
        });
      }

      return bankData;
    } catch (err) {
      this._handleError(err, 'bank-verification');
    }
  }


}

export default new QuickEKYCService();
