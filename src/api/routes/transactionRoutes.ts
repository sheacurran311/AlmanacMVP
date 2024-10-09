import express from 'express';
import { 
  createTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
  deleteTransaction
} from '../controllers/TransactionController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateJWT, createTransaction);
router.get('/:transactionId', authenticateJWT, getTransaction);
router.get('/', authenticateJWT, listTransactions);
router.put('/:transactionId', authenticateJWT, updateTransaction);
router.delete('/:transactionId', authenticateJWT, deleteTransaction);

export default router;