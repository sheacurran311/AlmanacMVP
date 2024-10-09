import express from 'express';
import { 
  createReward, 
  getReward, 
  updateReward, 
  deleteReward, 
  listRewards,
  buyReward
} from '../controllers/RewardController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateJWT, createReward);
router.get('/:rewardId', authenticateJWT, getReward);
router.put('/:rewardId', authenticateJWT, updateReward);
router.delete('/:rewardId', authenticateJWT, deleteReward);
router.get('/', authenticateJWT, listRewards);
router.post('/buy', authenticateJWT, buyReward);

export default router;