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
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  ExpandMore as ExpandMoreIcon,
  AccountTree as TreeIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_BUSINESS_UNITS_QUERY,
  CREATE_BUSINESS_UNIT_MUTATION,
  UPDATE_BUSINESS_UNIT_MUTATION
} from '../../graphql/queries';

interface BusinessUnit {
  id: string;
  name: string;
  unitType: string;
  country: string;
  createdAt: string;
  superAdminRoleId?: string;
  parent?: {
    id: string;
    name: string;
  };
  children?: BusinessUnit[];
}

const CompanyManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<BusinessUnit | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [formData, setFormData] = useState({
    name: '',
    unitType: '',
    country: 'India',
    parentId: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // GraphQL Queries
  const { data: businessUnitsData, loading: businessUnitsLoading, error: businessUnitsError, refetch: refetchBusinessUnits } = useQuery(GET_BUSINESS_UNITS_QUERY, {
    fetchPolicy: 'cache-and-network'
  });

  // GraphQL Mutations
  const [createBusinessUnit, { loading: createLoading }] = useMutation(CREATE_BUSINESS_UNIT_MUTATION);
  const [updateBusinessUnit, { loading: updateLoading }] = useMutation(UPDATE_BUSINESS_UNIT_MUTATION);

  const businessUnits = businessUnitsData?.businessUnits || [];

  const unitTypes = [
    'headquarters',
    'branch',
    'subsidiary',
    'division',
    'department',
    'team',
    'project',
    'organization'
  ];

  const countries = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Japan', 'China', 'Brazil', 'Mexico',
    'South Africa', 'Singapore', 'United Arab Emirates', 'Saudi Arabia'
  ];

  const handleOpenDialog = (unit?: BusinessUnit) => {
    if (unit) {
      setSelectedUnit(unit);
      setFormData({
        name: unit.name,
        unitType: unit.unitType,
        country: unit.country,
        parentId: unit.parent?.id || ''
      });
    } else {
      setSelectedUnit(null);
      setFormData({
        name: '',
        unitType: '',
        country: 'India',
        parentId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUnit(null);
    setFormData({
      name: '',
      unitType: '',
      country: 'India',
      parentId: ''
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
      if (selectedUnit) {
        // Update business unit
        await updateBusinessUnit({
          variables: {
            id: selectedUnit.id,
            input: {
              name: formData.name,
              unitType: formData.unitType,
              country: formData.country,
              parentId: formData.parentId || null
            }
          }
        });

        setSnackbar({
          open: true,
          message: 'Business unit updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new business unit
        await createBusinessUnit({
          variables: {
            input: {
              name: formData.name,
              unitType: formData.unitType,
              country: formData.country,
              parentId: formData.parentId || null
            }
          }
        });

        setSnackbar({
          open: true,
          message: 'Business unit created successfully!',
          severity: 'success'
        });
      }

      // Refetch business units data
      refetchBusinessUnits();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving business unit:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save business unit. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredUnits = businessUnits.filter((unit: BusinessUnit) =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.unitType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUnitTypeColor = (unitType: string) => {
    const colors: { [key: string]: string } = {
      headquarters: '#1976d2',
      branch: '#388e3c',
      subsidiary: '#f57c00',
      division: '#7b1fa2',
      department: '#d32f2f',
      team: '#0288d1',
      project: '#689f38',
      organization: '#455a64'
    };
    return colors[unitType] || '#666';
  };

  const renderTreeView = (units: BusinessUnit[], level = 0) => {
    const rootUnits = units.filter(unit => !unit.parent);
    
    return rootUnits.map(unit => (
      <Accordion key={unit.id} sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: getUnitTypeColor(unit.unitType),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BusinessIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                {unit.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {unit.unitType} • {unit.country}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDialog(unit);
                }}
                sx={{ color: '#1976d2' }}
              >
                <EditIcon />
              </IconButton>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {unit.children && unit.children.length > 0 ? (
            <Box sx={{ pl: 2 }}>
              {unit.children.map(child => (
                <Paper key={child.id} sx={{ p: 2, mb: 1, backgroundColor: '#f8f9fa' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: getUnitTypeColor(child.unitType),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <BusinessIcon sx={{ color: 'white', fontSize: 16 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {child.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {child.unitType} • {child.country}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(child)}
                      sx={{ color: '#1976d2' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
              No child units
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    ));
  };

  if (businessUnitsLoading && !businessUnitsData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (businessUnitsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading business units: {businessUnitsError.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Company Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            size="small"
          >
            Table View
          </Button>
          <Button
            variant={viewMode === 'tree' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('tree')}
            size="small"
            startIcon={<TreeIcon />}
          >
            Tree View
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            Add Business Unit
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search business units by name, type, or country..."
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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon sx={{ color: '#1976d2', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {businessUnits.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Total Units
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationIcon sx={{ color: '#388e3c', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                    {new Set(businessUnits.map((unit: BusinessUnit) => unit.country)).size}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Countries
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CategoryIcon sx={{ color: '#f57c00', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                    {new Set(businessUnits.map((unit: BusinessUnit) => unit.unitType)).size}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Unit Types
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TreeIcon sx={{ color: '#7b1fa2', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    {businessUnits.filter((unit: BusinessUnit) => !unit.parent).length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Root Units
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Business Unit</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Country</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Parent Unit</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUnits.map((unit: BusinessUnit) => (
                  <TableRow key={unit.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: getUnitTypeColor(unit.unitType),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <BusinessIcon sx={{ color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {unit.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            ID: {unit.id.slice(0, 8)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={unit.unitType}
                        size="small"
                        sx={{
                          backgroundColor: `${getUnitTypeColor(unit.unitType)}20`,
                          color: getUnitTypeColor(unit.unitType),
                          fontWeight: 'medium',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ color: '#666', fontSize: 16 }} />
                        {unit.country}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {unit.parent ? unit.parent.name : 'Root Unit'}
                    </TableCell>
                    <TableCell>
                      {unit.createdAt ? new Date(unit.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(unit)}
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

          {filteredUnits.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#666' }}>
                No business units found
              </Typography>
            </Box>
          )}
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: '12px', p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Organizational Structure
          </Typography>
          {renderTreeView(businessUnits)}
        </Paper>
      )}

      {/* Add/Edit Business Unit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUnit ? 'Edit Business Unit' : 'Add New Business Unit'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <TextField
                fullWidth
                label="Business Unit Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Unit Type</InputLabel>
                <Select
                  value={formData.unitType}
                  label="Unit Type"
                  onChange={handleInputChange('unitType')}
                  required
                >
                  {unitTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.country}
                  label="Country"
                  onChange={handleInputChange('country')}
                  required
                >
                  {countries.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Parent Business Unit (Optional)</InputLabel>
                <Select
                  value={formData.parentId}
                  label="Parent Business Unit (Optional)"
                  onChange={handleInputChange('parentId')}
                >
                  <MenuItem value="">None (Root Unit)</MenuItem>
                  {businessUnits
                    .filter((unit: BusinessUnit) => unit.id !== selectedUnit?.id)
                    .map((unit: BusinessUnit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.unitType})
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
              disabled={createLoading || updateLoading}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' }
              }}
            >
              {createLoading || updateLoading ? 'Saving...' : (selectedUnit ? 'Update' : 'Create')}
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

export default CompanyManagement;