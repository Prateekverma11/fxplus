import prisma from '../utils/prisma.js';
import { evaluateAlerts } from '../jobs/cronJobs.js';

export const getAlerts = async (req, res) => {
  const userId = req.query.userId || 'user_default';
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAlert = async (req, res) => {
  const { baseCurrency, quoteCurrency, condition, threshold, notes } = req.body;

  if (!baseCurrency || !quoteCurrency || !condition || threshold === undefined) {
    return res.status(400).json({
      success: false,
      message: 'baseCurrency, quoteCurrency, condition, and threshold are required'
    });
  }

  const validConditions = ['ABOVE', 'BELOW', 'PCT_CHANGE_GT', 'PCT_CHANGE_LT'];
  if (!validConditions.includes(condition)) {
    return res.status(400).json({
      success: false,
      message: `Invalid condition. Must be one of: ${validConditions.join(', ')}`
    });
  }

  try {
    const alert = await prisma.alert.create({
      data: {
        userId: req.body.userId || 'user_default',
        baseCurrency: baseCurrency.toUpperCase(),
        quoteCurrency: quoteCurrency.toUpperCase(),
        condition,
        threshold: parseFloat(threshold),
        notes: notes || null,
        active: true
      }
    });

    // Run evaluation right away
    setTimeout(evaluateAlerts, 500);

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAlert = async (req, res) => {
  const { id } = req.params;
  const { active, threshold, notes, condition } = req.body;

  try {
    const existing = await prisma.alert.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        ...(active !== undefined && { active, triggeredAt: active ? null : existing.triggeredAt }),
        ...(threshold !== undefined && { threshold: parseFloat(threshold) }),
        ...(condition !== undefined && { condition }),
        ...(notes !== undefined && { notes })
      }
    });

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAlert = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.alert.delete({ where: { id } });
    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
