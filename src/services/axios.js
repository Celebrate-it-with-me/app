import axios from 'axios';

const CWM_API = axios.create({
    baseURL: import.meta.env.VITE_API_URL + 'api/v1',
    withCredentials: true,
    headers: {
        Accept: 'application/json'
    }
})

CWM_API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return onError(error);
    }
)

const onError = (error) => {
    if (error.response.status === 401) {
        console.log(error.message);
    }

    if (error.response.status === 403) {
        console.log(error.message);
    }

    if (error.response.status === 404) {
        console.log(error.message);
    }

    return error;
}

export { CWM_API }
