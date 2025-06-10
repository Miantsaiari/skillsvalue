const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notification.controller');

router.get('/', notifController.getAllNotifications);
router.post('/mark-read', notifController.markAllAsRead);

module.exports = router;
