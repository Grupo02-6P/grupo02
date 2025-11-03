import type { DecodedJWT } from '../types/Permissions';

/**
 * Decodifica um JWT sem verificar a assinatura (apenas para ler dados)
 * @param token - O JWT token
 * @returns Os dados decodificados do token ou null se inválido
 */
export function decodeJWT(token: string): DecodedJWT | null {
  try {
    // JWT tem 3 partes separadas por pontos: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Token JWT inválido');
    }

    // Decodificar o payload (segunda parte)
    const payload = parts[1];
    
    // Adicionar padding se necessário (base64url pode não ter padding)
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    
    // Decodificar de base64url para string
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    
    // Converter para objeto
    const decoded = JSON.parse(decodedPayload) as DecodedJWT;
    
    return decoded;
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
}

/**
 * Verifica se um token JWT está expirado
 * @param token - O JWT token
 * @returns true se o token estiver expirado, false caso contrário
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  
  if (!decoded || !decoded.exp) {
    return true; // Se não conseguir decodificar ou não tem exp, considera expirado
  }
  
  // exp está em segundos, Date.now() em milissegundos
  const currentTime = Math.floor(Date.now() / 1000);
  
  return decoded.exp < currentTime;
}

/**
 * Obtém as abilities do token JWT armazenado no localStorage
 * @param token - Token opcional. Se não fornecido, busca no localStorage
 * @returns Array de abilities ou array vazio se não encontrar
 */
export function getAbilitiesFromToken(token?: string): Array<[string, string, Record<string, any>]> {
  try {
    const jwtToken = token || localStorage.getItem('access_token');
    
    if (!jwtToken) {
      return [];
    }
    
    const decoded = decodeJWT(jwtToken);
    
    if (!decoded || !decoded.abilities) {
      return [];
    }
    
    return decoded.abilities;
  } catch (error) {
    console.error('Erro ao obter abilities do token:', error);
    return [];
  }
}

/**
 * Obtém informações completas do usuário do token JWT
 * @returns Dados do usuário decodificados ou null se não encontrar
 */
export function getUserFromToken(): DecodedJWT | null {
  try {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      return null;
    }
    
    return decodeJWT(token);
  } catch (error) {
    console.error('Erro ao obter usuário do token:', error);
    return null;
  }
}