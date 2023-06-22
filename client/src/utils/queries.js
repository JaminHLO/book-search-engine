import { gql } from '@apollo/client';

export const GET_ME = gql`
  query me {
    me {
      token
      _id
      username
      email
      bookCount
      savedBooks {
        _bookId
        authors
        description
        image
        link
        title
      }
    }
  }
`;


