/* eslint-disable no-undef */
import axios, { CancelTokenSource, InternalAxiosRequestConfig } from "axios";

const GATEWAY_URL = "http://localhost:8888/api";
const instance = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 120 * 1000,
});

instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let accessToken = localStorage.getItem("ACCESS_TOKEN");
    if (!accessToken) {
      window.location.href = "/login";
      return Promise.reject("No access token found");
    }

    config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      window.location.href = "/login";
      return Promise.reject("No access token found");

      return instance(originalRequest); // Gửi lại yêu cầu ban đầu
    }

    return Promise.reject(error);
  }
);

// Hàm introspect token

async function fetch(
  url: string,
  params?: any,
  isAuth?: boolean,
  isRaw?: boolean,
  catchErr?: boolean,
  source?: CancelTokenSource
) {
  let headers: any = null;
  // const headers: any = {
  //   API_KEY: `c713284a-3b4f-4006-9ba0-f5a9551f0a4f`,
  //   CLIENT_ID: "332c97ee-7292-4d9c-9bfc-32653ba6ee39",
  // };
  if (isAuth) {
    headers = await createHeader();
  }
  return !isRaw
    ? instance
        .get(url, { params, headers, cancelToken: source?.token })
        .then((res) => {
          console.log("RESPONSE :", res.data);
          // checkToken(res);
          return res;
        })
    : axios
        .create({
          baseURL: `${GATEWAY_URL}`,
          timeout: 20 * 1000,
        })
        .get(url, { params, headers })
        .then((res) => {
          console.log("test_fetch_raw_success: ", res);
          return res;
        })
        .catch((error) => {
          console.log("test_fetch_raw_fail: ", error);
        });
}

async function post(
  url: string,
  data?: any,
  isAuth?: boolean,
  isRaw?: boolean,
  catchErr?: boolean
) {
  let headers: any = null;
  if (isAuth) {
    headers = await createHeader();
  }
  return !isRaw
    ? instance.post(url, data, { headers }).then((res) => checkToken(res))
    : // .catch((error) => {
      //   console.log("catch_err_post: ", error.response.data);
      //   if (catchErr) {
      //     return error.response.data;
      //   }
      // })
      axios
        .create({
          baseURL: `${GATEWAY_URL}`,
          timeout: 20 * 1000,
        })
        .post(url, data, { headers })
        .then((res) => {
          console.log("test_post_raw_success: ", res);
          return res;
        });
}
async function deletes(
  url: string,
  data?: any,
  isAuth?: boolean,
  catchErr?: boolean
) {
  let headers = null;
  if (isAuth) {
    headers = await createHeader();
  }

  return instance
    .delete(url, { data: data, headers: { ...headers } })
    .then((res) => checkToken(res));
  // .catch((error) => {
  //   if (catchErr) {
  //     return error.response.data;
  //   }
  // });
}
async function put(url: string, data?: any, isAuth?: boolean) {
  let headers: any = null;
  if (isAuth) {
    headers = await createHeader();
  }

  return instance
    .put(url, { ...data }, { headers })
    .then((res) => checkToken(res));
  // .catch((error) => error.response.data);
}

async function createHeader(): Promise<object> {
  var accessToken = localStorage.getItem("ACCESS_TOKEN");

  const headers: any = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  console.log("test_header: ", { ...headers, "Content-Type": "text/plain" });

  return headers;
}

async function getUserInfo(): Promise<any> {
  const res = JSON.parse(localStorage.getItem("USER_INFO") as string);
  return Promise.resolve(res);
}

// TODO
export function checkToken(res: any) {
  console.debug("TEXT RES", res);
  return res;
}

export { fetch, post, put, createHeader, deletes };
