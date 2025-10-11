import Profile from '../models/profile.models.js';
import { createBloodDonor } from '../../bloodgroup/service/blooddonor.service.js';
import BloodDonor from '../../bloodgroup/models/blooddonor.models.js';
import BloodGroup from '../../bloodgroup/models/bloodgroup.models.js';
import District from '../models/address.district.models.js';
import { Op, Sequelize } from 'sequelize';
import User from '../models/user.model.js';
import UserConfig from '../models/userConfig.model.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

// Sequelize Associations
Profile.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
User.hasMany(Profile, { foreignKey: 'user_id', as: 'profiles', onDelete: 'CASCADE' });


export async function createProfile(
  { docs_name, data, user_id, captain_id, created_by, id_number, profile_image },
  options = {}
) {
  try {
    // ✅ Parse `data` if it's a JSON string
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (err) {
        console.error(`❌ Invalid JSON format in 'data': ${err.message}`);
        throw new Error('Invalid profile data format');
      }
    }

    // ✅ Duplicate check for users and captains (Skip RC)
    if (docs_name !== 'RC') {
      const whereClause = user_id
        ? { user_id, docs_name }
        : { captain_id, docs_name };

      const existing = await Profile.findOne({ where: whereClause, ...options });

      if (existing) {
        console.log(
          `✋ Skipping duplicate profile for ${user_id ? `user=${user_id}` : `captain=${captain_id}`
          }, docs_name=${docs_name}`
        );
        return existing;
      }
    }

    // ✅ Create profile
    const profile = await Profile.create(
      { docs_name, data, user_id, captain_id, created_by, id_number, profile_image },
      options
    );

    console.log(`✅ Profile Created Successfully: ${profile.id}`);

    // ✅ Auto-create Blood Donor only if willing_to_donate is TRUE
    if (
      user_id &&
      docs_name === 'Profile' &&
      (data?.is_willing_to_donate === true || data?.is_willing_to_donate === 'true')
    ) {
      // Ensure blood & district are provided
      if (!data?.blood || !data?.address?.district) {
        console.log('⚠️ Missing blood group or district. Skipping blood donor creation.');
        return profile;
      }

      // Fetch user
      const user = await User.findOne({ where: { id: user_id } });
      if (!user) {
        console.log('⚠️ User not found. Skipping donor creation.');
        return profile;
      }

      console.log('🩸 User opted to donate. Creating Blood Donor record...');

      // ✅ Fetch blood group
      const bloodGroup = await BloodGroup.findOne({ where: { name: data.blood } });
      if (!bloodGroup) {
        console.warn(`⚠️ Blood group ${data.blood} not found. Skipping donor creation.`);
        return profile;
      }

      // ✅ Fetch district
      const district = await District.findOne({ where: { name: data.address.district } });
      if (!district) {
        console.warn(`⚠️ District ${data.address.district} not found. Skipping donor creation.`);
        return profile;
      }

      // ✅ Prepare donor payload
      const donorPayload = {
        name: data?.name ?? user?.username ?? 'Unknown',
        mobile_no: data?.phone ?? user?.phone ?? '',
        blood_group_id: bloodGroup.id,
        district_id: district.id,
        city: data?.address?.city ?? '',
        created_by,
        is_active: true,
      };

      // ✅ Create Blood Donor
      await createBloodDonor(donorPayload);
      console.log('✅ Blood Donor record created successfully.');
    } else {
      console.log('⏩ User did not opt for blood donation. Only profile created.');
    }

    return profile;
  } catch (err) {
    console.error(`❌ Error Creating Profile: ${err.message}`, err);
    throw err;
  }
}


