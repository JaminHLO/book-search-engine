import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation loginUser($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
        bookCount
        savedBooks {
          bookId
        }
      }
    }
  }
`;

export const ADD_USER = gql`
  mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
        bookCount
        savedBooks {
          bookId
        }
      }
    }
  }
`;

export const SAVE_BOOK = gql`
mutation SaveBook($authors: [String]!, $description: String!, $title: String!, $bookId: String!, $image: String, $link: String) {
  saveBook(authors: $authors, description: $description, title: $title, bookId: $bookId, image: $image, link: $link) {
    bookCount
    username
  }
}
`;


export const REMOVE_BOOK = gql`
  mutation Mutation($bookId: String!) {
    removeBook(bookId: $bookId) {
      _id
      username
      email
    }
  }
`;

