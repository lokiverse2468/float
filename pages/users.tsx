'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apolloClient';
import UserManagement from '@/components/pages/UserManagement';
import { Box, Container } from '@mui/material';

const UsersPage = () => {
  return (
    <ApolloProvider client={client}>
      <Container maxWidth="xl">
        <Box sx={{ py: 2 }}>
          <UserManagement />
        </Box>
      </Container>
    </ApolloProvider>
  );
};

export default UsersPage;