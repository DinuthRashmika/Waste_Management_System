const express = require('express');

const router = express.Router();

const authController = require('../controller/authcontroller');
const requestController = require('../controller/requestcontroller')
const paymentController = require('../controller/paymentcontroller')
const { protect, admin } = require('../protect'); // JWT Middleware for authentication

// Signup route
router.post('/signup', authController.signup);
// Route to get all confirmed requests for the collector
router.get('/collector/requests/confirmed', protect, requestController.getAllConfirmedRequests);
// Route to mark a confirmed request as complete by the collector
router.get('/status', protect, requestController.getRequestStatus);
router.put('/collector/requests/:requestId/complete', protect, requestController.completeRequest);
router.put('/admin/requests/:requestId/confirm', protect, requestController.confirmRequest);
router.get('/assigned-requests' , requestController.getAssignedRequests)

router.put('/admin/assign-collector', requestController.assignCollector);
 

router.get('/requests/:requestId/address', protect, requestController.getRequestAddressByRequestId);
 
router.delete('/requests/:requestId', protect, requestController.deleteRequest);

// Login route
router.post('/login', authController.login);

// Get user details by ID route
router.get('/users/:id', authController.getUserDetails);
router.get('/admin/users',  authController.getAllUsers);
router.post('/pay', paymentController.handlePayment)


// Create a new request
router.post('/requests', protect, requestController.createRequest);

// Get request status for the logged-in user (no user ID in URL, use JWT)
router.get('/status', protect, requestController.getRequestStatus);

// Admin routes (with JWT protection)
router.get('/admin/requests',   requestController.getAllRequests);
router.get('/admin/collectors', authController.getAllCollectors);
router.get('/requests/confirmed/:collectorId', requestController.getConfirmedRequestsByCollector);
router.get ('/confirmed-requests/${collectorId}' ,requestController.getConfirmedRequests)
router.post('/admin/add-collector', authController.addCollector);
router.put('/admin/requests/assign',   requestController.assignCollector);

router.put('/admin/requests/:requestId/confirm', protect, requestController.confirmRequest);


module.exports = router;
