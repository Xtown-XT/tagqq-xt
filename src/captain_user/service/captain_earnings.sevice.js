// services/captain_earnings.service.js
import { Op } from 'sequelize';
import Publicurl from '../../endUser/models/public_url.model.js';

export async function getCaptainTodayEarningsService(captainId) {
  if (!captainId) throw new Error('Captain ID is required');

  // Get today's date range (00:00 - 23:59)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch all completed/paid URLs for this captain today
  const urls = await Publicurl.findAll({
    where: {
      captain_id: captainId,
      status: { [Op.in]: ['Paid', 'Active'] }, // you can adjust the statuses considered as "earning"
      createdAt: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
    attributes: ['id', 'status', 'createdAt'], // we only need minimal info
  });

  // Example: Each "Paid" publicurl = ₹10 or 10 points
  const earningsPerUrl = 10;
  const totalEarnings = urls.length * earningsPerUrl;

  return {
    captain_id: captainId,
    date: startOfDay.toISOString().split('T')[0],
    total_urls: urls.length,
    total_earnings: totalEarnings,
    transactions: urls,
  };
}
