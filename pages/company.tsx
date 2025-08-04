'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apolloClient';
import CompanyManagement from '@/components/pages/CompanyManagement';
import { Box, Container } from '@mui/material';

const CompanyPage = () => {
  return (
    <ApolloProvider client={client}>
      <Container maxWidth="xl">
        <Box sx={{ py: 2 }}>
          <CompanyManagement />
        </Box>
      </Container>
    </ApolloProvider>
  );
};

export default CompanyPage;