import { gql } from '@apollo/client';

export const GET_PROFILE = gql`
  query profile {
    profile {
      fullName
      email
      type
      avatar
      createdAt
    }
  }
`;