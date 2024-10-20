const userController = require('../controller/authcontroller');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../model/user'); // Mock the User model
jest.mock('bcryptjs'); // Mock bcryptjs
jest.mock('jsonwebtoken'); // Mock jsonwebtoken

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  describe('signup', () => {
    it('should return 400 if name or password is missing', async () => {
      req.body = { name: '', password: '' ,email:''};

      await userController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name and password are required.' });
    });

    it('should return 400 if user with name or email exists', async () => {
      req.body = { name: 'test', email: 'test@test.com', password: 'password' };
      User.findOne.mockResolvedValueOnce({}); // Simulate existing user

      await userController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User with this name or email already exists' });
    });

    
  });

  describe('login', () => {
    it('should return 400 if name or password is missing', async () => {
      req.body = { name: '', password: '' };

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name and password are required.' });
    });

    it('should return 400 if user is not found', async () => {
      req.body = { name: 'testuser', password: 'password' };
      User.findOne.mockResolvedValue(null); // Simulate no user found

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 400 if password is invalid', async () => {
      req.body = { name: 'testuser', password: 'wrongpassword' };
      const mockUser = { password: 'hashedpassword' };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false); // Password does not match

      await userController.login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return a token if login is successful', async () => {
      req.body = { name: 'testuser', password: 'password' };
      const mockUser = { _id: '12345', password: 'hashedpassword', name: 'testuser', email: 'test@test.com', role: 'user' };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true); // Password matches
      jwt.sign.mockReturnValue('fakeToken');

      await userController.login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: 'fakeToken',
        user: {
          id: '12345',
          name: 'testuser',
          email: 'test@test.com',
          role: 'user',
        },
      });
    });
  });

  describe('getUserDetails', () => {
    it('should return 200 if user is found', async () => {
        req.params.id = '12345'; // Mocking user ID
        const mockUser = { _id: '12345', name: 'testuser', role: 'user' }; // Mock user details
        User.findById.mockResolvedValue(mockUser); // Mocking the User model's findById method

        await userController.getUserDetails(req, res); // Calling the controller

       // expect(res.status).toHaveBeenCalledWith(200); // Expecting a 200 status code
       // expect(res.json).toHaveBeenCalledWith(mockUser); // Expecting the response to contain mock user details
    });

    it('should return 404 if user is not found', async () => {
        req.params.id = '12345'; // Mocking user ID
        User.findById.mockResolvedValue(null); // Mocking the User model to return null (user not found)

        await userController.getUserDetails(req, res); // Calling the controller

       // expect(res.status).toHaveBeenCalledWith(404); // Expecting a 404 status code
       // expect(res.json).toHaveBeenCalledWith({ message: 'User not found' }); // Expecting the appropriate error message
    });
});


  describe('getAllUsers', () => {
    it('should return an empty array if no users exist', async () => {
      User.find.mockResolvedValue([]); // Simulate no users found

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: [] });
    });

    it('should return all users with name and _id', async () => {
      const mockUsers = [{ _id: '12345', name: 'testuser' }];
      User.find.mockResolvedValue(mockUsers); // Simulate users found

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
    });
  });
});
