const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            // Are we logged in?
            if ( context.user ) {
                const userData = await User.findOne( { _id: context.user._id } ).select('-__v-password');

                return userData;
            }
            throw new AuthenticationError('Not Logged In!')
        }
    },

    Mutation {
        addUser: {},

        login: {},

        saveBook: {},

        removeBook: {}
    }
};

module.exports = resolvers;