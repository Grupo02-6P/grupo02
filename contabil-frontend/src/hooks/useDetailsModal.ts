import { useState } from 'react';

interface DetailsModalState<T> {
  isOpen: boolean;
  data: T | null;
  isLoading: boolean;
}

export function useDetailsModal<T = any>() {
  const [state, setState] = useState<DetailsModalState<T>>({
    isOpen: false,
    data: null,
    isLoading: false,
  });

  const openModal = () => {
    setState({ isOpen: true, data: null, isLoading: true });
  };

  const setData = (data: T) => {
    setState({ isOpen: true, data, isLoading: false });
  };

  const setError = () => {
    setState({ isOpen: false, data: null, isLoading: false });
  };

  const closeModal = () => {
    setState({ isOpen: false, data: null, isLoading: false });
  };

  return {
    ...state,
    openModal,
    setData,
    setError,
    closeModal,
  };
}
