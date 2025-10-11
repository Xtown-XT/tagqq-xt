// controller/poster.controller.js
import { createPoster, getPosterCount, getPoster,deletePosterById , updatePosterById, softDeletePosterById, restorePosterById} from '../service/poster.service.js';

export const uploadPosters = async (req, res) => {
  try {
    const count = await getPosterCount();
    if (count >= 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Posters already exist. Please use PUT method to update.'
      });
    }

    const fileFields = ['poster1', 'poster2', 'poster3', 'poster4', 'poster5', 'poster6'];
    const posterData = {};

    fileFields.forEach((field) => {
      if (req.files && req.files[field] && req.files[field][0]) {
        posterData[field] = req.files[field][0].buffer.toString('base64'); // Store as base64
      }
    });

    posterData.is_active = true;

    const newPoster = await createPoster(posterData);

    return res.status(201).json({
      status: 'success',
      message: 'Posters uploaded successfully',
      data: newPoster
    });
  } catch (error) {
    console.error('Poster upload error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while uploading posters'
    });
  }
};

//get
export const getAllPosters = async (req, res) => {
  try {
    const { fields } = req.query;
    const selectedFields = fields ? fields.split(',') : null;

    const posters = await getPoster(); // Should return Sequelize model instances or raw rows

    const result = posters.map((poster) => {
      if (!selectedFields) {
        return poster; // Return the full DB record as-is
      }

      // If fields are specified, pick only those fields + ID
      const filtered = { id: poster.id };
      selectedFields.forEach((field) => {
        filtered[field] = poster[field] !== undefined ? poster[field] : null;
      });
      return filtered;
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('getAllPosters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posters',
    });
  }
};

//delete poster
export const deletePoster = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deletePosterById(id);
    if (deleted === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Poster not found or already deleted'
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Poster deleted permanently'
    });
  } catch (error) {
    console.error('Delete poster error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while deleting the poster'
    });
  }
};

//update
export const updatePosters = async (req, res) => {
  try {
    const { id } = req.params;
    const fileFields = ['poster1', 'poster2', 'poster3', 'poster4', 'poster5', 'poster6'];
    const updateData = {};
    

    // Handle uploaded files (base64 conversion)
    fileFields.forEach((field) => {
      if (req.files && req.files[field] && req.files[field][0]) {
        updateData[field] = req.files[field][0].buffer.toString('base64');
      } else if (req.body[field] === '') {
        // Explicitly empty string means remove image
        updateData[field] = null;
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid poster fields provided to update', 
      });
    }

    const [updatedCount] = await updatePosterById(id, updateData);

    if (updatedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Poster not found or nothing was updated',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Poster updated successfully',
    });
  } catch (error) {
    console.error('Poster update error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update poster',
    });
  }
};

//soft delete
export const softDeletePoster = async (req, res) => {
  const { id } = req.params;
  const result = await softDeletePosterById(id);

  if (result.status === 'not_found') {
    return res.status(404).json({ success: false, message: 'Poster not found' });
  }

  if (result.status === 'already_deleted') {
    return res.status(400).json({ success: false, message: 'Poster is already soft-deleted' });
  }

  return res.status(200).json({ success: true, message: 'Poster soft-deleted successfully' });
};

//restore
export const restorePoster = async (req, res) => {
  const { id } = req.params;
  const result = await restorePosterById(id);

  if (result.status === 'not_found') {
    return res.status(404).json({ success: false, message: 'Poster not found' });
  }

  if (result.status === 'already_active') {
    return res.status(400).json({ success: false, message: 'Poster is already active' });
  }

  return res.status(200).json({ success: true, message: 'Poster restored successfully' });
};
