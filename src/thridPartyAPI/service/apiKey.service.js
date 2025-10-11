import ApiKey from "../models/apiKeys.models.js"; 
import { Op } from "sequelize";

class APIkeyService {
  constructor() {
    this.apikey = ApiKey;
  }

  // Create API key
  async createAPIkey({ name, keys }) {
    try {
      const apiKey = await this.apikey.create({ name, keys });
      return apiKey;
    } catch (err) {
      throw new Error("Failed to create API key: " + err.message);
    }
  }

  // Get all API keys with limit, offset, and optional search
  // Get all API keys with limit, page, and optional search
async getAllAPIkeys({ limit = 10, page = 1, search = "" }) {
  try {
    const where = {};

    if (search) {
      where.name = {
        [Op.iLike]: `%${search}%`, 
      };
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await this.apikey.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      data: rows,
      total: count,
      page,
      totalPages,
    };
  } catch (err) {
    throw new Error("Failed to fetch API keys: " + err.message);
  }
}


  // Get API key by ID
  async getAPIkeyById(id) {
    try {
      const apiKey = await this.apikey.findByPk(id);
      if (!apiKey) throw new Error("API key not found");
      return apiKey;
    } catch (err) {
      throw new Error("Failed to fetch API key: " + err.message);
    }
  }

  // Update API key by ID
  async updateAPIkeyById(id, updateData) {
    try {
      const apiKey = await this.apikey.findByPk(id);
      if (!apiKey) throw new Error("API key not found");

      await apiKey.update(updateData);
      return apiKey;
    } catch (err) {
      throw new Error("Failed to update API key: " + err.message);
    }
  }

  async getAPUIkeyByName(name) {
    try {
      const apiKey = await this.apikey.findOne({ where: { name } });
      if (!apiKey) throw new Error("API key not found");
      return apiKey? apiKey : null;
    } catch (err) {
      throw new Error("Failed to fetch API key by name: " + err.message);
    }
  }

  // Delete API key by ID
  async deleteAPIkeyById(id) {
    try {
      const deleted = await this.apikey.destroy({ where: { id } });
      if (deleted === 0) throw new Error("API key not found");
      return { message: "API key deleted successfully" };
    } catch (err) {
      throw new Error("Failed to delete API key: " + err.message);
    }
  }
}

export default new APIkeyService();
