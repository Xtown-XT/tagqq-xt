import axios from "axios";
import apiKeyService from "./apiKey.service.js";
import Tellocall from "../models/callLogs.js";

class VICpassService {
  constructor() {
    this.accessToken = null;
    this.baseUrl = null;
    this._loaded = false;
  }

  async _loadCredentials() {
    if (this._loaded) return;

    const record = await apiKeyService.getAPIKeyByName("vi_cpass");
    if (!record) throw new Error("Vodafone CPaaS credentials not found");

    const { base_url, client_id, client_secret } = record.keys;
    if (!base_url || !client_id || !client_secret) {
      throw new Error("Incomplete VI CPaaS credentials in api_keys table");
    }

    this.baseUrl = base_url;
    this.clientId = client_id;
    this.clientSecret = client_secret;
    this._loaded = true;
  }

  // Get Bearer Token 
  async getBearerToken() {
    await this._loadCredentials();

    const url = `${this.baseUrl}/oauth/token`;
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    try {
      const res = await axios.post(url, body.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      this.accessToken = res.data.access_token;
      return this.accessToken;
    } catch (err) {
      const msg = err.response?.data?.error_description || err.message;
      console.error("Failed to get VI CPaaS token:", msg);
      throw new Error("Authentication failed for VI CPaaS: " + msg);
    }
  }

  // Initiate Voice Call 
  async initiateCall({ from, to, message }) {
    if (!this.accessToken) await this.getBearerToken();

    const url = `${this.baseUrl}/voice/v1/call`;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };

    const payload = { from, to, text: message || "Hello, this is a VI CPaaS test call" };

    try {
      const res = await axios.post(url, payload, { headers });
      console.log(" VI Call Initiated:", res.data);

      await Tellocall.create({
        provider: "VI_CPaaS",
        from,
        to,
        status: "initiated",
        message,
        call_sid: res.data?.callId || res.data?.id,
        raw_response: res.data,
      });

      return res.data;
    } catch (err) {
      console.error(" VI Initiate Call Error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Failed to initiate VI call");
    }
  }

  /** 📴 Disconnect Active Call */
  async disconnectCall(callId) {
    if (!this.accessToken) await this.getBearerToken();

    const url = `${this.baseUrl}/voice/v1/call/${callId}/disconnect`;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };

    try {
      const res = await axios.post(url, {}, { headers });
      console.log("📴 VI Call Disconnected:", res.data);

      await Tellocall.updateOne(
        { call_sid: callId },
        { status: "disconnected", disconnectedAt: new Date() }
      );

      return res.data;
    } catch (err) {
      console.error(" VI Disconnect Error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Failed to disconnect VI call");
    }
  }
}

const viCpassService = new VICpassService();
export default viCpassService;
     
