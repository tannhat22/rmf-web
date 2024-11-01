// action - state management
import { INITIAL, REGISTER, LOGIN, LOGOUT } from './actions';

// types
import { AuthProps, AuthActionProps } from 'auth/types';

// initial state
export const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
};

// ==============================|| AUTH REDUCER ||============================== //

const auth = (state = initialState, action: AuthActionProps) => {
  switch (action.type) {
    case INITIAL: {
      const { user, isLoggedIn } = action.payload!;
      return {
        ...state,
        isInitialized: true,
        isLoggedIn,
        user,
      };
    }
    case REGISTER: {
      const { user } = action.payload!;
      return {
        ...state,
        user,
      };
    }
    case LOGIN: {
      const { user } = action.payload!;
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        user,
      };
    }
    case LOGOUT: {
      return {
        ...state,
        isInitialized: true,
        isLoggedIn: false,
        user: null,
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default auth;
