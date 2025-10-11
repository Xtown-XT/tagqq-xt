// src/blooddonor/service/blood_donor.service.js
import BloodDonor from '../models/blooddonor.models.js';
import { Op } from 'sequelize';
import BloodGroup from '../models/bloodgroup.models.js';
import District from '../../endUser/models/address.district.models.js';

import State from '../../endUser/models/address.state.models.js';
import Country from '../../endUser/models/address.country.models.js';


// Association: District → State
District.belongsTo(State, {
  foreignKey: 'state_id',
  as: 'state'
});

// Association: State → Country
State.belongsTo(Country, {
  foreignKey: 'country_id',
  as: 'country'
});

// Create
export const createBloodDonor = async (data) => {
  return await BloodDonor.create(data);
};

// Get by ID
export const getBloodDonorById = async (id) => {
  return await BloodDonor.findOne({
    where: { id, is_active: true },
    attributes: { exclude: ['created_at', 'updated_at', 'created_by', 'updated_by', 'blood_group_id', 'district_id'] },
    include: [
      {
        model: BloodGroup,
        as: 'blood_group',
        attributes: ['id', 'name']
      },
      {
        model: District,
        as: 'district',
        attributes: ['id', 'name']
      }
    ]
  });
};


// Get all
// export const getAllBloodDonors = async ({ page, limit, filters, order }) => {
//   const offset = (page - 1) * limit;

//   const donorWhere = {
//     ...(filters.name && { name: { [Op.like]: `%${filters.name}%` } }),
//     ...(filters.mobile_no && { mobile_no: { [Op.like]: `%${filters.mobile_no}%` } }),
//     ...(filters.hasOwnProperty('is_active') && { is_active: filters.is_active === 'true' }),
//   };

//   const includeOptions = [];

//   // Blood Group filter with INNER JOIN if filtering
//   includeOptions.push({
//     model: BloodGroup,
//     as: 'blood_group',
//     attributes: ['id', 'name'],
//     required: !!filters.blood_group, // INNER JOIN if filtering
//     where: filters.blood_group
//       ? {
//         id: filters.blood_group, 
//       }
//       : undefined
//   });


//   // District with always LEFT JOIN
//   includeOptions.push({
//     model: District,
//     as: 'district',
//     attributes: ['id', 'name'],
//     required: false, // Always LEFT OUTER JOIN
//     where: filters.district
//       ? {
//         id: filters.district, // Compare directly to ID
//         ...(filters.district_id ? { id: filters.district_id } : {})
//       }
//       : undefined
//   });

//   const result = await BloodDonor.findAndCountAll({
//     where: donorWhere,
//     offset,
//     limit,
//     order: [['created_at', order]],
//     attributes: {
//       exclude: [
//         'created_by',
//         'updated_by',
//         'deleted_by',
//         'blood_group_id',
//         'district_id'
//       ]
//     },
//     include: includeOptions
//   });

//   return {
//     total: result.count,
//     pages: Math.ceil(result.count / limit),
//     currentPage: page,
//     records: result.rows
//   };
// };


export const getAllBloodDonors = async ({ page, limit, filters, order, is_master = false }) => {
  const donorWhere = {
    ...(filters.name && { name: { [Op.like]: `%${filters.name}%` } }),
    ...(filters.mobile_no && { mobile_no: { [Op.like]: `%${filters.mobile_no}%` } }),
    ...(filters.hasOwnProperty('is_active') && { is_active: filters.is_active === 'true' }),
    ...(filters.district && { district_id: filters.district })
  };

  const includeOptions = [
    {
      model: BloodGroup,
      as: 'blood_group',
      attributes: ['id', 'name'],
      required: !!filters.blood_group,
      where: filters.blood_group
        ? {
          id: filters.blood_group,
          ...(filters.blood_group_id ? { id: filters.blood_group_id } : {})
        }
        : undefined
    },
    {
      model: District,
      as: 'district',
      attributes: ['id', 'name'],
      required: false,
      where: filters.district
        ? {
          id: filters.district,
          ...(filters.district_id ? { id: filters.district_id } : {})
        }
        : undefined,
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name'],
          include: [
            {
              model: Country,
              as: 'country',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    }
  ];


  const queryOptions = {
    where: donorWhere,
    order: [['created_at', order]],
    attributes: {
      exclude: ['created_by', 'updated_by', 'deleted_by', 'blood_group_id', 'district_id']
    },
    include: includeOptions
  };

  if (!is_master && page !== undefined && limit !== undefined) {
    queryOptions.offset = (page - 1) * limit;
    queryOptions.limit = limit;
  }

  const result = await BloodDonor.findAndCountAll(queryOptions);

  return {
    total: result.count,
    pages: is_master ? 1 : Math.ceil(result.count / limit),
    currentPage: is_master ? 1 : page,
    records: result.rows
  };
};



// Update
export const updateBloodDonor = async (id, data) => {
  const donor = await BloodDonor.findByPk(id);
  if (!donor || !donor.is_active) return null;
  await donor.update(data);
  return donor;
};

// Soft delete
export const softDeleteBloodDonor = async (id) => {
  const donor = await BloodDonor.findByPk(id);
  if (!donor || !donor.is_active) return null;
  await donor.update({ is_active: false });
  return donor;
};

// Restore
export const restoreBloodDonor = async (id) => {
  const donor = await BloodDonor.findByPk(id);
  if (!donor || donor.is_active) return null;
  await donor.update({ is_active: true });
  return donor;
};

// bulk upload
export const bulkCreateBloodDonors = async (donors, created_by) => {
  const createdDonors = [];

  for (const donor of donors) {
    const { blood_group, district, ...rest } = donor;

    const bloodGroupRecord = await BloodGroup.findOne({
      where: { name: blood_group, is_active: true },
    });

    const districtRecord = await District.findOne({
      where: { name: district, is_active: true },
    });

    if (!bloodGroupRecord || !districtRecord) {
      throw new Error(
        `Invalid blood group or district for donor: ${donor.name}`
      );
    }

    const newDonor = {
      ...rest,
      blood_group_id: bloodGroupRecord.id,
      district_id: districtRecord.id,
      created_by,
      is_active: true,
    };

    const created = await BloodDonor.create(newDonor);
    createdDonors.push(created);
  }

  return createdDonors;
};

// Bulk Create Donors
export const bulkCreateBloodDonorsexcell = async (donors, created_by) => {
  const createdDonors = [];

  for (const donor of donors) {
    const { blood_group, district, ...rest } = donor;

    const bloodGroupRecord = await BloodGroup.findOne({
      where: { name: blood_group, is_active: true },
    });

    const districtRecord = await District.findOne({
      where: { name: district, is_active: true },
    });

    if (!bloodGroupRecord || !districtRecord) {
      throw new Error(`Invalid blood group or district for donor: ${donor.name}`);
    }

    const newDonor = {
      ...rest,
      blood_group_id: bloodGroupRecord.id,
      district_id: districtRecord.id,
      created_by,
      is_active: true,
    };

    const created = await BloodDonor.create(newDonor);
    createdDonors.push(created);
  }

  return createdDonors;
};