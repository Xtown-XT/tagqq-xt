import express from "express";
import CaptainTransactionController from "../controller/captainTransactionController.js";
import * as CaptainTransactionDto from "../dto/captainTransactiondto.js";
import {
    validate,
    authenticate,
    customerDocUpload,
} from "../../middleware/index.js";

const router = express.Router();

router.post(
    "/captaintransaction",
    validate({
        body: CaptainTransactionDto.createCaptainTransactionControllerSchema,
    }),
    authenticate(["captain", "admin"]),
    CaptainTransactionController.create
);

router.post(
    "/captaintransaction/bulk",
    validate({
        body: CaptainTransactionDto.bulkCreateCaptainTransactionControllerSchema,
    }),
    authenticate(["captain", "admin"]),
    CaptainTransactionController.bulkCreate
);

router.get(
    "/captaintransaction",
    validate({
        query: CaptainTransactionDto.getCaptainTransactionListControllerSchema,
    }),
    authenticate(["captain", "admin"]),
    CaptainTransactionController.getAll
);

router.get(
    "/captaintransaction/:id",
    validate({ params: CaptainTransactionDto.getCaptainTransactionByIdSchema }),
    authenticate(["captain", "admin"]),
    CaptainTransactionController.getById
);

router.get(
  '/today-withdraw',
  authenticate(['admin', 'captain']), 
  CaptainTransactionController.getTodayWithdraw
);


router.put(
    "/captaintransaction/:id",
    validate({
        body: CaptainTransactionDto.updateCaptainTransactionControllerSchema,
        params: CaptainTransactionDto.getCaptainTransactionByIdSchema,
    }),
    authenticate(["captain", "admin"]),
    CaptainTransactionController.update
);

router.put(
    "/captaintransaction/bulk/update",
    validate({ body: CaptainTransactionDto.bulkUpdateCaptainTransactionSchema }),
    authenticate(["captain"]),
    CaptainTransactionController.bulkUpdate
);

router.delete(
    "/captaintransaction/:id",
    validate({ params: CaptainTransactionDto.getCaptainTransactionByIdSchema }),
    authenticate(["captain", "admin"]),
    CaptainTransactionController.delete
);

router.delete(
    "/captaintransaction/bulk",
    validate({ body: CaptainTransactionDto.bulkDeleteCaptainTransactionSchema }),
    authenticate(["captain", "admin"]),
    CaptainTransactionController.bulkDelete
);

router.post(
    "/captaintransaction/restore",
    validate({ params: CaptainTransactionDto.restoreCaptainTransactionSchema }),
    authenticate(["captain", "admin"]),
    CaptainTransactionController.restore
);

router.post(
    "/captaintransaction/bulk/restore",
    validate({ body: CaptainTransactionDto.bulkDeleteCaptainTransactionSchema }),
    authenticate(["captain", "admin"]),
    CaptainTransactionController.bulkRestore
);

router.get('/captaintransaction/withdraw/:captain_id', authenticate(["captain", "admin"]), CaptainTransactionController.getWithdrawableAmount);
export default router;
