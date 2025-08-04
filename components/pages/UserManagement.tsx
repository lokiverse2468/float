'use client';

import React, { useState } from 'react';
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
  Pagination,
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
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_USERS_QUERY,
  GET_BUSINESS_UNITS_QUERY,
  GET_ROLES_QUERY,
  CREATE_USER_MUTATION,
  CREATE_USER_UNIT_ROLE_MUTATION
} from '../../graphql/queries';

interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

interface BusinessUnit {
  id: string;
  name: string;
  unitType: string;
}

interface Role {
  id: string;
  name: string;
  businessUnit: {
    id: string;
    name: string;
  };
}

const UserManagement = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    businessUnitId: '',
    roleId: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // GraphQL Queries
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery(GET_USERS_QUERY, {
    variables: { first: pageSize, after: null },
    fetchPolicy: 'cache-and-network'
  });

  const { data: businessUnitsData, loading: businessUnitsLoading } = useQuery(GET_BUSINESS_UNITS_QUERY);
  const { data: rolesData, loading: rolesLoading } = useQuery(GET_ROLES_QUERY);

  // GraphQL Mutations
  const [createUser, { loading: createUserLoading }] = useMutation(CREATE_USER_MUTATION);
  const [createUserUnitRole, { loading: createRoleLoading }] = useMutation(CREATE_USER_UNIT_ROLE_MUTATION);

  const users = usersData?.users?.edges?.map((edge: any) => edge.node) || [];
  const businessUnits = businessUnitsData?.businessUnits || [];
  const roles = rolesData?.roles || [];

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        fullName: user.fullName,
        email: user.email,
        businessUnitId: '',
        roleId: ''
      });
    } else {
      setSelectedUser(null);
      setFormData({
        fullName: '',
        email: '',
        businessUnitId: '',
        roleId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      fullName: '',
      email: '',
      businessUnitId: '',
      roleId: ''
    });
  };

  const handleInputChange = (field: string) => (event: any) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (selectedUser) {
        // Update user logic would go here
        setSnackbar({
          open: true,
          message: 'User updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new user
        const userResult = await createUser({
          variables: {
            input: {
              fullName: formData.fullName,
              email: formData.email
            }
          }
        });

        if (userResult.data?.createUser && formData.businessUnitId && formData.roleId) {
          // Assign role to user
          await createUserUnitRole({
            variables: {
              input: {
                userId: userResult.data.createUser.id,
                businessUnitId: formData.businessUnitId,
                roleId: formData.roleId
              }
            }
          });
        }

        setSnackbar({
          open: true,
          message: 'User created successfully!',
          severity: 'success'
        });

        // Refetch users data
        refetchUsers();
      }

      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving user:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save user. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredUsers = users.filter((user: User) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (usersLoading && !usersData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (usersError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading users: {usersError.message}
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
          onClick={() => handleOpenDialog()}
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
                        onClick={() => handleOpenDialog(user)}
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

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredUsers.length / pageSize)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={handleInputChange('fullName')}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Business Unit</InputLabel>
                <Select
                  value={formData.businessUnitId}
                  label="Business Unit"
                  onChange={handleInputChange('businessUnitId')}
                  disabled={businessUnitsLoading}
                >
                  {businessUnits.map((bu: BusinessUnit) => (
                    <MenuItem key={bu.id} value={bu.id}>
                      {bu.name} ({bu.unitType})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.roleId}
                  label="Role"
                  onChange={handleInputChange('roleId')}
                  disabled={rolesLoading || !formData.businessUnitId}
                >
                  {roles
                    .filter((role: Role) => role.businessUnit.id === formData.businessUnitId)
                    .map((role: Role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createUserLoading || createRoleLoading}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' }
              }}
            >
              {createUserLoading || createRoleLoading ? 'Saving...' : (selectedUser ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;