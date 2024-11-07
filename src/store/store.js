import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      user: {
        id: -1,
        email: '',
        name: '',
        username: '',
        password: '',
        passwordConfirm: '',
        address: {
          country: '',
          postalCode: '',
          city: '',
          streetName: '',
          streetNumber: ''
        }
      },
      countries: []
    };
  },
  mutations: {
    setUser(state, userData) {
      state.user = userData;
    },
    setCountries(state, countriesData) {
      state.countries = countriesData;
    }
  },
  actions: {
    async fetchCountries({ commit }) {
      const response = await fetch('https://restcountries.com/v3.1/all');
      const data = await response.json();
      commit('setCountries', data);
    },
    setUser({ commit }, userData) {
      commit('setUser', userData);
    }
  },
  getters: {
    getUser(state) {
      return state.user;
    },
    getCountries(state) {
      return state.countries;
    }
  }
});

export default store;
