'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import {
  GET_USERS_QUERY,
  GET_BUSINESS_UNITS_QUERY,
  GET_ROLES_QUERY,
  CREATE_USER_MUTATION,
  CREATE_USER_UNIT_ROLE_MUTATION
} from '../../graphql/queries';
import { useListOperations, useFormWithMutation, useGraphQLQuery } from '../../hooks/useGraphQLData';

interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

interface FormData {
  fullName: string;
  email: string;
  businessUnitId: string;
  roleId: string;
}

const UserManagementSimplified = () => {
  // Use custom hooks for better state management
  const userOperations = useListOperations<User>({
    list: GET_USERS_QUERY,
    create: CREATE_USER_MUTATION
  });

  const { data: businessUnitsData } = useGraphQLQuery(GET_BUSINESS_UNITS_QUERY);
  const { data: rolesData } = useGraphQLQuery(GET_ROLES_QUERY);

  const userForm = useFormWithMutation<FormData, any, any>(
    {
      fullName: '',
      email: '',
      businessUnitId: '',
      roleId: ''
    },
    CREATE_USER_MUTATION,
    {
      transformData: (formData) => ({
        input: {
          fullName: formData.fullName,
          email: formData.email
        }
      }),
      onSuccess: (data) => {
        userOperations.refetch();
        userOperations.closeDialog();
      }
    }
  );

  const [searchTerm, setSearchTerm] = React.useState('');
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const users = userOperations.items?.users?.edges?.map((edge: any) => edge.node) || [];
  const businessUnits = businessUnitsData?.businessUnits || [];
  const roles = rolesData?.roles || [];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      await userForm.submitForm();
      setSnackbar({
        open: true,
        message: 'User created successfully!',
        severity: 'success'
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create user',
        severity: 'error'
      });
    }
  };

  const filteredUsers = users.filter((user: User) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (userOperations.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (userOperations.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading users: {userOperations.error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={userOperations.openCreateDialog}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' }
          }}
        >
          Add User
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Users Table */}
      <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user: User) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: '#1976d2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <PersonIcon sx={{ color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {user.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          ID: {user.id.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ color: '#666', fontSize: 16 }} />
                      {user.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label="Active"
                      size="small"
                      sx={{
                        backgroundColor: '#e8f5e8',
                        color: '#2e7d32',
                        fontWeight: 'medium'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => userOperations.openEditDialog(user)}
                        sx={{ color: '#1976d2' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: '#d32f2f' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredUsers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ color: '#666' }}>
              No users found
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={userOperations.isDialogOpen} onClose={userOperations.closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {userOperations.selectedItem ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={userForm.formData.fullName}
                onChange={(e) => userForm.updateField('fullName', e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.formData.email}
                onChange={(e) => userForm.updateField('email', e.target.value)}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Business Unit</InputLabel>
                <Select
                  value={userForm.formData.businessUnitId}
                  label="Business Unit"
                  onChange={(e) => userForm.updateField('businessUnitId', e.target.value)}
                >
                  {businessUnits.map((bu: any) => (
                    <MenuItem key={bu.id} value={bu.id}>
                      {bu.name} ({bu.unitType})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.formData.roleId}
                  label="Role"
                  onChange={(e) => userForm.updateField('roleId', e.target.value)}
                  disabled={!userForm.formData.businessUnitId}
                >
                  {roles
                    .filter((role: any) => role.businessUnit.id === userForm.formData.businessUnitId)
                    .map((role: any) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={userOperations.closeDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={userForm.loading}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' }
              }}
            >
              {userForm.loading ? 'Saving...' : (userOperations.selectedItem ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagementSimplified;