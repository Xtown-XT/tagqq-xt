import { sequelize } from '../../db/index.js';
import { Op } from "sequelize";
import { startOfMonth, endOfMonth } from "date-fns";
import Enhancements from "../models/captain_suggestion.models.js";
import CaptainUser from "../../captain_user/models/captain_user.models.js";
import AdminUser from '../../admin_user/models/admin_user.models.js';
import EndUser from '../../endUser/models/user.model.js';

// RELATIONSHIPS
Enhancements.belongsTo(CaptainUser, { foreignKey: 'submitter_id', as: 'captain' });
CaptainUser.hasMany(Enhancements, { foreignKey: 'submitter_id' });

Enhancements.belongsTo(AdminUser, { foreignKey: 'submitter_id', as: 'admin' });
AdminUser.hasMany(Enhancements, { foreignKey: 'submitter_id' });

Enhancements.belongsTo(EndUser, { foreignKey: 'submitter_id', as: 'endUser' });
EndUser.hasMany(Enhancements, { foreignKey: 'submitter_id' });


// Create Enhancement
export async function createEnhancementService(payload, user) {
  const { docs_name, data } = payload;

  if (!user?.id) {
    throw new Error('Unauthorized. User information is missing.');
  }

  const [admin, captain, endUser] = await Promise.all([
    AdminUser.findByPk(user.id),
    CaptainUser.findByPk(user.id),
    EndUser.findByPk(user.id),
  ]);

  if (!admin && !captain && !endUser) {
    throw new Error('Access denied. User is not verified.');
  }

  return await Enhancements.create({
    docs_name,
    data,
    submitter_id: user.id,
    submitter_role: admin ? 'admin' : captain ? 'captain' : 'user',
    created_by: user.id,
  });
}



// Get All Enhancements 
// export async function getAllEnhancementsService({ docs_name, startDate, endDate, status, month, userId, role }) {
//   const where = { is_active: true };

//   if (docs_name) where.docs_name = docs_name;
//   if (status) where.status = status;

//   if (startDate && endDate) {
//     where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
//   } else if (month) {
//     const [year, monthValue] = month.split("-").map(Number);
//     const monthStart = startOfMonth(new Date(year, monthValue - 1));
//     const monthEnd = endOfMonth(new Date(year, monthValue - 1));
//     where.created_at = { [Op.between]: [monthStart, monthEnd] };
//   }

//   // ✅ If not admin, filter by current user's ID
//   if (role !== 'admin') {
//     // Depending on your model association, one of these might be correct:
//     where[Op.or] = [
//       { captain_id: userId },
//       { end_user_id: userId }
//     ];
//   }

//   return await Enhancements.findAll({
//     where,
//     include: [
//       { association: 'captain', attributes: ['id', 'name', 'phone'] },
//       { association: 'admin', attributes: ['id', 'admin_username', 'admin_email'] },
//       { association: 'endUser', attributes: ['id', 'username', 'email'] }
//     ],
//     order: [["created_at", "DESC"]],
//   });
// }


export async function getAllEnhancementsService({ docs_name, startDate, endDate, status, month, requester }) {
  const where = { is_active: true };

  if (docs_name) where.docs_name = docs_name;
  if (status) where.status = status;

  if (startDate && endDate) {
    where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  } else if (month) {
    const [year, monthValue] = month.split("-").map(Number);
    const monthStart = startOfMonth(new Date(year, monthValue - 1));
    const monthEnd = endOfMonth(new Date(year, monthValue - 1));
    where.created_at = { [Op.between]: [monthStart, monthEnd] };
  }

  // ✅ Role-based filtering (use correct columns)
  if (requester.role === "Captain") {
    where.submitter_id = requester.id;
    where.submitter_role = "captain";
  } else if (requester.role === "Admin") {
    // Admin sees all
  } else {
    // Unknown roles should not see anything
    where.id = null;
  }

  // ✅ Fetch enhancements
  return await Enhancements.findAll({
    where,
    include: [
      { association: "captain", attributes: ["id", "name", "phone"] },
      { association: "admin", attributes: ["id", "admin_username", "admin_email"] },
      { association: "endUser", attributes: ["id", "username", "email"] },
    ],
    order: [["created_at", "DESC"]],
  });
}



