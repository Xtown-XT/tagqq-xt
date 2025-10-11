import { Op, fn, col } from 'sequelize';
import { sequelize } from '../../db/index.js';
import CaptainCheckin from '../models/captain_checkins.models.js';
import CaptainUser from '../models/captain_user.models.js';
import AdminUser from '../../admin_user/models/admin_user.models.js';
import { startOfDay, endOfDay, parseISO, differenceInSeconds, startOfWeek, endOfWeek, startOfMonth, endOfMonth,format   } from 'date-fns';
import exportToPdf from '../../utils/exportPdf.js';
import dayjs from 'dayjs';



// Relations
CaptainUser.hasMany(CaptainCheckin, {
  foreignKey: 'captain_id',
  as: 'checkins',
});

CaptainCheckin.belongsTo(CaptainUser, {
  foreignKey: 'captain_id',
  as: 'captain',
});

// 1. Create
export const createCheckinService = async ({ captain_id, type, location, is_master }) => {
  const lastRecord = await CaptainCheckin.findOne({
    where: { captain_id },
    order: [['created_at', 'DESC']],
  });

  if (lastRecord) {
    if (lastRecord.type === 'checkin' && type === 'checkin') {
      throw new Error('Captain already checked in. Please checkout before checking in again.');
    }
    if (lastRecord.type === 'checkout' && type === 'checkout') {
      throw new Error('Captain already checked out. Please checkin before checking out again.');
    }
  } else {
    if (type === 'checkout') {
      throw new Error('First action cannot be checkout. Please checkin first.');
    }
  }

  return await CaptainCheckin.create({ captain_id, type, location, is_master });
};

// 2. Get All
export const getAllCheckinsService = async ({
  startDate,
  endDate,
  page = 1,
  limit = 10,
  captainName,
  is_master,
  sortBy = 'created_at',
  sortOrder = 'DESC',
  checkinType,
}) => {
  const where = {
    deleted_at: null,
  };

  //  Date Range Filter
  if (startDate && endDate) {
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    if (start > end) {
      return { total: 0, page: +page, limit: +limit, data: [] };
    }
    where.created_at = { [Op.between]: [start, end] };
  }

  if (checkinType && ['checkin', 'checkout'].includes(checkinType)) {
    where.type = checkinType;
  }

  const include = [
    {
      model: CaptainUser,
      as: 'captain',
      ...(captainName && {
        where: { name: { [Op.like]: `%${captainName}%` } },
      }),
    },
  ];

  const queryOptions = {
    where,
    include,
    order: [[sortBy, sortOrder]],
  };

  if (!is_master) {
    queryOptions.limit = +limit;
    queryOptions.offset = (page - 1) * limit;
  }

  const { count, rows } = await CaptainCheckin.findAndCountAll(queryOptions);

  return {
    total: count,
    page: +page,
    limit: +limit,
    data: rows,
  };
};




// 3. Get By ID + Total Duration
export const getCheckinByIdService = async (captainId, dateString) => {
  const date = parseISO(dateString);
  const start = startOfDay(date);
  const end = endOfDay(date);

  // ✅ Fetch all checkins for the given date
  const checkins = await CaptainCheckin.findAll({
    where: {
      captain_id: captainId,
      created_at: { [Op.between]: [start, end] },
    },
    order: [['created_at', 'ASC']],
    raw: true,
  });

  // Calculate duration
  let totalSeconds = 0;
  for (let i = 0; i < checkins.length - 1; i++) {
    const current = checkins[i];
    const next = checkins[i + 1];
    if (current.type === 'checkin' && next.type === 'checkout') {
      const diff = differenceInSeconds(new Date(next.created_at), new Date(current.created_at));
      if (diff > 0) totalSeconds += diff;
    }
  }
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const formattedDuration = `${hours}:${minutes}:${seconds}`;

  // Active days
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const activeDaysResult = await CaptainCheckin.findAll({
    where: {
      captain_id: captainId,
      created_at: { [Op.between]: [monthStart, monthEnd] },
    },
    attributes: [[sequelize.fn('DATE', sequelize.col('created_at')), 'active_date']],
    group: [sequelize.fn('DATE', sequelize.col('created_at'))],
    raw: true,
  });

  const activeDaysCount = activeDaysResult.length;

  // ✅ Most recent check-in
  const recentCheckinType = checkins.length > 0 ? checkins[checkins.length - 1].type : null;
  const recentCheckinTime = checkins.length > 0 
    ? format(new Date(checkins[checkins.length - 1].created_at), 'HH:mm:ss')
    : null;

  // ✅ Full check-in log (type + time)
  const checkinsLog = checkins.map(chk => ({
    type: chk.type,
    time: format(new Date(chk.created_at), 'HH:mm:ss'),
  }));

  return {
    date: dateString,
    captainId,
    totalCheckins: checkins.length,
    totalDuration: formattedDuration,
    activeDays: activeDaysCount,
    checkins: recentCheckinType ? [{ type: recentCheckinType }] : [],
    checkinsLog, // ✅ Added
  };
};

