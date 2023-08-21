// store/actions/userActions.js

export const setUserData = (userData) => {
    return {
      type: 'SET_USER_DATA',
      payload: userData
    };
  }
  