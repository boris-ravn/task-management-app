import { gql } from '@apollo/client';

export const GET_TASKS = gql`
  query GetTasks($input: FilterTaskInput!) {
    tasks(input: $input) {
      id
      name
      status
      pointEstimate
      dueDate
      tags
      assignee {
        id
        fullName
        avatar
      }
    }
  }
`; 

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      fullName
      avatar
    }
  }
`;