// 4. Update
export const updateCheckinService = async (captainId, date, updateData = {}) => {
  if (!captainId || !date) {
    throw new Error('captainId and date are required');
  }

  const parsedDate = parseISO(date);
  const dayStart = startOfDay(parsedDate);
  const dayEnd = endOfDay(parsedDate);

  const checkin = await CaptainCheckin.findOne({
    where: {
      captain_id: captainId,
      created_at: { [Op.between]: [dayStart, dayEnd] },
    },
    order: [['created_at', 'ASC']],
  });

  if (!checkin) return null;

  const fieldsToUpdate = {};
  for (const key of ['type', 'location', 'is_active']) {
    if (updateData[key] !== undefined && updateData[key] !== null) {
      fieldsToUpdate[key] = updateData[key];
    }
  }

  await checkin.update(fieldsToUpdate);

  const allCheckins = await CaptainCheckin.findAll({
    where: {
      captain_id: captainId,
      created_at: { [Op.between]: [dayStart, dayEnd] },
    },
    order: [['created_at', 'ASC']],
  });

  let totalSeconds = 0;
  for (let i = 0; i < allCheckins.length - 1; i++) {
    const current = allCheckins[i];
    const next = allCheckins[i + 1];
    if (current.type === 'checkin' && next.type === 'checkout') {
      const diff = differenceInSeconds(new Date(next.created_at), new Date(current.created_at));
      if (diff > 0) totalSeconds += diff;
    }
  }

  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const formattedDuration = `${hours}:${minutes}:${seconds}`;

  return {
    updatedCheckin: {
      id: checkin.id,
      type: checkin.type,
      location: checkin.location,
      is_active: checkin.is_active,
      created_at: checkin.created_at,
      updated_at: checkin.updated_at,
    },
    totalCheckins: allCheckins.length,
    totalDuration: formattedDuration,
  };
};

// 5. Soft Delete 
export const deleteCheckinService = async (checkinId) => {
  if (!checkinId) return null;

  const record = await CaptainCheckin.findOne({
    where: { id: checkinId },
  });

  if (!record) return null;

  await record.destroy(); // Soft delete
  return record;
};

// 6. Restore
export const restoreCheckinService = async (checkinId, captainId, isAdmin = false) => {
  console.log(`Restoring check-in: ID=${checkinId}, CaptainID=${captainId}, isAdmin=${isAdmin}`);

  const whereClause = {
    id: checkinId,
    deleted_at: { [Op.ne]: null },
  };

  if (!isAdmin) {
    whereClause.captain_id = captainId;
  }

  const record = await CaptainCheckin.findOne({
    where: whereClause,
    paranoid: false,
  });

  if (!record) {
    console.warn('No matching soft-deleted check-in found');
    return null;
  }

  await CaptainCheckin.restore({ where: { id: checkinId } });
  return record;
};


// 7. Export All Check-ins to PDF
export const exportAllCheckinsPdfService = async (params, user) => {
  const { type, date, startDate, endDate, captainName, sortBy, sortOrder } = params;

  const adminRecord = await AdminUser.findByPk(user.id);
  const captainRecord = await CaptainUser.findByPk(user.id);

  const isAdmin = !!adminRecord;
  const isCaptain = !!captainRecord;

  if (!isAdmin && !isCaptain) {
    throw new Error('Unauthorized user');
  }

  if (isAdmin && !['daily', 'weekly', 'monthly', 'yearly'].includes(type)) {
    throw new Error('Invalid report type for admin. Use daily, weekly, monthly, or yearly.');
  }

  if (isCaptain && !['weekly', 'monthly'].includes(type)) {
    throw new Error('Captains can only export weekly or monthly reports.');
  }

  let finalStartDate = startDate;
  let finalEndDate = endDate;
  if (type === 'daily') {
    if (!date) throw new Error('Date is required for daily reports.');
    finalStartDate = finalEndDate = date;
  }

  const { data } = await getAllCheckinsService({
    type,
    startDate: finalStartDate,
    endDate: finalEndDate,
    captainName,
    sortBy,
    sortOrder,
    limit: 100000,
  });

  if (!data.length) throw new Error('No attendance records found.');

  const captainReports = {};

  data.forEach((entry) => {
    const captainId = entry.captain_id;

    if (!captainReports[captainId]) {
      captainReports[captainId] = {
        captain: entry.captain,
        totalDurationSeconds: 0,
        totalCheckins: 0,
        firstCheckinDate: dayjs(entry.created_at).format('YYYY-MM-DD'),
        checkins: [],
      };
    }

    captainReports[captainId].checkins.push(entry);
  });

  Object.values(captainReports).forEach((report) => {
    report.checkins.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    let lastCheckin = null;

    report.checkins.forEach((entry) => {
      if (entry.type === 'checkin') {
        lastCheckin = entry;
        report.totalCheckins++;
      } else if (entry.type === 'checkout' && lastCheckin) {
        const start = dayjs(lastCheckin.created_at);
        const end = dayjs(entry.created_at);
        report.totalDurationSeconds += end.diff(start, 'second');
        lastCheckin = null;
      }
    });

    if (lastCheckin) {
      const start = dayjs(lastCheckin.created_at);
      const end = dayjs(finalEndDate).endOf('day');
      report.totalDurationSeconds += end.diff(start, 'second');
    }
  });

  // Prepare PDF Data 
  const pdfData = {
    fromDate: finalStartDate,
    toDate: finalEndDate,
    type,
    records: Object.values(captainReports).map((report, index) => ({
      sNo: index + 1,
      date: report.firstCheckinDate,
      name: report.captain.name,
      totalCheckins: report.totalCheckins,
      duration: formatDuration(report.totalDurationSeconds),
    })),
  };

  // Export PDF
  return await exportToPdf('captain-checkins-report.ejs', { ...pdfData });
};

// Helper: Convert seconds → HH:mm:ss
const formatDuration = (totalSeconds) => {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};