// Get by ID 
export async function getEnhancementByIdService(
  id,
  docs_name,
  startDate,
  endDate,
  status,
  month,
  user,
  submitter_id
) {
  const where = { id, is_active: true };

  if (docs_name) where.docs_name = docs_name;
  if (status) where.status = status;

  if (!user || !user.id) {
    throw new Error('Unauthorized: User information missing.');
  }

  const [admin, captain, endUser] = await Promise.all([
    AdminUser.findByPk(user.id),
    CaptainUser.findByPk(user.id),
    EndUser.findByPk(user.id),
  ]);

  if (!admin && !captain && !endUser) {
    throw new Error('Access denied: User does not exist in admin, captain, or end user tables.');
  }

  if (!user.role) {
    user.role = admin ? 'admin' : captain ? 'captain' : 'end_user';
  }

  if (user.role === 'admin') {
    if (submitter_id) where.submitter_id = submitter_id;
  } else {
    where.submitter_id = user.id;
  }

  if (startDate && endDate) {
    const cleanStart = new Date(startDate.trim());
    const cleanEnd = new Date(endDate.trim());
    if (isNaN(cleanStart) || isNaN(cleanEnd)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    where.created_at = { [Op.between]: [cleanStart, cleanEnd] };
  }

  else if (month) {
    const [year, monthValue] = month.split('-').map(Number);
    if (!year || !monthValue || monthValue < 1 || monthValue > 12) {
      throw new Error('Invalid month format. Use YYYY-MM');
    }
    where.created_at = {
      [Op.between]: [
        startOfMonth(new Date(year, monthValue - 1)),
        endOfMonth(new Date(year, monthValue - 1))
      ]
    };
  }

  const enhancement = await Enhancements.findOne({
    where,
    include: [
      { model: CaptainUser, as: 'captain', attributes: ['id', 'name', 'phone'] },
      { model: AdminUser, as: 'admin', attributes: ['id', 'admin_username', 'admin_email'] },
      { model: EndUser, as: 'endUser', attributes: ['id', 'username', 'email'] }
    ],
    paranoid: false,
  });

  if (!enhancement) throw new Error('Enhancement not found.');
  return enhancement;
}

// Update 
export async function updateEnhancementService(id, payload, user) {
  if (!user || !user.id) throw new Error('Unauthorized: User information missing.');

  const [admin, captain, endUser] = await Promise.all([
    AdminUser.findByPk(user.id),
    CaptainUser.findByPk(user.id),
    EndUser.findByPk(user.id),
  ]);

  if (!admin && !captain && !endUser) {
    throw new Error('Access denied: User does not exist in admin, captain, or end user tables.');
  }

  if (!user.role) user.role = admin ? 'admin' : captain ? 'captain' : 'end_user';

  const enhancement = await Enhancements.findByPk(id);
  if (!enhancement) throw new Error('Enhancement not found.');

  if (user.role !== 'admin' && enhancement.submitter_id !== user.id) {
    throw new Error('Forbidden: You can only edit your own enhancements.');
  }

  await enhancement.update({
    ...payload,
    updated_by: user.id,
  });

  return { message: 'Enhancement updated successfully.', data: enhancement };
}


// Soft Delete
export async function deleteEnhancementService(id, user) {
  if (!user || !user.id) throw new Error('Unauthorized: User information missing.');

  const [admin, captain, endUser] = await Promise.all([
    AdminUser.findByPk(user.id),
    CaptainUser.findByPk(user.id),
    EndUser.findByPk(user.id),
  ]);

  if (!admin && !captain && !endUser) {
    throw new Error('Access denied: User does not exist in admin, captain, or end user tables.');
  }

  if (!user.role) user.role = admin ? 'admin' : captain ? 'captain' : 'end_user';

  const enhancement = await Enhancements.findByPk(id);
  if (!enhancement) throw new Error('Enhancement not found.');

  if (user.role !== 'admin' && enhancement.submitter_id !== user.id) {
    throw new Error('Forbidden: You can only delete your own enhancements.');
  }

  await enhancement.update({ is_active: false, updated_by: user.id });
  return { message: 'Enhancement soft deleted successfully.' };
}


// Restore
export async function restoreEnhancementService(id, user) {
  if (!user || !user.id) throw new Error('Unauthorized: User information missing.');

  const [admin, captain, endUser] = await Promise.all([
    AdminUser.findByPk(user.id),
    CaptainUser.findByPk(user.id),
    EndUser.findByPk(user.id),
  ]);

  if (!admin && !captain && !endUser) {
    throw new Error('Access denied: User does not exist in admin, captain, or end user tables.');
  }

  if (!user.role) user.role = admin ? 'admin' : captain ? 'captain' : 'end_user';

  const enhancement = await Enhancements.findByPk(id);
  if (!enhancement) throw new Error('Enhancement not found.');

  if (user.role !== 'admin' && enhancement.submitter_id !== user.id) {
    throw new Error('Forbidden: You can only restore your own enhancements.');
  }

  await enhancement.update({ is_active: true, updated_by: user.id });
  return { message: 'Enhancement restored successfully.' };
}



// Hard Delete
export async function hardDeleteEnhancementService(id, user) {
  if (!user || !user.id) throw new Error('Unauthorized: User information missing.');

  const [admin, captain, endUser] = await Promise.all([
    AdminUser.findByPk(user.id),
    CaptainUser.findByPk(user.id),
    EndUser.findByPk(user.id),
  ]);

  if (!admin && !captain && !endUser) {
    throw new Error('Access denied: User does not exist in admin, captain, or end user tables.');
  }

  if (!user.role) user.role = admin ? 'admin' : captain ? 'captain' : 'end_user';

  const enhancement = await Enhancements.findByPk(id);
  if (!enhancement) throw new Error('Enhancement not found.');

  if (user.role !== 'admin' && enhancement.submitter_id !== user.id) {
    throw new Error('Forbidden: You can only delete your own enhancements.');
  }

  await enhancement.destroy();
  return { message: 'Enhancement permanently deleted.' };
}

