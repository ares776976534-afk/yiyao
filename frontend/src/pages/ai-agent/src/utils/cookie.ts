export const getCookie = (cname) => {
  let name = `${cname}=`;
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "";
};

export const setCookie = (cname, value) => {
  document.cookie = `${cname}=${value}; path=/`;
};

export const removeCookie = (cname) => {
  document.cookie = `${cname}=; path=/; max-age=0`;
};

export default {
  getCookie,
  setCookie,
  removeCookie,
};