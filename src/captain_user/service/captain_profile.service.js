// src/app/captain_profile/service/captain_profile.service.js

import CaptainProfile from "../models/captain_profile.models.js";

const captainProfileService = {
  async create(data) {
    return await CaptainProfile.create(data);
  },

  async getById(id) {
    const profile = await CaptainProfile.findByPk(id);
    if (!profile) throw Object.assign(new Error("Profile not found"), { status: 404 });
    return profile;
  },

  async list({ page = 1, limit = 10, is_active, search, requester } = {}) {
    const offset = (page - 1) * limit;
    const where = {};

    if (is_active !== undefined) where.is_active = is_active;

    if (requester.role === "Captain") {
      where.captain_id = requester.captain_id;
    } else if (requester.role === "Admin" && search) {
      where[Op.or] = [
        sequelize.where(sequelize.json("personal_details.data.firstName"), { [Op.like]: `%${search}%` }),
        sequelize.where(sequelize.json("personal_details.data.lastName"), { [Op.like]: `%${search}%` }),
        sequelize.where(sequelize.json("personal_details.data.email"), { [Op.like]: `%${search}%` }),
      ];
    } else if (!["Admin", "Captain"].includes(requester.role)) {
      where.id = null;
    }

    const { rows, count } = await CaptainProfile.findAndCountAll({
      where,
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });

    return { data: rows, total: count, page, limit };
  },

  async update(profileId, updates) {
    const profile = await CaptainProfile.findByPk(profileId);
    if (!profile) throw Object.assign(new Error("Profile not found"), { status: 404 });

    await profile.update(updates);
    return profile;
  },

  async remove(id) {
    const profile = await CaptainProfile.findByPk(id);
    if (!profile) throw Object.assign(new Error("Profile not found"), { status: 404 });
    await profile.destroy();
    return { message: "Profile deleted successfully" };
  },

  async restore(id) {
    const profile = await CaptainProfile.findByPk(id, { paranoid: false });
    if (!profile) throw Object.assign(new Error("Profile not found"), { status: 404 });
    await profile.restore();
    return profile;
  },

 // Calculate Captain Profile Completion

  async getProfileCompletion(captain_id) {
    try {
      const profile = await CaptainProfile.findOne({
        where: { captain_id, is_active: true },
      });

      if (!profile) {
        console.log(`No profile found for captain ${captain_id}`);
        return { completion: 0, missingFields: [] };
      }

      // ✅ Parse personal and bank details JSON
      const personal = typeof profile.personal_details?.data === "string"
        ? JSON.parse(profile.personal_details.data)
        : profile.personal_details?.data || {};

      const bank = typeof profile.bank_details?.data === "string"
        ? JSON.parse(profile.bank_details.data)
        : profile.bank_details?.data || {};

      // ✅ Required fields
      const requiredFields = [
        "personal.firstName",
        "personal.lastName",
        "personal.dob",
        "personal.gender",
        "personal.mobileNumber",
        "personal.email",
        "personal.aadhaar",
        "personal.address.street",
        "personal.address.city",
        "personal.address.state",
        "personal.address.pincode",
        "bank.accountHolderName",
        "bank.accountNumber",
        "bank.ifscCode",
        "bank.bankName",
      ];

      let filledCount = 0;
      const missingFields = [];

      requiredFields.forEach((field) => {
        const [section, ...path] = field.split(".");
        const source = section === "personal" ? personal : bank;

        const value = path.reduce((obj, key) => (obj ? obj[key] : undefined), source);
        if (value !== undefined && value !== null && value !== "") {
          filledCount++;
        } else {
          missingFields.push(field);
        }
      });

      // ✅ Completion %
      const completion = Math.round((filledCount / requiredFields.length) * 100);

      console.log(`Captain profile completion for ${captain_id}: ${completion}%`);

      return {
        completion,
        missingFields,
        totalFields: requiredFields.length,
        filledFields: filledCount,
      };
    } catch (err) {
      console.error(`❌ Error calculating captain profile completion: ${err.message}`);
      throw err;
    }
  },
};

export default captainProfileService;
