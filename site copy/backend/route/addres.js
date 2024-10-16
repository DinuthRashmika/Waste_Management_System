const express = require('express');
const router = express.Router();
const addressController = require('../controller/adresscontrol');
const { protect } = require('../protect'); // JWT Middleware for authentication

// Route to add a new address (POST)
router.post('/add', protect, addressController.addNewAddress);
router.post('/update', addressController.updateAddress);


 
router.put('/update-address', addressController.updateAddress);


// router.get('/admin/total-users', addressController.getTotalUsers);

router.get('/admin/garbage-collections', addressController.getTotalGarbageCollections);
//Route to get the total number of users
router.get('/admin/total-users',addressController.getTotalUsers);
// router.get('/total-users', addressController.getTotalUsers);
router.get('/s/:username', addressController.getAddressesByUserId);
router.get('/samj/:userId', addressController.getAddressesByUserId)

// Route to get all addresses for the authenticated user (GET)
router.get('/user', protect, addressController.getUserAddresses);
 

// Route to get details of a specific address by its ID (GET)
router.get('/:addressId', protect, addressController.getAddressDetails);

// Route to delete an address by its ID (DELETE)
router.delete('/:addressId', protect, addressController.deleteAddress);
 


module.exports = router;