export async function getProfiles({
  includeInactive = false,
  is_active,
  docs_name,
  search,
  startDate,
  endDate,
  page = 1,
  limit = 10,
  orderBy = 'createdAt',
  order = 'asc',

  currentUser = null,
  currentAgent = null,

//   currentCaptain = null,

  captain = null,

  isAdmin = false,
} = {}) {
  const where = {};

  if (!includeInactive) where.is_active = true;
  if (typeof is_active === 'boolean') where.is_active = is_active;

  if (search) {
    where[Op.or] = [
      { docs_name: { [Op.iLike]: `%${search}%` } },
      Sequelize.where(
        Sequelize.json('data.fullName'),
        { [Op.iLike]: `%${search}%` }
      ),
    ];
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.createdAt[Op.lt] = nextDay;
    }
  }

  let include = [{
    model: User,
    as: 'user',
    attributes: ['id', 'username', 'email', 'phone', 'referral_id'],
  }];

  // 🔹 Apply filters
  if (!isAdmin) {
    if (currentUser) {
      // === END USER LOGIC ===
      const config = await UserConfig.findOne({
        where: { user_id: currentUser.id, is_active: true },
      });

      const allowedDocs = [];
      if (config?.has_profile) allowedDocs.push('Profile');
      if (config?.has_license) allowedDocs.push('license');
      if (config?.has_vehicle) allowedDocs.push('RC');
      if (config?.has_aadhar) allowedDocs.push('Aadhar');
      if (config?.has_emergency) allowedDocs.push('Emergency');

      if (allowedDocs.length === 0) return { count: 0, rows: [] };

      where.user_id = currentUser.id;

      if (docs_name) {
        if (!allowedDocs.includes(docs_name)) return { count: 0, rows: [] };
        where.docs_name = docs_name;
      } else {
        where.docs_name = { [Op.in]: allowedDocs };
      }

    } else if (currentAgent) {
      // === AGENT LOGIC ===
      include = [{
        model: User,
        as: 'user',
        where: { referral_id: currentAgent.id },
        attributes: ['id', 'username', 'email', 'phone', 'referral_id'],
      }];


    } else if (currentCaptain) {
      // === CAPTAIN LOGIC ===
      where.captain_id = currentCaptain.id;
      
      

      where.docs_name = { [Op.in]: ['captain_profile', 'captain_bank'] };

    } else {
      return { count: 0, rows: [] };

//     } else if (captain) {
//       //  Only allow captain's own profiles
//       where.captain_id = captain.id;

//       //  Optional: restrict to captain-specific docs
//       const allowedDocs = ['captain_profile', 'captain_bank'];

//       if (docs_name) {
//         if (!allowedDocs.includes(docs_name)) {
//           return { count: 0, rows: [] };
//         }
//         where.docs_name = docs_name;
//       } else {
//         where.docs_name = { [Op.in]: allowedDocs };
//       }
//     } else {
//       return { count: 0, rows: [] }; // Neither admin, user, agent, nor captain

    }
  } else {
    // === ADMIN LOGIC ===
    if (docs_name) {
      where.docs_name = docs_name;
    }
  }

  const offset = (page - 1) * limit;
  const orderClause = [[orderBy, order.toUpperCase()]];

  try {
    const { count, rows } = await Profile.findAndCountAll({
      where,
      offset,
      limit,
      order: orderClause,
      include,
    });

    const sanitizedRows = rows.map(profile => {
      const buf = profile.profile_image;
      let dataUrl = null;
      if (buf) {
        const b64 = buf.toString('base64');
        dataUrl = `data:image/jpeg;base64,${b64}`;
      }
      const json = profile.toJSON();
      json.profile_image = dataUrl;
      return json;
    });

    return { count, rows: sanitizedRows };

  } catch (err) {
    console.error('Sequelize error in getProfiles():', err);
    throw err;
  }
}



export async function  getProfileCompletion(user_id) {

// export async function getProfileCompletion(user_id) {

  try {
    const profile = await Profile.findOne({
      where: { user_id, docs_name: 'Profile', is_active: true },
    });

    if (!profile) {
      console.log(`No profile found for user ${user_id}`);
      return { completion: 0, missingFields: [] };
    }

    const data = typeof profile.data === 'string' ? JSON.parse(profile.data) : profile.data;

    const requiredFields = [
      'fullName',
      'dob',
      'gender',
      'bloodGroup',
      'phone',
      'email',
      'address.street',
      'address.city',
      'address.district',
      'address.state',
      'address.pincode',
      'is_willing_to_donate'
    ];

    let filledCount = 0;
    const missingFields = [];

    requiredFields.forEach((field) => {
      const value = field.split('.').reduce((obj, key) => (obj ? obj[key] : undefined), data);
      if (value !== undefined && value !== null && value !== '') {
        filledCount++;
      } else {
        missingFields.push(field);
      }
    });

    //Calculate completion %
    const completion = Math.round((filledCount / requiredFields.length) * 100);

    console.log(` Profile completion for user ${user_id}: ${completion}%`);

    return { completion, missingFields, totalFields: requiredFields.length, filledFields: filledCount };
  } catch (err) {
    console.error(` Error calculating profile completion: ${err.message}`);
    throw err;
  }
}



