// requestRepository.js

const Request = require('../model/request');

const requestRepository = {
    findById: (requestId) => {
        return Request.findById(requestId);
    },

    findOne: (conditions) => {
        return Request.findOne(conditions);
    },

    findAll: (conditions) => {
        return Request.find(conditions);
    },

    save: (request) => {
        return request.save();
    },

    delete: (request) => {
        return request.deleteOne();
    },

    populate: (query, populateOptions) => {
        return query.populate(populateOptions);
    }
};

module.exports = requestRepository;
