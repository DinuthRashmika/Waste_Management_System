const Address = require('../model/adress');
const requestController = require('../controller/requestcontroller');
const cron = require('node-cron');
jest.mock('../model/adress');

describe('Request Controller - handlePayment', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                userId: 'userId123',
                addressId: 'addressId123'
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handlePayment', () => {
        it('should return 404 if address is not found', async () => {
            Address.findOne.mockResolvedValue(null); // Simulate address not found

            await requestController.handlePayment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Address not found' });
        });

        it('should reset monthly payment and return 200', async () => {
            const mockAddress = {
                _id: 'addressId123',
                user: 'userId123',
                monthlyPayment: 5000,
                save: jest.fn(),
            };

            Address.findOne.mockResolvedValue(mockAddress); // Simulate address found

            await requestController.handlePayment(req, res);

            expect(mockAddress.monthlyPayment).toBe(0);
            expect(mockAddress.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Payment successful, monthly payment reset to 0' });
        });

        it('should return 500 on server error', async () => {
            Address.findOne.mockRejectedValue(new Error('Database error')); // Simulate server error

            await requestController.handlePayment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });
});

