import { Router, Request, Response } from 'express';
import { influxDbService } from '../services/influxdb.service';

const router = Router();

/**
 * GET /sensors/:deviceId/latest
 * Get latest sensor values for a device
 */
router.get('/:deviceId/latest', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      res.status(400).json({
        error: 'Device ID is required',
      });
      return;
    }

    const data = await influxDbService.getLatestValues(deviceId);

    res.status(200).json({
      deviceId,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({
      error: 'Failed to fetch sensor data',
    });
  }
});

export default router;
