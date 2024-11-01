import React, { createContext, useEffect, useCallback, useMemo, useReducer } from 'react';
import { AxiosResponse } from 'axios';

// reducer - state management
import { INITIAL, LOGIN, LOGOUT, REGISTER } from 'store/reducers/actions';
import authReducer from 'store/reducers/auth';

// project import
import Loader from 'components/Loader';
import axios from 'utils/axios';
import localStorageAvailable from 'utils/localStorageAvailable';

import { isValidToken, setSession } from './utils';

// types
import { AuthProps, JWTContextType } from 'auth/types';

// constant
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext<JWTContextType | null>(null);

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const storageAvailable = localStorageAvailable();

  const initialize = useCallback(async () => {
    try {
      const accessToken = storageAvailable ? localStorage.getItem('accessToken') : '';

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const { data: user }: AxiosResponse = await axios.get('/api/account/me/');

        dispatch({
          type: INITIAL,
          payload: {
            isLoggedIn: true,
            user,
          },
        });
      } else {
        dispatch({
          type: INITIAL,
          payload: {
            isLoggedIn: false,
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: INITIAL,
        payload: {
          isLoggedIn: false,
          user: null,
        },
      });
    }
  }, [storageAvailable]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    const response = await axios.post('/api/account/login/', {
      email,
      password,
    });
    const { access } = response.data;
    setSession(access);

    const { data: user }: AxiosResponse = await axios.get('/api/account/me/');

    dispatch({
      type: LOGIN,
      payload: {
        user,
      },
    });
  }, []);

  // REGISTER
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      const response = await axios.post('/api/account/register/', {
        email,
        password,
        firstName,
        lastName,
      });
      const { access } = response.data;
      setSession(access);

      const { data: user }: AxiosResponse = await axios.get('/api/account/me/');

      dispatch({
        type: REGISTER,
        payload: {
          user,
        },
      });
    },
    []
  );

  // LOGOUT
  const logout = useCallback(() => {
    setSession(null);
    dispatch({
      type: LOGOUT,
    });
  }, []);

  const resetPassword = async (email: string) => {};

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext.Provider
      value={{ ...state, login, logout, register, resetPassword, updateProfile }}
    >
      {children}
    </JWTContext.Provider>
  );
};

export default JWTContext;
