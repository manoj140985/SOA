import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthTestResult } from '../types/auth';
import { SEEDED_USERS } from '../mocks/seedData';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loginAsDemoRole: (role: UserRole) => void;
  loginWithCredentials: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  runAuthorizationTest: (endpoint: string, method?: 'GET' | 'POST') => Promise<AuthTestResult>;
  lastAuthTestResult: AuthTestResult | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate mock JWT token for demo mode
const generateDemoJwt = (user: User): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.username,
      userId: user.id,
      name: user.fullName,
      role: user.role,
      department: user.department,
      iss: 'examguard-auth-service',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    })
  );
  return `${header}.${payload}.demo_signature_hash_verify`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to examAuthor in demo mode so full app functions out of the box
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('examguard_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEEDED_USERS.examAuthor;
      }
    }
    return SEEDED_USERS.examAuthor;
  });

  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('examguard_jwt_token');
    if (savedToken) return savedToken;
    return generateDemoJwt(SEEDED_USERS.examAuthor);
  });

  const [lastAuthTestResult, setLastAuthTestResult] = useState<AuthTestResult | null>(null);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('examguard_current_user', JSON.stringify(user));
      localStorage.setItem('examguard_jwt_token', token);
    } else {
      localStorage.removeItem('examguard_current_user');
      localStorage.removeItem('examguard_jwt_token');
    }
  }, [user, token]);

  // Listen for session expiry event from apiClient
  useEffect(() => {
    const handleExpired = () => {
      logout();
    };
    window.addEventListener('examguard:auth_expired', handleExpired);
    return () => window.removeEventListener('examguard:auth_expired', handleExpired);
  }, []);

  const loginAsDemoRole = (role: UserRole) => {
    const selectedUser = SEEDED_USERS[role];
    if (selectedUser) {
      const demoToken = generateDemoJwt(selectedUser);
      setUser(selectedUser);
      setToken(demoToken);
    }
  };

  const loginWithCredentials = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const isDemo = localStorage.getItem('examguard_demo_mode') !== 'false';

    if (isDemo) {
      // Demo authentication logic
      const matchedUser = Object.values(SEEDED_USERS).find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (!matchedUser) {
        return {
          success: false,
          error: 'Invalid credentials. In Demo mode, valid usernames are "examAuthor" or "questionReviewer" (password: any value).',
        };
      }

      const generatedToken = generateDemoJwt(matchedUser);
      setUser(matchedUser);
      setToken(generatedToken);
      return { success: true };
    } else {
      // Live backend call through Spring Cloud Gateway
      try {
        const response = await apiClient.post('/api/auth/login', { username, password });
        const { token: receivedToken, user: receivedUser } = response.data;
        setUser(receivedUser);
        setToken(receivedToken);
        return { success: true };
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.';
        return { success: false, error: message };
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('examguard_current_user');
    localStorage.removeItem('examguard_jwt_token');
  };

  const runAuthorizationTest = async (
    endpoint: string,
    method: 'GET' | 'POST' = 'GET'
  ): Promise<AuthTestResult> => {
    const isDemo = localStorage.getItem('examguard_demo_mode') !== 'false';
    const currentUser = user || SEEDED_USERS.examAuthor;

    if (isDemo) {
      // Deterministic simulation of Spring Security MethodSecurity / Gateway filters
      // examAuthor can POST /api/papers/generate
      // questionReviewer attempting POST /api/papers/generate receives HTTP 403 Forbidden
      let statusCode = 200;
      let outcome: 'ALLOWED' | 'FORBIDDEN' | 'UNAUTHORIZED' | 'ERROR' = 'ALLOWED';
      let responseMessage = 'Request successfully authorized by Spring Security gateway filters.';

      if (endpoint === '/api/papers/generate' && method === 'POST') {
        if (currentUser.role === 'questionReviewer') {
          statusCode = 403;
          outcome = 'FORBIDDEN';
          responseMessage =
            'HTTP 403 FORBIDDEN: Role "ROLE_QUESTION_REVIEWER" does not have privilege "AUTHORITY_PAPER_GENERATE". Only "ROLE_EXAM_AUTHOR" is permitted to invoke the PaperAssembly orchestration service.';
        } else {
          statusCode = 200;
          outcome = 'ALLOWED';
          responseMessage =
            'HTTP 200 OK: User has "ROLE_EXAM_AUTHOR" with granted authority "AUTHORITY_PAPER_GENERATE". Request dispatched to PaperAssembly microservice.';
        }
      } else if (endpoint === '/api/questions' && method === 'POST') {
        statusCode = 201;
        outcome = 'ALLOWED';
        responseMessage = `HTTP 201 CREATED: User role "${currentUser.role}" authorized to create question bank entries.`;
      } else if (endpoint === '/actuator/health') {
        statusCode = 200;
        outcome = 'ALLOWED';
        responseMessage = 'HTTP 200 OK: Public actuator health check returned status UP.';
      }

      const result: AuthTestResult = {
        endpoint,
        method,
        testedAt: new Date().toISOString(),
        user: currentUser,
        statusCode,
        outcome,
        responseMessage,
        simulated: true,
      };

      setLastAuthTestResult(result);
      return result;
    } else {
      // Live backend invocation
      try {
        const response = await (method === 'POST' ? apiClient.post(endpoint, {}) : apiClient.get(endpoint));
        const result: AuthTestResult = {
          endpoint,
          method,
          testedAt: new Date().toISOString(),
          user: currentUser,
          statusCode: response.status,
          outcome: 'ALLOWED',
          responseMessage: `HTTP ${response.status} ${response.statusText}: ${JSON.stringify(response.data).slice(0, 150)}...`,
          simulated: false,
        };
        setLastAuthTestResult(result);
        return result;
      } catch (err: any) {
        const status = err.response?.status || 500;
        let outcome: 'ALLOWED' | 'FORBIDDEN' | 'UNAUTHORIZED' | 'ERROR' = 'ERROR';
        if (status === 403) outcome = 'FORBIDDEN';
        else if (status === 401) outcome = 'UNAUTHORIZED';

        const result: AuthTestResult = {
          endpoint,
          method,
          testedAt: new Date().toISOString(),
          user: currentUser,
          statusCode: status,
          outcome,
          responseMessage: err.response?.data?.message || err.message || 'Error occurred contacting endpoint.',
          simulated: false,
        };
        setLastAuthTestResult(result);
        return result;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loginAsDemoRole,
        loginWithCredentials,
        logout,
        runAuthorizationTest,
        lastAuthTestResult,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
