import {
  createProfile, getProfiles, getProfileById, getProfileCompletion, updateProfile,
  deleteProfileById, deleteProfiles, restoreProfileById, restoreProfiles
}
  from '../service/profile.service.js';
import UserConfig from '../../endUser/models/userConfig.model.js'

const profileController = {
  async create(req, res) {
    console.log('→ Content-Type:', req.headers['content-type']);
    console.log('→ req.body      :', req.body);
    console.log('→ req.files     :', req.files);

    try {
      let base64Image = null;
      const uploadedFile = req.files?.profile_image?.[0];
      if (uploadedFile && uploadedFile.buffer) {
        base64Image = uploadedFile.buffer;
        console.log('✅ Received profile_image');
      }

      let parsedData = null;
      if (req.body.data) {
        if (typeof req.body.data === 'string') {
          try {
            parsedData = JSON.parse(req.body.data);
          } catch (parseErr) {
            console.error('❌ Invalid JSON in "data" field:', parseErr);
            return res.sendError('Invalid JSON in data field', 400);
          }
        } else {
          parsedData = req.body.data;
        }
      }

      // Determine user vs captain
      const isCaptain = !!req.captain;
      const user_id = !isCaptain ? (req.body.user_id ?? req.user?.id) : null;
      const captain_id = isCaptain ? req.captain.id : null;
      const created_by = req.user?.id ?? req.userAgent?.id ?? req.admin?.id ?? req.captain?.id;

      const payload = {
        docs_name: req.body.docs_name,
        data: parsedData,
        user_id,
        captain_id,
        id_number: req.body.id_number ?? (user_id || captain_id),
        created_by,
        profile_image: base64Image,
      };

      console.log('🛠️  Final payload:', payload);

      const profile = await createProfile(payload);

      if (profile._options && profile._options.isNewRecord === false) {
        return res.sendError('Profile already exists', 409);
      }

      return res.sendSuccess(profile, 'Profile created successfully', 201);

    } catch (err) {
      console.error('❌ Failed to create profile:', err);
      return res.sendError('Failed to create profile', 500, err.message);
    }
  },


  async list(req, res) {
    try {
      const {
        includeInactive,
        is_active,
        docs_name,
        search,
        startDate,
        endDate,
        page,
        limit,
        orderBy,
        order,
      } = req.query;

      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const orderDir = ['asc', 'desc'].includes((order || '').toLowerCase())
        ? order.toLowerCase()
        : 'asc';

      // figure out role context
      const isEndUser = !!req.user;
      const isCaptain = !!req.captain;

      // call getProfiles with auth context
      const { rows, count } = await getProfiles({
        includeInactive: includeInactive === 'true' || includeInactive === true,
        is_active: is_active === undefined ? undefined
          : is_active === 'true' || is_active === true,
        docs_name,
        search,
        startDate,
        endDate,
        page: pageNum,
        limit: limitNum,
        orderBy: orderBy || 'createdAt',
        order: orderDir,

        // pass only the right contexts
        currentUser: isEndUser ? req.user : null,        // end-user
        currentAgent: req.userAgent || null,             // agent
        currentCaptain: isCaptain ? req.captain : null,  // captain
        isAdmin: Boolean(req.admin),                     // admin

        // ← NEW: pass in auth context flags
        currentUser: req.user,        // end-user
        currentAgent: req.userAgent,   // agent
        isAdmin: Boolean(req.admin),
        captain: req.captain || null,

      });

      const totalPages = Math.ceil(count / limitNum);
      const currentPage = pageNum;

      return res.sendSuccess(
        {
          data: rows,
          meta: { total: count, totalPages, currentPage }
        },
        'Profiles retrieved successfully'
      );
    } catch (err) {
      console.error('Error in controller list():', err);
      return res.sendError('Failed to retrieve profiles', 500, err);
    }
  },



  async getCompletion(req, res) {
    try {
      const user_id = req.params.user_id || req.user?.id; // ✅ Use param or logged-in user

      if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // ✅ Call the service
      const result = await getProfileCompletion(user_id);

      return res.status(200).json({
        success: true,
        message: 'Profile completion percentage fetched successfully',
        data: result,
      });
    } catch (err) {
      console.error('❌ Error in getProfileCompletionController:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to calculate profile completion',
        details: err.message,
      });
    }
  },

  async getById(req, res) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const profile = await getProfileById(req.params.id, includeInactive);
      if (!profile) return res.sendError('Profile not found', 404);
      return res.sendSuccess(profile, 'Profile retrieved successfully');
    } catch (err) {
      return res.sendError('Failed to retrieve profile', 500, err);
    }
  },

  async update(req, res) {
    try {
      // 1. Who’s doing this?
      const updatedBy = req.user?.id
        ?? req.userAgent?.id
        ?? req.admin?.id;

      // 2. Start with your Zod‑validated body + updater ID
      const updatePayload = {
        ...req.body,
        updated_by: updatedBy,
      };

      // 3. If a profile_image was uploaded, grab its buffer
      if (
        req.files &&
        Array.isArray(req.files.profile_image) &&
        req.files.profile_image.length
      ) {
        // Multer memoryStorage gives us `buffer`
        const fileObj = req.files.profile_image[0];
        updatePayload.profile_image = fileObj.buffer;
      }

      console.log('→ Saving payload:', {
        ...updatePayload,
        profile_image: updatePayload.profile_image
          ? `<Buffer length=${updatePayload.profile_image.length}>`
          : null
      });

      // 4. Run the update
      const [count] = await updateProfile(req.params.id, updatePayload);
      if (count === 0) {
        return res.sendError('Profile not found or inactive', 404);
      }

      // 5. Fetch & return the new record
      const profile = await getProfileById(req.params.id, true);
      return res.sendSuccess(profile, 'Profile updated successfully');
    } catch (err) {
      console.error('❌ Profile update failed:', err);
      return res.sendError('Failed to update profile', 500, err.message);
    }
  },


  async remove(req, res) {
    try {
      const force = req.query.force === 'true';
      const deletedBy = req.user?.id || null;
      const count = await deleteProfileById(req.params.id, force, deletedBy);
      if (count === 0) return res.sendError('Profile not found or already deleted', 404);
      if (force) return res.sendStatus(204);
      return res.sendSuccess({ deleted: count }, 'Profile deleted successfully');
    } catch (err) {
      return res.sendError('Failed to delete profile', 500, err);
    }
  },

  async bulkRemove(req, res) {
    try {
      const force = req.query.force === 'true';
      const deletedBy = req.user?.id || null;
      const count = await deleteProfiles(force, deletedBy);
      return res.sendSuccess({ deleted: count }, 'Profiles deleted successfully');
    } catch (err) {
      return res.sendError('Failed to delete profiles', 500, err);
    }
  },

  async restoreById(req, res) {
    try {
      const restoredBy = req.user?.id || null;
      const count = await restoreProfileById(req.params.id, restoredBy);
      if (count === 0) return res.sendError('Profile not found or not deleted', 404);
      return res.sendSuccess({ restored: count }, 'Profile restored successfully');
    } catch (err) {
      return res.sendError('Failed to restore profile', 500, err);
    }
  },

  async bulkRestore(req, res) {
    try {
      const restoredBy = req.user?.id || null;
      const count = await restoreProfiles(restoredBy);
      return res.sendSuccess({ restored: count }, 'Profiles restored successfully');
    } catch (err) {
      return res.sendError('Failed to restore profiles', 500, err);
    }
  },
};

export default profileController;
