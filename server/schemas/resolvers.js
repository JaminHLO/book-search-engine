const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const currentUser = await User.findOne({ _id: context.user._id }).select('-__v -password');
        return currentUser;
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
        // const newBook  = await Book.create( {
        //   authors: book?.authors || '',
        //   description: book?.description || '',
        //   title: book.title,
        //   bookId: book.bookId,
        //   image: book?.image,
        //   link: book?.link,
        // });

        // console.log("context.user is:", context.user);

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book }}, //book.bookId
          { new: true }  
        );

        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        // const book = await Book.findOneAndDelete({
        //   bookId: bookIdToDel,
        // });

        // const curUser = await User.find({_id: context.user._id});
        // const curSavedBooks = curUser.savedBooks;
        // curSavedBooks = curSavedBooks.filter(book => book.bookId !== bookId);


        // const updatedUser = await User.findOneAndUpdate(
        //   { '_id': context.user._id },
        //   { $set: { 'savedBooks': curSavedBooks } },
        //   { 'new': true }
        // );
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: {savedBooks: { bookId } } },
          { new: true }
        )
        // .populate({path: 'savedBooks', select: 'bookId', model: 'User'})


        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');

    },


  },
};

module.exports = resolvers;
