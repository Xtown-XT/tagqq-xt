// File: utils/encrypt.js
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

export const encrypt = (text) => {
  const key = Buffer.from(process.env.ENCRYPTION_SECRET, 'utf8');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

export const decrypt = (encryptedText) => {
  const [ivHex, encrypted] = encryptedText.split(':');
  const key = Buffer.from(process.env.ENCRYPTION_SECRET, 'utf8');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};



console.log(decrypt("99f82692080b3021b4c9a2d12bf26cc6:d0b381a89c7279487c35c8da2c51b2e7"))