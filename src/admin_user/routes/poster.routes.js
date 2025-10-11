// routes/poster.routes.js
import express from 'express';
import { uploadPosters, getAllPosters, deletePoster , updatePosters,softDeletePoster,restorePoster} from '../controller/poster.controller.js';

import { customerDocUpload,validate,  authenticate } from '../../middleware/index.js';
import { getPosterQuerySchema , updatePosterBodySchema, updatePosterParamSchema} from '../dto/poster.dto.js';

const router = express.Router();

router.post('/poster',authenticate(['admin']), customerDocUpload,uploadPosters);
router.get('/poster',validate(getPosterQuerySchema), authenticate(['end_user','admin']),getAllPosters);
router.delete('/poster/hard-delete/:id', authenticate(['admin']), deletePoster);
router.put('/poster/:id',authenticate(['admin']),customerDocUpload,updatePosters);
router.delete('/poster/soft-delete/:id',authenticate(['admin']), softDeletePoster);
router.patch('/poster/restore/:id',authenticate(['admin']), restorePoster);
export default router;