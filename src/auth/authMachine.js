import { createMachine, assign } from 'xstate';

const config = {
  id: 'auth',
  // we want to start by checking if
  // user is logged in when page loads
  initial: 'authenticating',
  // context is where you keep state
  context: {
    auth: null,
    user: null,
    error: null
  },
  // all possible authentication states
  states: {
    authenticating: {
      // when entering a state invoke
      // the authChecker service
      invoke: {
        id: 'authChecker',
        src: 'authChecker',
        onDone: { target: 'loading', actions: 'setAuth' },
        onError: { target: 'signedOut' }
      }
    },
    // we will enrich the user profile
    // with additional data
    loading: {
      invoke: {
        id: 'loader',
        src: 'loader',
        onDone: { target: 'signedIn', actions: 'setUser' },
        onError: {
          target: 'signedOut.failure',
          actions: ['setError', 'clearAuth']
        }
      }
    },
    signedIn: {
      // when receiving 'LOGOUT' event
      // transition to singingOut state
      on: { LOGOUT: { target: 'signingOut' } }
    },
    // signedOut has two sub-states
    // we will transition to failure in
    // case of wrong password, username
    // or network error
    signedOut: {
      initial: 'ok',
      states: {
        ok: { type: 'final' },
        failure: {}
      },
      on: {
        LOGIN: { target: 'signingIn' }
      }
    },
    signingIn: {
      invoke: {
        id: 'authenticator',
        src: 'authenticator',
        onDone: {
          target: 'authenticating',
          // clear error if successful login
          actions: 'clearError'
        },
        onError: {
          // transition to failure state
          // and set an error
          target: 'signedOut.failure',
          actions: 'setError'
        }
      }
    },
    signingOut: {
      invoke: {
        id: 'logout',
        src: 'logout',
        onDone: {
          target: 'signedOut',
          actions: ['clearAuth', 'clearError']
        },
        onError: {
          target: 'signedOut.failure',
          actions: ['clearAuth', 'setError']
        }
      }
    }
  }
};

export const initAuthMachine = services => {
  // define XState actions so that we can
  // refer to them by name in machine config
  const actions = {
    // clear user info on logout
    clearAuth: assign({ user: null, auth: null }),
    clearError: assign({ error: null }),
    // put Firebase auth object on context
    setAuth: assign({ auth: (_, event) => event.data }),
    // put user on context in loading service
    setUser: assign({ user: (_, event) => event.data }),
    setError: assign({
      error: (_, event) => event.data
    })
  };

  // create an options object containing
  // actions and services
  const options = {
    actions,
    services
  };

  return createMachine(config, options);
};
