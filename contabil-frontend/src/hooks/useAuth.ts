// DEPRECADO: Use o useAuth do AuthContext em vez deste hook
// Este arquivo será removido em uma versão futura

import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = useAuthContext;