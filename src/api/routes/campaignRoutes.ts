import express from 'express';
import { 
  createCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  listCampaigns,
  joinCampaign
} from '../controllers/CampaignController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateJWT, createCampaign);
router.get('/:campaignId', authenticateJWT, getCampaign);
router.put('/:campaignId', authenticateJWT, updateCampaign);
router.delete('/:campaignId', authenticateJWT, deleteCampaign);
router.get('/', authenticateJWT, listCampaigns);
router.post('/join', authenticateJWT, joinCampaign);

export default router;