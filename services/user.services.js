const axios = require('axios').default;

function findUserDetail({ empId }) {
    const params = `/users?id=${empId}`;
    const api = 'http://localhost:4000';
    return axios.get(`${api}${params}`)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};

function findUserDetails({ empId }) {
    const params = `/users?id=${empId}`;
    const api = 'http://localhost:4000';
    return axios.get(`${api}${params}`)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};

function login({ username, password }) {
    const params = `/users?username=${username}&password=${password}`;
    const api = 'http://localhost:4000';
    return axios.get(`${api}${params}`)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};

function addToCart({ id, data }) {
    const params = `/users/${id}/`;
    const api = 'http://localhost:4000';
    return axios.put(`${api}${params}`, data)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};

function deleteFromCart({ id, data }) {
    const params = `/users/${id}/`;
    const api = 'http://localhost:4000';
    return axios.put(`${api}${params}`, data)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};


module.exports = { findUserDetail, findUserDetails, login, addToCart, deleteFromCart };
