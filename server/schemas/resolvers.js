const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create( 
        { username, email, password }
      );
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { body }, context) => {
      if (context.user) {
        const book = await Book.create( {
          authors: body.authors,
          description: body.description,
          title: body.title,
          bookId: body.bookId,
          image: body.image,
          link: body.link,
        });

        // console.log("context.user is:", context.user);

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book.bookId }}  
        );

        return book;
      }
      throw new AuthenticationError('YOu need to be logged in!');
    },
    removeBook: async (parent, { bookIdToDel }, context) => {
      if (context.user) {
        const book = await Book.findOneAndDelete({
          bookId: bookIdToDel,
        });

        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: book.bookId } }
        );
        return book;
      }
      throw new AuthenticationError('You need to be logged in!');

    },


  },
};

module.exports = resolvers;
