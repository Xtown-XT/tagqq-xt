// service/poster.service.js
import Posters from '../models/posters.models.js';

export const getPosterCount = async () => {
  return await Posters.count(); // returns number of poster records
};

export const createPoster = async (posterData) => {
  return await Posters.create(posterData);
};

export const getPoster = async () => {
  return await Posters.findAll({
    where: { is_active: true }
  });
};

export const deletePosterById = async (id) => {
  return await Posters.destroy({ where: { id } }); // Hard delete
};

export const updatePosterById = async (id, updateData) => {
  return await Posters.update(updateData, { where: { id } });
};

export const softDeletePosterById = async (id) => {
  const poster = await Posters.findByPk(id);
  if (!poster) return { status: 'not_found' };
  if (!poster.is_active) return { status: 'already_deleted' };

  await poster.update({ is_active: false });
  return { status: 'deleted' };
};

export const restorePosterById = async (id) => {
  const poster = await Posters.findByPk(id);
  if (!poster) return { status: 'not_found' };
  if (poster.is_active) return { status: 'already_active' };

  await poster.update({ is_active: true });
  return { status: 'restored' };
};
