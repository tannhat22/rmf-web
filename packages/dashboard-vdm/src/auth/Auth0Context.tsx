import React, { createContext, useEffect, useCallback, useReducer } from 'react';
// import { AxiosResponse } from 'axios';

// reducer - state management
import { INITIAL, LOGIN, LOGOUT } from 'store/reducers/actions';
import authReducer from 'store/reducers/auth';

// project import
import Loader from 'components/Loader';
// import axios from 'utils/axios';
// import localStorageAvailable from 'utils/localStorageAvailable';

// import { isValidToken, setSession } from './utils';

// types
import { AuthProps, UserProfile, Auth0ContextType } from 'auth/types';

// custom
import appConfig from 'app-config';

// constant
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
};

// ==============================|| Auth0 CONTEXT & PROVIDER ||============================== //

const Auth0Context = createContext<Auth0ContextType | null>(null);

export const Auth0Provider = ({ children }: { children: React.ReactElement }) => {
  const authenticator = appConfig.authenticator;
  const [state, dispatch] = useReducer(authReducer, initialState);

  // const storageAvailable = localStorageAvailable();

  // INITIAL
  useEffect(() => {
    let cancel = false;
    // const onUserChanged = (newUser: string | null) => {
    //   console.log('user change', newUser);
    //   const user: UserProfile = {
    //     name: newUser,
    //   };
    //   if (newUser) {
    //     dispatch({
    //       type: LOGIN,
    //       payload: {
    //         user,
    //       },
    //     });
    //   } else {
    //     dispatch({
    //       type: LOGOUT,
    //     });
    //   }
    // };
    // authenticator.on('userChanged', onUserChanged);
    (async () => {
      await authenticator.init();
      if (cancel) {
        return;
      }
      const user: UserProfile = {
        name: authenticator.user || null,
      };
      dispatch({
        type: INITIAL,
        payload: {
          isLoggedIn: !!user.name,
          user: user.name ? user : null,
        },
      });
    })();
    return () => {
      cancel = true;
      // authenticator.off('userChanged', onUserChanged);
    };
  }, [authenticator]);

  // LOGIN
  const login = useCallback(
    async (successRedirectUri: string) => {
      await authenticator.login(successRedirectUri);
    },
    [authenticator]
  );

  // LOGOUT
  const logout = useCallback(async () => {
    await authenticator.logout();
    dispatch({
      type: LOGOUT,
    });
  }, [authenticator]);

  // RefreshToken
  const refreshToken = useCallback(async () => {
    await authenticator.refreshToken();
  }, [authenticator]);

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <Auth0Context.Provider value={{ ...state, login, logout, refreshToken }}>
      {children}
    </Auth0Context.Provider>
  );
};

export default Auth0Context;
