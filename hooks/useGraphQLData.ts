import { useQuery, useMutation, QueryHookOptions, MutationHookOptions } from '@apollo/client';
import { useState, useCallback } from 'react';

// Custom hook for managing GraphQL queries with enhanced features
export const useGraphQLQuery = <TData = any, TVariables = any>(
  query: any,
  options?: QueryHookOptions<TData, TVariables>
) => {
  const [error, setError] = useState<string | null>(null);
  
  const queryResult = useQuery<TData, TVariables>(query, {
    ...options,
    onError: (error) => {
      setError(error.message);
      options?.onError?.(error);
    },
    onCompleted: (data) => {
      setError(null);
      options?.onCompleted?.(data);
    }
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ...queryResult,
    error: error || queryResult.error?.message,
    clearError
  };
};

// Custom hook for managing GraphQL mutations with enhanced features
export const useGraphQLMutation = <TData = any, TVariables = any>(
  mutation: any,
  options?: MutationHookOptions<TData, TVariables>
) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mutate, mutationResult] = useMutation<TData, TVariables>(mutation, {
    ...options,
    onError: (error) => {
      setError(error.message);
      setSuccess(null);
      options?.onError?.(error);
    },
    onCompleted: (data) => {
      setError(null);
      setSuccess('Operation completed successfully');
      options?.onCompleted?.(data);
    }
  });

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const executeWithFeedback = useCallback(async (variables?: TVariables, successMessage?: string) => {
    try {
      clearMessages();
      const result = await mutate({ variables });
      if (successMessage) {
        setSuccess(successMessage);
      }
      return result;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  }, [mutate, clearMessages]);

  return {
    mutate: executeWithFeedback,
    ...mutationResult,
    error: error || mutationResult.error?.message,
    success,
    clearMessages
  };
};

// Hook for managing paginated data
export const usePaginatedQuery = <TData = any, TVariables = any>(
  query: any,
  initialPageSize: number = 10,
  options?: QueryHookOptions<TData, TVariables>
) => {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const queryResult = useGraphQLQuery<TData, TVariables>(query, {
    ...options,
    variables: {
      ...options?.variables,
      first: pageSize,
      after: currentPage > 1 ? ((currentPage - 1) * pageSize).toString() : null
    } as TVariables
  });

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const changePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const search = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  return {
    ...queryResult,
    pageSize,
    currentPage,
    searchTerm,
    goToPage,
    changePageSize,
    search,
    setSearchTerm
  };
};

// Hook for managing form state with GraphQL mutations
export const useFormWithMutation = <TFormData = any, TMutationData = any, TMutationVariables = any>(
  initialFormData: TFormData,
  mutation: any,
  options?: {
    onSuccess?: (data: TMutationData) => void;
    onError?: (error: string) => void;
    transformData?: (formData: TFormData) => TMutationVariables;
  }
) => {
  const [formData, setFormData] = useState<TFormData>(initialFormData);
  const [isDirty, setIsDirty] = useState(false);

  const { mutate, loading, error, success, clearMessages } = useGraphQLMutation<TMutationData, TMutationVariables>(
    mutation,
    {
      onCompleted: options?.onSuccess,
      onError: (error) => options?.onError?.(error.message)
    }
  );

  const updateField = useCallback((field: keyof TFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  }, []);

  const updateFormData = useCallback((newData: Partial<TFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
    setIsDirty(true);
  }, []);

  const resetForm = useCallback((newInitialData?: TFormData) => {
    setFormData(newInitialData || initialFormData);
    setIsDirty(false);
    clearMessages();
  }, [initialFormData, clearMessages]);

  const submitForm = useCallback(async (customData?: Partial<TFormData>) => {
    const dataToSubmit = customData ? { ...formData, ...customData } : formData;
    const variables = options?.transformData ? options.transformData(dataToSubmit) : dataToSubmit as unknown as TMutationVariables;
    
    try {
      const result = await mutate(variables);
      setIsDirty(false);
      return result;
    } catch (error) {
      throw error;
    }
  }, [formData, mutate, options]);

  return {
    formData,
    updateField,
    updateFormData,
    resetForm,
    submitForm,
    loading,
    error,
    success,
    isDirty,
    clearMessages
  };
};

// Hook for managing list operations (CRUD)
export const useListOperations = <TItem = any>(
  queries: {
    list: any;
    create?: any;
    update?: any;
    delete?: any;
  },
  options?: {
    onItemCreated?: (item: TItem) => void;
    onItemUpdated?: (item: TItem) => void;
    onItemDeleted?: (id: string) => void;
  }
) => {
  const [selectedItem, setSelectedItem] = useState<TItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Query for list data
  const listQuery = useGraphQLQuery(queries.list);

  // Mutations
  const createMutation = queries.create ? useGraphQLMutation(queries.create, {
    onCompleted: (data) => {
      listQuery.refetch();
      options?.onItemCreated?.(data);
      setIsDialogOpen(false);
    }
  }) : null;

  const updateMutation = queries.update ? useGraphQLMutation(queries.update, {
    onCompleted: (data) => {
      listQuery.refetch();
      options?.onItemUpdated?.(data);
      setIsDialogOpen(false);
    }
  }) : null;

  const deleteMutation = queries.delete ? useGraphQLMutation(queries.delete, {
    onCompleted: () => {
      listQuery.refetch();
      options?.onItemDeleted?.(selectedItem?.id);
      setSelectedItem(null);
    }
  }) : null;

  const openCreateDialog = useCallback(() => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((item: TItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedItem(null);
  }, []);

  const createItem = useCallback(async (data: any) => {
    if (createMutation) {
      return await createMutation.mutate(data, 'Item created successfully');
    }
  }, [createMutation]);

  const updateItem = useCallback(async (id: string, data: any) => {
    if (updateMutation) {
      return await updateMutation.mutate({ id, ...data }, 'Item updated successfully');
    }
  }, [updateMutation]);

  const deleteItem = useCallback(async (id: string) => {
    if (deleteMutation) {
      return await deleteMutation.mutate({ id }, 'Item deleted successfully');
    }
  }, [deleteMutation]);

  return {
    // List data
    items: listQuery.data,
    loading: listQuery.loading,
    error: listQuery.error,
    refetch: listQuery.refetch,

    // Dialog state
    selectedItem,
    isDialogOpen,
    openCreateDialog,
    openEditDialog,
    closeDialog,

    // Operations
    createItem,
    updateItem,
    deleteItem,

    // Loading states
    creating: createMutation?.loading || false,
    updating: updateMutation?.loading || false,
    deleting: deleteMutation?.loading || false
  };
};