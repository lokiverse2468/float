import { gql } from '@apollo/client';

// User Queries
export const GET_USERS_QUERY = gql`
  query GetUsers($first: Int, $after: String) {
    users(first: $first, after: $after) {
      edges {
        node {
          id
          fullName
          email
          createdAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_USER_BY_ID_QUERY = gql`
  query GetUserById($id: ID!) {
    user(id: $id) {
      id
      fullName
      email
      createdAt
    }
  }
`;

// Business Unit Queries
export const GET_BUSINESS_UNITS_QUERY = gql`
  query GetBusinessUnits {
    businessUnits {
      id
      name
      unitType
      country
      createdAt
      superAdminRoleId
      parent {
        id
        name
      }
      children {
        id
        name
        unitType
      }
    }
  }
`;

export const GET_BUSINESS_UNIT_BY_ID_QUERY = gql`
  query GetBusinessUnitById($id: ID!) {
    businessUnit(id: $id) {
      id
      name
      unitType
      country
      createdAt
      superAdminRoleId
      parent {
        id
        name
        unitType
      }
      children {
        id
        name
        unitType
      }
    }
  }
`;

// Role Queries
export const GET_ROLES_QUERY = gql`
  query GetRoles {
    roles {
      id
      name
      businessUnit {
        id
        name
      }
    }
  }
`;

export const GET_ROLE_BY_ID_QUERY = gql`
  query GetRoleById($id: ID!) {
    role(id: $id) {
      id
      name
      businessUnit {
        id
        name
        unitType
      }
    }
  }
`;

// User Unit Role Queries
export const GET_USER_UNIT_ROLES_QUERY = gql`
  query GetUserUnitRoles {
    userUnitRoles {
      user {
        id
        fullName
        email
      }
      businessUnit {
        id
        name
        unitType
      }
      role {
        id
        name
      }
    }
  }
`;

// Mutation Queries (already existing in your businessUnits.ts)
export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      fullName
      email
      createdAt
    }
  }
`;

export const CREATE_BUSINESS_UNIT_MUTATION = gql`
  mutation CreateBusinessUnit($input: CreateBusinessUnitInput!) {
    createBusinessUnit(input: $input) {
      id
      name
      unitType
      country
      createdAt
      superAdminRoleId
    }
  }
`;

export const UPDATE_BUSINESS_UNIT_MUTATION = gql`
  mutation UpdateBusinessUnit($id: ID!, $input: UpdateBusinessUnitInput!) {
    updateBusinessUnit(id: $id, input: $input) {
      id
      name
      unitType
      country
      createdAt
    }
  }
`;

export const CREATE_ROLE_MUTATION = gql`
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      id
      name
      businessUnit {
        id
        name
      }
    }
  }
`;

export const CREATE_USER_UNIT_ROLE_MUTATION = gql`
  mutation CreateUserUnitRole($input: CreateUserUnitRoleInput!) {
    createUserUnitRole(input: $input) {
      user {
        id
        fullName
        email
      }
      businessUnit {
        id
        name
      }
      role {
        id
        name
      }
    }
  }
`;