export const getRCCountByDistrict = async (startDate, endDate) => {
  try {
    // 1) Build base WHERE
    const whereClause = { docs_name: 'RC' };

    // 2) Optional date filter
    if (startDate && endDate) {
      const start = dayjs.utc(startDate).startOf('day').toDate();
      const end = dayjs.utc(endDate).endOf('day').toDate();
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }
      whereClause.createdAt = { [Op.between]: [start, end] };
    }

    // 3) Fetch all matching
    const profiles = await Profile.findAll({
      where: whereClause,
      attributes: ['data'],
      raw: true,
    });

    // Debug: inspect the very first profile so you know where district lives
    if (profiles.length) {
      console.log('Sample profile.data:', profiles[0].data);
    } else {
      console.log('No RC profiles found at all.');
    }

    // 4) Grouping
    const districtMap = {};

    profiles.forEach(({ data }) => {
      // a) parse if it's a string
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;

      // b) try every plausible path
      let district =
        parsed?.data?.registered_address?.district ||
        parsed?.data?.address?.district ||
        parsed?.data?.location?.district ||
        null;

      // c) fallback to splitting registered_at
      if (!district) {
        const reg = parsed?.data?.registered_at;
        if (typeof reg === 'string') {
          district = reg.split(' ')[0];
        }
      }

      if (!district) return;
      district = district.trim().toUpperCase();

      // init
      if (!districtMap[district]) {
        districtMap[district] = { district, totalRc: 0, vehicleTypes: {} };
      }

      districtMap[district].totalRc++;

      // count vehicle types
      const vc = parsed?.data?.vehicle_category;
      if (typeof vc === 'string') {
        const typeKey = vc.trim().toUpperCase();
        districtMap[district].vehicleTypes[typeKey] =
          (districtMap[district].vehicleTypes[typeKey] || 0) + 1;
      }
    });

    // 5) shape final array
    const result = Object.values(districtMap).map((d) => ({
      district: d.district,
      totalRc: d.totalRc,
      vehicleTypes: Object.entries(d.vehicleTypes).map(
        ([vehicle_type, total]) => ({ vehicle_type, total })
      ),
    }));

    return {
      success: true,
      data: result,
      message: 'RC by district with vehicle types fetched successfully',
    };
  } catch (error) {
    console.error('Error fetching RC count by district:', error);
    return {
      success: false,
      message: 'Failed to fetch RC count by district',
      error: error.message,
    };
  }
};

// Fetch Vehicle Counts

