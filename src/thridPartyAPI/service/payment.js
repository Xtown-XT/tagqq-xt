import { Payment, associateModels } from "../models/index.js"; // Adjust the path if needed
import { Op } from "sequelize";
import User from '../../endUser/models/user.model.js'



associateModels()




class PaymentService {
  constructor() {
    this.payment = Payment;
  }

  // Create a n ew payment
  /**
   * {
  user_id,
  user_type,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  amount,
  currency,
  status,
  agent_id,
  receipt,
  payment_method,
} 
   * 
   */
  async createPayment(data) {
    try {
      const payment = await this.payment.create(data);
      return payment;
    } catch (err) {
      throw new Error("Failed to create payment: " + err.message);
    }
  }

  async getAllPayments({
    limit = 10,
    page = 1,
    search = "",
    user_id,
    agent_id,
    status,
    user_type,
    orderBy = "createdAt",
    orderDir = "DESC",
  } = {}) {                        // ← default to {}
    try {
      const where = {};
      if (search) {
        where[Op.or] = [
          { receipt: { [Op.iLike]: `%${search}%` } },
          { razorpay_order_id: { [Op.iLike]: `%${search}%` } },
          { razorpay_payment_id: { [Op.iLike]: `%${search}%` } },
        ];
      }
      if (user_id)   where.user_id   = user_id;
      if (agent_id)  where.agent_id  = agent_id;
      if (status)    where.status    = status;
      if (user_type) where.user_type = user_type;

      const offset = (page - 1) * limit;

      const { rows, count } = await this.payment.findAndCountAll({
        where,
        limit,
        offset,
        order: [[orderBy, orderDir]],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone'],
          },
          // add Agent include here if needed
        ],
      });

      return {
        data: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      };
    } catch (err) {
      throw new Error("Failed to fetch payments: " + err.message);
    }
  }



  // Get a payment by ID
  async getPaymentById(id) {
    try {
      const payment = await this.payment.findByPk(id);
      if (!payment) throw new Error("Payment not found");
      return payment;
    } catch (err) {
      throw new Error("Failed to fetch payment: " + err.message);
    }
  }

  async getPaymentByRazorpayOrderId(id) {
    try {
      const payment = await this.payment.findOne({where:{razorpay_order_id:id}});
      if (!payment) throw new Error("Payment not found");
      return payment;
    } catch (err) {
      throw new Error("Failed to fetch payment: " + err.message);
    }
  }

  // Update a payment by ID
  async updatePaymentById(id, updateData) {
    try {
      const payment = await this.payment.findByPk(id);
      if (!payment) throw new Error("Payment not found");

      await payment.update(updateData);
      return payment;
    } catch (err) {
      throw new Error("Failed to update payment: " + err.message);
    }
  }

  async updatePaymentByRazorpayOrderId(id, updateData) {
    try {
      const payment = await this.payment.findOne({ where: { razorpay_order_id: id } });
      if (!payment) throw new Error("Payment not found");

      await payment.update(updateData);
      return payment;
    } catch (err) {
      console.error("Error in updatePaymentByRazorpayOrderId:", { id, error: err.stack });
      throw new Error("Failed to update payment: " + err.message);
    }
  }
  
  // Delete a payment by ID
  async deletePaymentById(id) {
    try {
      const deleted = await this.payment.destroy({ where: { id } });
      if (deleted === 0) throw new Error("Payment not found");
      return { message: "Payment deleted successfully" };
    } catch (err) {
      throw new Error("Failed to delete payment: " + err.message);
    }
  }

  // Get all payments for a specific user
  async getPaymentsByUserId(userId) {
    try {
      const payments = await this.payment.findAll({
        where: { user_id: userId },
        order: [["createdAt", "DESC"]],
      });
      return payments;
    } catch (err) {
      throw new Error("Failed to fetch user payments: " + err.message);
    }
  }

  // Get all payments for a specific agent
  async getPaymentsByAgentId(agentId) {
    try {
      const payments = await this.payment.findAll({
        where: { agent_id: agentId },
        order: [["createdAt", "DESC"]],
      });
      return payments;
    } catch (err) {
      throw new Error("Failed to fetch agent payments: " + err.message);
    }
  }
}

export default new PaymentService();
// const paymentService =  new PaymentService();


// (async () => {
//   try {
//     // ✅ Test Data
// const mockPayment = {
//   user_id: '19475eda-9461-4b03-910a-51eeef33808e',
//   user_type: 'USER',
//   razorpay_order_id: 'order_Ksjnf84734',
//   razorpay_payment_id: 'pay_Ksjdjf88922',
//   razorpay_signature: 'signature_123abc',
//   amount: 499.99,
//   currency: 'INR',
//   status: 'CAPTURED',
//   agent_id: 'b290f1ee-6c54-4b01-90e6-d701748f0999',
//   receipt: 'receipt#001122',
//   payment_method: 'UPI',
// };

//     // ✅ Create
//     const created = await paymentService.createPayment(mockPayment);
//     console.log('✅ Payment Created:', created.id);

//     // ✅ Get All with Filter
//     const result = await paymentService.getAllPayments({ user_id: mockPayment.user_id });
//     console.log(`✅ Found ${result.total} payments for user ${mockPayment.user_id}`);

//     // ✅ Get by ID
//     const fetched = await paymentService.getPaymentById(created.id);
//     console.log('✅ Payment Fetched by ID:', fetched.id);

//     // ✅ Update
//     const updated = await paymentService.updatePaymentById(created.id, { status: 'REFUNDED' });
//     console.log('✅ Payment Updated:', updated.status);

//     // ✅ Delete
//     const deletion = await paymentService.deletePaymentById(created.id);
//     console.log('✅ Payment Deleted:', deletion.message);

//     // ✅ Exit cleanly
//     await sequelize.close();
//   } catch (err) {
//     console.error('❌ Error:', err.message);
//     process.exit(1);
//   }
// })();