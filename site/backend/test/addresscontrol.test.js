const addressController = require('../controller/adresscontrol');
const Address = require('../model/adress');
const User = require('../model/user');
const jwt = require('jsonwebtoken');

jest.mock('../model/adress');
jest.mock('../model/user');
jest.mock('jsonwebtoken');

describe('Address Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            userId: '12345',
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jwt.verify.mockReturnValue({ id: '12345' }); // Mock JWT verification to return a userId
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addNewAddress', () => {
        it('should return 400 if address is missing', async () => {
            req.body = { address: '', monthlyPayment: 3190 };

            await addressController.addNewAddress(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Address is required.' });
        });

        it('should add a new address and return 201', async () => {
            req.body = { address: 'Test Address', monthlyPayment: 3190 };

            const mockAddress = { _id: '123', address: 'Test Address', monthlyPayment: 3190 };
            Address.prototype.save = jest.fn().mockResolvedValue(mockAddress);

            await addressController.addNewAddress(req, res);

            expect(Address.prototype.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            // expect(res.json).toHaveBeenCalledWith({
            //     message: 'Address added successfully',
            //     address: mockAddress,
            // });
        });
    });

    describe('updateAddress', () => {
        it('should return 404 if address is not found', async () => {
            req.body = { userId: '12345', garbageWeight: 10, recycleWeight: 5 };
            Address.findOne.mockResolvedValue(null);

            await addressController.updateAddress(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Address not found' });
        });

        it('should update the address and return 200', async () => {
            req.body = { userId: '12345', garbageWeight: 10, recycleWeight: 5 };
            const mockAddress = {
                monthlyPayment: 3190,
                save: jest.fn(),
            };
            Address.findOne.mockResolvedValue(mockAddress);

            await addressController.updateAddress(req, res);

            expect(Address.findOne).toHaveBeenCalledWith({ user: '12345' });
            expect(mockAddress.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Address updated successfully' });
        });
    });

    describe('getUserAddresses', () => {
        it('should return 404 if no addresses are found', async () => {
            Address.find.mockResolvedValue([]);

            await addressController.getUserAddresses(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'No addresses found for this user.' });
        });

        it('should return 200 with a list of addresses', async () => {
            const mockAddresses = [{ address: 'Address 1' }, { address: 'Address 2' }];
            Address.find.mockResolvedValue(mockAddresses);

            await addressController.getUserAddresses(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ addresses: mockAddresses });
        });
    });

    describe('getAddressesByUserId', () => {
        it('should return 404 if no addresses are found for the user', async () => {
            req.params.userId = '12345';
            Address.find.mockResolvedValue([]);

            await addressController.getAddressesByUserId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'No addresses found for this user.' });
        });

        it('should return 200 with addresses for the user', async () => {
            req.params.userId = '12345';
            const mockAddresses = [{ address: 'Address 1' }, { address: 'Address 2' }];
            Address.find.mockResolvedValue(mockAddresses);

            await addressController.getAddressesByUserId(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ addresses: mockAddresses });
        });
    });

    describe('deleteAddress', () => {
        it('should return 404 if address is not found', async () => {
            req.params.addressId = '123';
            Address.findByIdAndDelete.mockResolvedValue(null);

            await addressController.deleteAddress(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Address not found' });
        });

        it('should delete the address and return 200', async () => {
            req.params.addressId = '123';
            const mockDeletedAddress = { address: 'Test Address' };
            Address.findByIdAndDelete.mockResolvedValue(mockDeletedAddress);

            await addressController.deleteAddress(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Address deleted successfully' });
        });
    });
});