export const getVehicles = async (startDateParam, endDateParam, page = 1, limit = 10) => {
  try {
    const hasDates = startDateParam != null && endDateParam != null;
    let dateRange = null;
    if (hasDates) {
      const start = new Date(startDateParam);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDateParam);
      end.setHours(23, 59, 59, 999);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }
      dateRange = { [Op.between]: [start, end] };
    }

    const baseWhere = { docs_name: 'RC' };

    // TOTAL (All-time) 
    const totalProfiles = await Profile.findAll({
      where: baseWhere,
      attributes: ['data'],
      raw: true
    });

    // FILTERED (Date-based) 
    const filteredProfiles = hasDates
      ? await Profile.findAll({
        where: { ...baseWhere, createdAt: dateRange },
        attributes: ['data'],
        raw: true
      })
      : [];

    // Utility to count vehicles by category
    const countByCategory = (profiles) => {
      let total = 0;
      let count_2WN = 0;
      let count_3WN = 0;
      let count_4WN = 0;
      let count_6WN = 0;
      let count_8WN = 0;
      let count_others = 0;

      profiles.forEach(({ data }) => {
        total++;
        let jsonData;
        try {
          jsonData = typeof data === 'string' ? JSON.parse(data) : data;
        } catch {
          count_others++;
          return;
        }

        const vc = jsonData?.data?.vehicle_category;
        if (typeof vc === 'string') {
          switch (vc.trim().toUpperCase()) {
            case '2WN': count_2WN++; break;
            case '3WN': count_3WN++; break;
            case '4WN': count_4WN++; break;
            case '6WN': count_6WN++; break;
            case '8WN': count_8WN++; break;
            default: count_others++;
          }
        } else {
          count_others++;
        }
      });

      return {
        totalRc: total,
        count_2WN,
        count_3WN,
        count_4WN,
        count_6WN,
        count_8WN,
        count_others
      };
    };

    const totalStats = countByCategory(totalProfiles);
    const filteredStats = hasDates ? countByCategory(filteredProfiles) : {
      totalRc: 0,
      count_2WN: 0,
      count_3WN: 0,
      count_4WN: 0,
      count_6WN: 0,
      count_8WN: 0,
      count_others: 0
    };

    return {
      success: true,
      data: {
        totalRc: totalStats.totalRc,
        no_of_rc: filteredStats.totalRc,

        total_count_2WN: totalStats.count_2WN,
        no_count_2WN: filteredStats.count_2WN,

        total_count_3WN: totalStats.count_3WN,
        no_count_3WN: filteredStats.count_3WN,

        total_count_4WN: totalStats.count_4WN,
        no_count_4WN: filteredStats.count_4WN,

        total_count_6WN: totalStats.count_6WN,
        no_count_6WN: filteredStats.count_6WN,

        total_count_8WN: totalStats.count_8WN,
        no_count_8WN: filteredStats.count_8WN,

        total_count_others: totalStats.count_others,
        no_count_others: filteredStats.count_others,

        message: 'RC vehicle category stats calculated successfully'
      }
    };
  } catch (error) {
    console.error('Error fetching RC vehicle counts:', error);
    return {
      success: false,
      message: 'Failed to fetch RC vehicle counts',
      error: error.message
    };
  }
};

export async function getProfileById(id, includeInactive = false) {
  // Build our WHERE clause
  const where = { id };
  if (!includeInactive) where.is_active = true;

  // Fetch the Sequelize instance
  const profile = await Profile.findOne({ where });
  if (!profile) return null;

  // Convert to plain object
  const json = profile.toJSON();

  // If there's a Buffer in profile_image, convert to base64 Data URL
  if (json.profile_image) {
    const b64 = profile.profile_image.toString('base64');
    json.profile_image = `data:image/jpeg;base64,${b64}`;
  } else {
    json.profile_image = null;
  }

  return json;
}


export async function updateProfile(id, updateData) {
  const [count] = await Profile.update(updateData, {
    where: { id, is_active: true },
  });

  if (count === 0) {
    // Nothing was updated (no match or already inactive)
    return [0, []];
  }

  // Re-fetch the updated profile manually
  const updatedProfile = await Profile.findOne({ where: { id } });

  if (!updatedProfile) {
    return [count, []];
  }

  const json = updatedProfile.toJSON();

  // Sanitize profile_image if present
  if (updatedProfile.profile_image) {
    const b64 = updatedProfile.profile_image.toString('base64');
    json.profile_image = `data:image/jpeg;base64,${b64}`;
  } else {
    json.profile_image = null;
  }

  return [count, [json]];
}


export async function deleteProfileById(id, force = false, deletedBy = null) {
  if (force) {
    return await Profile.destroy({ where: { id } });
  } else {
    const updateData = { is_active: false };
    if (deletedBy) updateData.updated_by = deletedBy;
    const [count] = await Profile.update(updateData, { where: { id, is_active: true } });
    return count;
  }
}

export async function deleteProfiles(force = false, deletedBy = null) {
  const where = {};
  if (!force) where.is_active = true;
  if (force) {
    return await Profile.destroy({ where });
  } else {
    const updateData = { is_active: false };
    if (deletedBy) updateData.updated_by = deletedBy;
    const [count] = await Profile.update(updateData, { where });
    return count;
  }
}

export async function restoreProfileById(id, restoredBy = null) {
  const updateData = { is_active: true };
  if (restoredBy) updateData.updated_by = restoredBy;
  const [count] = await Profile.update(updateData, { where: { id, is_active: false } });
  return count;
}

export async function restoreProfiles(restoredBy = null) {
  const where = { is_active: false };
  const updateData = { is_active: true };
  if (restoredBy) updateData.updated_by = restoredBy;
  const [count] = await Profile.update(updateData, { where });
  return count;
}
