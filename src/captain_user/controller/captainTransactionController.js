import CaptainTransactionService from '../service/captainTransactionService.js';

import * as CaptainTransactionDto from '../dto/captainTransactiondto.js';
import exportToPdf from '../../utils/exportPdf.js';

const CaptainTransactionController = {
    // Create one
    async create(req, res) {
        try {
            const data = CaptainTransactionDto.createCaptainTransactionControllerSchema.parse(req.body);
            data.captain_id = req.captain.id ? req.captain.id : req.admin.id;
            const created = await CaptainTransactionService.create(data);
            res.sendSuccess(created, 'Captain transaction created successfully');
        } catch (err) {
            res.sendError(err.message, 422, err.errors || []);
        }
    },

    // Bulk create
    async bulkCreate(req, res) {
        try {
            const data = CaptainTransactionDto.bulkCreateCaptainTransactionControllerSchema.parse(req.body);
            data.captain_id = req.captain.id ? req.captain.id : req.admin.id;
            const created = await CaptainTransactionService.bulkCreate(data);
            res.sendSuccess(created, 'Captain transactions created successfully');
        } catch (err) {
            res.sendError(err.message, 422, err.errors || []);
        }
    },

    // Get all with filters
    async getAll(req, res) {
        try {
            const params = req.query;

            const isAdmin = !!req.admin;
            const isCaptain = !!req.captain;

            // Role-based filtering
            if (isCaptain && !isAdmin) {
                params.captain_id = req.captain.id;
                params.is_master = "true"; // So soft-deleted entries also get considered
            }

            const list = await CaptainTransactionService.getAll(params);

            if (params.export === 'pdf') {
                const pdfBuffer = await exportToPdf(
                    'captain-transaction-report.ejs',
                    {
                        date: new Date().toLocaleDateString(),
                        totalCount: list.total,
                        transactions: list.data
                    }
                );

                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="captain-transactions.pdf"',
                });

                return res.send(pdfBuffer);
            }

            res.sendSuccess(list, 'Captain transactions fetched successfully');
        } catch (err) {
            res.sendError(err.message, 422, err.errors || []);
        }
    },


    // Today's withdraw details for a captain
async getTodayWithdraw(req, res) {
    try {
        const user = req.admin || req.captain; // ✅ Extract user from JWT middleware
        const { captain_id } = req.query; // ✅ Change to query param (optional for admin)

        const result = await CaptainTransactionService.getTodayWithdraw(user, captain_id);
        return res.status(200).json({
            message: 'Today withdraw details fetched successfully',
            data: result,
        });
    } catch (error) {
        console.error('Error fetching withdraw details:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
},


    // Get one by ID
    async getById(req, res) {
        try {
            const params = CaptainTransactionDto.getCaptainTransactionByIdSchema.parse(req.params);
            const item = await CaptainTransactionService.getById(params);
            if (!item) return res.sendError('Transaction not found', 404);
            res.sendSuccess(item, 'Captain transaction fetched successfully');
        } catch (err) {
            res.sendError(err.message, 422, err.errors || []);
        }
    },

    // Update single
    async update(req, res) {
        try {
            const id = req.params.id;
            const data = CaptainTransactionDto.updateCaptainTransactionControllerSchema.parse({ ...req.body });
            data.id = id;
            data.captain_id = req.captain.id;
            const updated = await CaptainTransactionService.update(id, data);
            res.sendSuccess(updated, 'Captain transaction updated successfully');
        } catch (err) {
            res.sendError(err.message, 422, err.errors || []);
        }
    },

    // Bulk update
    async bulkUpdate(req, res) {
        try {
            const data = CaptainTransactionDto.bulkUpdateCaptainTransactionControllerSchema.parse(req.body);
            data.captain_id = req.captain.id;
            const result = await CaptainTransactionService.bulkUpdate(data);
            res.sendSuccess(result, 'Captain transactions updated successfully');
        } catch (err) {
            res.sendError(err.message, 422, err.errors || []);
        }
    },

    // Delete one
    async delete(req, res) {
        try {
            const params = CaptainTransactionDto.deleteCaptainTransactionSchema.parse(req.params);
            await CaptainTransactionService.delete(params);
            res.sendSuccess(null, 'Captain transaction deleted successfully');
        } catch (err) {
            res.sendError(err.message, 422, err.errors || []);
        }
    },

    // Bulk delete
    async bulkDelete(req, res) {
        try {
            const params = CaptainTransactionDto.bulkDeleteCaptainTransactionSchema.parse(req.body);
            await CaptainTransactionService.bulkDelete(params);
            res.sendSuccess(null, 'Captain transactions deleted successfully');
        } catch (err) {
            res.sendError(err.message, 422, err.errors || []);
        }
    },

    // Restore
    async restore(req, res) {
        try {
            const params = CaptainTransactionDto.restoreCaptainTransactionSchema.parse(req.body);
            const restored = await CaptainTransactionService.restore(params);
            res.sendSuccess(restored, 'Captain transaction restored successfully');
        } catch (err) {
            res.sendError(err.message, 422, err.errors || []);
        }
    },

    // Bulk restore
    async bulkRestore(req, res) {
        try {
            const params = CaptainTransactionDto.bulkDeleteCaptainTransactionSchema.parse(req.body);
            const restored = await CaptainTransactionService.bulkRestore(params);
            res.sendSuccess(restored, 'Captain transactions restored successfully');
        } catch (err) {
            res.sendError(err.message, 422, err.errors || []);
        }
    },

    // Get Withdrawable Amount for Captain
    async getWithdrawableAmount(req, res) {
        try {
            const { captain_id } = req.params;

            if (!captain_id) {
                return res.sendError('captain_id is required', 400);
            }

            const data = await CaptainTransactionService.calculateWithdrawForCaptain(captain_id);

            res.sendSuccess(data, 'Withdrawable amount fetched successfully');
        } catch (err) {
            console.error('Withdraw Error:', err);
            res.sendError('Internal server error', 500, err.errors || []);
        }
    }

};





export default CaptainTransactionController;
