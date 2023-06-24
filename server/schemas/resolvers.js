const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      // console.log("context is", context);
      if (context?.user) {
        return await User.findOne({ _id: context.user._id }).select('-__v -password');
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
    saveBook: async (parent, { book }, context) => {
      if (context.user) {

        const newBook = await Book.create( {
          authors: [...book.authors],
          description: (book.description?book.description:''),
          title: book.title,
          bookId: book.bookId,
          image: book.image,
          link: book.link,
        });


        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: newBook }},
          { new: true } 
        );

        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async (parent, {bookIdToDel} , context) => {
      if (context.user) {
        const book = await Book.findOneAndDelete(
          {
            bookId: bookIdToDel  
          }
        );

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: {bookIdToDel} } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');

    },


  },
};

module.exports = resolvers;
