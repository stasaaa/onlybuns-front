import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      user: JSON.parse(sessionStorage.getItem('user')) || {
        id: -1,
        email: '',
        name: '',
        username: '',
        password: '',
        passwordConfirm: '',
        userRole: '',
        address: {
          country: '',
          postalCode: '',
          city: '',
          streetName: '',
          streetNumber: ''
        }
      },
      token: sessionStorage.getItem('token') || '',  // Load token from sessionStorage if available
      countries: []
    };
  },
  mutations: {
    // Mutation to set user data
    setUser(state, userData) {
      state.user = userData;
      sessionStorage.setItem('user', JSON.stringify(userData)); // Persist user data in sessionStorage
    },
    // Mutation to set token data
    setToken(state, token) {
      state.token = token;
      sessionStorage.setItem('token', token); // Persist token in sessionStorage
    },
    // Mutation to clear user data and token
    resetUser(state) {
      state.user = {
        id: -1,
        email: '',
        name: '',
        username: '',
        password: '',
        passwordConfirm: '',
        role:'',
        address: {
          country: '',
          postalCode: '',
          city: '',
          streetName: '',
          streetNumber: ''
        }
      };
      state.token = '';
      sessionStorage.removeItem('user');  // Clear user data from sessionStorage
      sessionStorage.removeItem('token'); // Clear token from sessionStorage
    },
    setCountries(state, countriesData) {
      state.countries = countriesData;
    }
  },
  actions: {
    // Fetch countries data and commit to store
    async fetchCountries({ commit }) {
      const response = await fetch('https://restcountries.com/v3.1/all');
      const data = await response.json();
      commit('setCountries', data);
    },
    // Set user data through an action
    setUser({ commit }, userData) {
      commit('setUser', userData);
    },
    // Set token data through an action
    setToken({ commit }, token) {
      commit('setToken', token);
    },
    // Reset user and token through an action
    resetUser({ commit }) {
      commit('resetUser');
    }
  },
  getters: {
    // Getter to access the user data
    getUser(state) {
      return state.user;
    },
    // Getter to access the JWT token
    getToken(state) {
      return state.token;
    },
    // Getter to access the countries data
    getCountries(state) {
      return state.countries;
    }
  }
});

export default store;