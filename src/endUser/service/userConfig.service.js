import UserConfig from '../models/userConfig.model.js';

// Create
export const createUserInfo = async ({ user_id, has_profile = false, has_vehicle = false, has_aadhar = false , has_license=false, has_emergency=false  }) => {
  const userConfig = await UserConfig.create({
    user_id,
    has_profile,
    has_vehicle,
    has_aadhar,
    has_license,
    has_emergency,
    is_active: true,
    created_by : user_id
  });
  return userConfig;
};

// Get all
export const getUserConfigs = async ({
  filter = "all",
  page = 1,
  limit = 10,
  orderBy = "desc",
  userId = null
}) => {
  const whereClause = { is_active: true };

  if (filter === "profile") whereClause.has_profile = true;
  if (filter === "vehicle") whereClause.has_vehicle = true;
  if (filter === "aadhar") whereClause.has_aadhar = true;
  if (filter === "license") whereClause.has_license = true;
  if (filter === "emergency") whereClause.has_emergency = true;

  if (userId) {
    whereClause.user_id = userId;
  }

  const offset = (page - 1) * limit;

  const configs = await UserConfig.findAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", orderBy.toLowerCase() === "asc" ? "ASC" : "DESC"]],
  });

  const total = await UserConfig.count({ where: whereClause });
  const totalPages = Math.ceil(total / limit);

  return { total, totalPages, currentPage: page, userConfigs: configs };
};

// Get by ID
export const getUserConfigById = async (id) => {
  const config = await UserConfig.findByPk(id);
  if (!config) throw new Error("UserConfig not found");
  return config;
};

// Update
export const updateUserConfigById = async (id, data) => {
  const config = await UserConfig.findByPk(id);
  if (!config) throw new Error("UserConfig not found");
  await config.update(data);
  return config;
};

// Soft delete
export const softDeleteUserConfig = async (id) => {
  const config = await UserConfig.findByPk(id);
  if (!config) return { status: "not_found" };
  if (!config.is_active) return { status: "already_inactive" };

  await config.update({ is_active: false });
  return { status: "deactivated" };
};

// Restore
export const restoreUserConfig = async (id) => {
  const config = await UserConfig.findByPk(id);
  if (!config) return { status: "not_found" };
  if (config.is_active) return { status: "already_active" };

  await config.update({ is_active: true });
  return { status: "restored" };
};

// Hard delete
export const deleteUserConfigById = async (id) => {
  const config = await UserConfig.findByPk(id);
  if (!config) throw new Error("UserConfig not found");

  await config.destroy();
  return { message: "UserConfig deleted permanently" };
};

// Get config for logged-in user
export const getUserConfigByUserId = async (user_id) => {
  const config = await UserConfig.findOne({
    where: {
      user_id,
      is_active: true
    }
  });

  if (!config) throw new Error('UserConfig not found for this user');
  return config;
};






// // File: src/endUser/service/userConfig.service.js

// import UserConfig from '../models/userConfig.model.js';
// import User from '../models/user.model.js';
// import Profile from '../models/profile.models.js';
// import UserInfo from '../models/user.model.js';

// // Create
// export const createUserInfo = async ({ user_id, has_profile = false, has_vehicle = false, has_user_info = false }) => {
//   return await UserInfo.create({
//     user_id,
//     has_profile,
//     has_vehicle,
//     has_user_info
//   });
// };

// // Get all with filters, pagination, and sorting
// export const getUserInfos = async ({
//   filter = "all",
//   page = 1,
//   limit = 10,
//   orderBy = "desc",
//   userId = null
// }) => {
//   const whereClause = {};
//   if (userId) whereClause.user_id = userId;

//   const offset = (page - 1) * limit;

//   const includeOptions = [
//     {
//       model: User,
//       attributes: ['id', 'username', 'email']
//     }
//   ];

//   // Dynamically add conditional includes
//   if (filter === "profile") {
//     whereClause.has_profile = true;
//     includeOptions.push({
//       model: Profile,
//       attributes: ['first_name', 'last_name', 'gender']
//     });
//   } else if (filter === "vehicle") {
//     whereClause.has_vehicle = true;
//     includeOptions.push({
//       model: Vehicle,
//       attributes: ['model', 'plate_number']
//     });
//   } else if (filter === "userinfo") {
//     whereClause.has_user_info = true;
//     includeOptions.push({
//       model: UserInfo,
//       attributes: ['dob', 'address', 'marital_status']
//     });
//   } else if (filter === "all") {
//     includeOptions.push(
//       { model: Profile, attributes: ['first_name', 'last_name'] },
//       { model: Vehicle, attributes: ['model', 'plate_number'] },
//       { model: UserInfo, attributes: ['dob', 'address'] }
//     );
//   }

//   const userConfigs = await UserConfig.findAll({
//     where: whereClause,
//     limit: parseInt(limit),
//     offset,
//     order: [["createdAt", orderBy.toLowerCase() === "asc" ? "ASC" : "DESC"]],
//     include: includeOptions
//   });

//   const total = await UserConfig.count({ where: whereClause });
//   const totalPages = Math.ceil(total / limit);

//   return { total, totalPages, currentPage: page, userConfigs };
// };

// // Get by ID
// export const getUserInfoById = async (id) => {
//   const userInfo = await UserInfo.findByPk(id);
//   if (!userInfo) throw new Error("UserInfo not found");
//   return userInfo;
// };

// // Update
// export const updateUserInfoById = async (id, data) => {
//   const userInfo = await UserInfo.findByPk(id);
//   if (!userInfo) throw new Error("UserInfo not found");
//   return await userInfo.update(data);
// };

// // Soft delete (deactivate)
// export const softDeleteUserInfo = async (id) => {
//   const userInfo = await UserInfo.findByPk(id);
//   if (!userInfo) return { status: "not_found" };
//   if (!userInfo.is_active) return { status: "already_inactive" };

//   await userInfo.update({ is_active: false });
//   return { status: "deactivated" };
// };

// // Restore
// export const restoreUserInfo = async (id) => {
//   const userInfo = await UserInfo.findByPk(id);
//   if (!userInfo) return { status: "not_found" };
//   if (userInfo.is_active) return { status: "already_active" };

//   await userInfo.update({ is_active: true });
//   return { status: "restored" };
// };

// // Hard delete
// export const deleteUserInfoById = async (id) => {
//   const userInfo = await UserInfo.findByPk(id);
//   if (!userInfo) throw new Error("UserInfo not found");

//   await userInfo.destroy();
//   return { message: "UserInfo deleted permanently" };
// };
