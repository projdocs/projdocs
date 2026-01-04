import axios, { AxiosInstance } from "axios";



export const BackendAPI = (throwErrors?: boolean): AxiosInstance => {
  if (typeof window === "undefined") {
    throw new Error("BackendAPI must be called in the browser");
  }

  const { protocol, host } = window.location;

  return axios.create({
    baseURL: `${protocol}//${host}`,
    withCredentials: true,
    validateStatus: throwErrors === undefined || !throwErrors ? (() => true) : undefined
  });
};