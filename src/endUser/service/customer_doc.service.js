// src/services/customer_doc.service.js
import CustomerDoc from '../models/customer_doc.models.js';
import User from '../models/user.model.js';
import { Sequelize, Op  } from 'sequelize';

User.hasMany(CustomerDoc, { foreignKey: 'user_id', as: 'customer_docs' });
CustomerDoc.belongsTo(User, { foreignKey: 'user_id', as: 'user_for_doc' });



//post
export const createCustomerDoc = async (data) => {
  return await CustomerDoc.create(data);
};
//getbyid
export const getCustomerDocById = async (id) => {
  return await CustomerDoc.findOne({
    where: { id, is_active: true },
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'createdBy', 'updatedBy']
    }
  });
};

//getall
export const getAllCustomerDocs = async ({
  page       = 1,
  limit      = 10,
  filters    = {},
  startDate,
  endDate,
  order      = 'DESC',
  isMaster   = false,
  currentUser = null
}) => {
  const offset = (page - 1) * limit;

  // 1. build base filters
  const whereClause = {
    ...(filters.user_id   && { user_id:     filters.user_id   }),
    ...(filters.doc_name  && { doc_name:    { [Op.like]: `%${filters.doc_name}%` } }),
    ...(filters.doc_type  && { doc_type:    filters.doc_type   }),
    ...(filters.mime_type && { mime_type:   { [Op.like]: `%${filters.mime_type}%` } }),
    ...(filters.file_size && { file_size:   { [Op.lte]: parseFloat(filters.file_size) } }),
  };

  // only non‑masters can filter active and “own” records
  if (!isMaster) {
    if (filters.hasOwnProperty('is_active')) {
      whereClause.is_active = filters.is_active === 'true';
    }
    if (currentUser?.id) {
      whereClause.user_id = currentUser.id;
    }
  }

  // 2. date filtering must happen before the DB call
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      const from = new Date(startDate);
      if (isNaN(from)) throw new Error(`Invalid startDate: ${startDate}`);
      whereClause.createdAt[Op.gte] = from;
    }
    if (endDate) {
      const to = new Date(endDate);
      if (isNaN(to)) throw new Error(`Invalid endDate: ${endDate}`);
      to.setDate(to.getDate() + 1); 
      whereClause.createdAt[Op.lt] = to;
    }
  }

  // OPTIONAL: log to verify
  // console.log('CustomerDocs whereClause:', JSON.stringify(whereClause, null, 2));

  // 3. run the Sequelize query
  const result = await CustomerDoc.findAndCountAll({
    where:      whereClause,
    ...(isMaster ? {} : { offset, limit }),
    order:      [['createdAt', order]],
    attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'updatedBy'] },
    include: [{
      model:      User,
      as:         'user',
      attributes: ['id','username','email','phone','referral_id']
    }]
  });

  return {
    total:       result.count,
    pages:       isMaster ? 1 : Math.ceil(result.count / limit),
    currentPage: isMaster ? 1 : page,
    docs:        result.rows,
  };
};

//get docs counts
// export const getUserDocTypeCounts = async ({ isMaster = false, currentUser = null } = {}) => {
//   const whereClause = {};

//   if (!isMaster && currentUser?.id) {
//     whereClause.user_id = currentUser.id;
//   }

//   const rows = await CustomerDoc.findAll({
//     attributes: [
//       'user_id',
//       'doc_type',
//       [fn('COUNT', col('CustomerDoc.id')), 'doc_count']
//     ],
//     where: whereClause,
//     include: [
//       {
//         model: User,
//         as: 'user',
//         attributes: ['username']
//       }
//     ],
//     group: ['user_id', 'doc_type', 'user.id', 'user.username'],
//     raw: true
//   });

//   // Format response as grouped object
//   const grouped = {};

//   rows.forEach(row => {
//     const userId = row.user_id;
//     const username = row['user.username'];
//     const docType = row.doc_type;
//     const count = parseInt(row.doc_count, 10);

//     if (!grouped[userId]) {
//       grouped[userId] = {
//         user_id: userId,
//         username,
//         doc_types: {}
//       };
//     }

//     grouped[userId].doc_types[docType] = count;
//   });

//   return Object.values(grouped);
// };


export const getGroupedUserDocCounts = async ({ page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;

  try {
    // Count total users (for pagination metadata)
    const totalUsers = await User.count();

    // Fetch paginated users with their customer_docs
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'phone'],
      include: [
        {
          model: CustomerDoc,
          as: 'customer_docs',
          attributes: ['doc_type'],
          required: false,
          separate: true, // Important to avoid JOIN issues with pagination
        },
      ],
      limit,
      offset,
      order: [['username', 'ASC']],
    });

    // Process result to group doc_type counts
    const data = users.map(user => {
      const doc_types = {};

      user.customer_docs.forEach(doc => {
        if (doc.doc_type) {
          doc_types[doc.doc_type] = (doc_types[doc.doc_type] || 0) + 1;
        }
      });

      return {
        user_id: user.id,
        username: user.username,
        userphone: user.phone,
        useremail: user.email,
        doc_types,
      };
    });

    return {
      data,
      meta: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit,
      },
    };
  } catch (error) {
    console.error('Error fetching grouped document counts:', error);
    throw new Error('Failed to fetch document counts');
  }
};





//put
export const updateCustomerDoc = async (id, data) => {
  const doc = await CustomerDoc.findByPk(id);
  if (!doc || !doc.is_active) return null;
  await doc.update(data);
  return doc;
};

//soft delete
export const softDeleteCustomerDoc = async (id) => {
  const doc = await CustomerDoc.findByPk(id);
  if (!doc || !doc.is_active) return null;
  await doc.update({ is_active: false });
  return doc;
};

//restore 
export const restoreCustomerDoc = async (id) => {
  const doc = await CustomerDoc.findByPk(id);
  if (!doc || doc.is_active) return null;
  await doc.update({ is_active: true });
  return doc;
};
