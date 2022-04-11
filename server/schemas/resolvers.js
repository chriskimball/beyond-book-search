const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      // Are we logged in?
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select("-__v -password").populate("savedBooks");

        return userData;
      }
      throw new AuthenticationError("Not Logged In!");
    },
  },

  Mutation: {
    /** (parent, args, context) */
    createUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect email.");
      }

      const correctPassword = await user.isCorrectPassword(password);

      if (!correctPassword) throw new AuthenticationError("Incorrect Password.");

      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: {
              savedBooks: bookData,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    deleteBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const userData = await User.findOneAndUpdate(
          { _id: context.user._id }, 
          { $pull: { 
            savedBooks: { bookId: bookId } 
            }, 
          }, 
          { new: true }
        );

        return userData;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;