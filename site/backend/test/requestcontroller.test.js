const requestController = require('../controller/requestcontroller');
const Request = require('../model/request');
const User = require('../model/user');

jest.mock('../model/request');
jest.mock('../model/user');

describe(  () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            userId: '12345', // Mock userId from JWT middleware
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getRequestAddressByRequestId', () => {
        it('should return 404 if request is not found', async () => {
            req.params.requestId = '123';
            Request.findById.mockResolvedValue(null); // Simulate request not found

            await requestController.getRequestAddressByRequestId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Request not found' });
        });

        it('should return 200 with the request and address', async () => {
            req.params.requestId = '123';
            const mockRequest = { _id: '123', address: 'Test Address' };
            Request.findById.mockResolvedValue(mockRequest); // Simulate request found

            await requestController.getRequestAddressByRequestId(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ request: mockRequest, address: mockRequest.address });
        });
    });

    describe('completeRequest', () => {
        it('should return 404 if request is not found', async () => {
            req.params.requestId = '123';
            Request.findById.mockResolvedValue(null); // Simulate request not found

            await requestController.completeRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Request not found' });
        });

        it('should mark the request as completed and return 200', async () => {
            req.params.requestId = '123';
            const mockRequest = { _id: '123', status: 'Pending', save: jest.fn() };
            Request.findById.mockResolvedValue(mockRequest); // Simulate request found

            await requestController.completeRequest(req, res);

            expect(mockRequest.status).toBe('Completed');
            expect(mockRequest.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Request marked as complete' });
        });
    });

    describe('getAllConfirmedRequests', () => {
        it('should return confirmed requests', async () => {
            const mockRequests = [
                { _id: 'req1', user: { name: 'John Doe' }, status: 'Confirmed' },
                { _id: 'req2', user: { name: 'Jane Doe' }, status: 'Confirmed' }
            ];

            Request.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockRequests),
            });

            await requestController.getAllConfirmedRequests(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRequests);
        });

        it('should return 500 if there is a server error', async () => {
            Request.find.mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error('Database error')),
            });

            await requestController.getAllConfirmedRequests(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });

    describe('confirmRequest', () => {
        it('should return 404 if request is not found', async () => {
            req.params.requestId = '123';
            Request.findById.mockResolvedValue(null); // Simulate request not found

            await requestController.confirmRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Request not found' });
        });

        it('should confirm the request and return 200', async () => {
            req.params.requestId = '123';
            const mockRequest = { _id: '123', status: 'Pending', save: jest.fn() };
            Request.findById.mockResolvedValue(mockRequest); // Simulate request found

            await requestController.confirmRequest(req, res);

            expect(mockRequest.status).toBe('Confirmed');
            expect(mockRequest.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Request confirmed successfully', status: 'Confirmed' });
        });
    });

    describe('createRequest', () => {
        it('should return 400 if user ID is missing', async () => {
            req.userId = null;
            req.body.address = 'Test Address';

            await requestController.createRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User ID is missing' });
        });

        it('should return 400 if address is missing', async () => {
            req.userId = '12345';
            req.body.address = '';

            await requestController.createRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Address is required.' });
        });

        it('should create a new request and return 201', async () => {
            req.userId = '12345';
            req.body.address = 'Test Address';

            Request.findOne.mockResolvedValue(null); // Simulate no existing request
            Request.prototype.save = jest.fn().mockResolvedValue({ _id: '12345', address: 'Test Address' });

            await requestController.createRequest(req, res);

            expect(Request.prototype.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Request created successfully' });
        });
    });

    describe('deleteRequest', () => {
        it('should return 404 if request is not found', async () => {
            req.params.requestId = '123';
            Request.findOne.mockResolvedValue(null); // Simulate request not found

            await requestController.deleteRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Request not found or unauthorized to delete' });
        });

        it('should delete the request and return 200', async () => {
            req.params.requestId = '123';
            const mockRequest = { _id: '123', deleteOne: jest.fn() };
            Request.findOne.mockResolvedValue(mockRequest); // Simulate request found

            await requestController.deleteRequest(req, res);

            expect(mockRequest.deleteOne).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Request deleted successfully' });
        });
    });

    describe('getRequestStatus', () => {
        it('should return 404 if no request is found', async () => {
            Request.findOne.mockResolvedValue(null); // Simulate no request found

            await requestController.getRequestStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'No Request' });
        });

        it('should return 200 with the request status', async () => {
            const mockRequest = { _id: '123', status: 'Pending' };
            Request.findOne.mockResolvedValue(mockRequest); // Simulate request found

            await requestController.getRequestStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ status: 'Pending' });
        });
    });

    describe('getAllRequests', () => {
        it('should return 500 if there is a server error', async () => {
            Request.find.mockRejectedValue(new Error('Database error')); // Simulate error
    
            await requestController.getAllRequests(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });

})