export const api = (url, app) => {
  try {
    console.log('   Using API.', `${app.$axios.defaults.baseURL}${url}`)
    return app.$axios.get(url)
  } catch (e) {
    console.log(e)
  }

  try {
    const url = `${app.$axios.defaults.baseURL.replace(/(https?:\/\/[^/]+)\/.*$/, m => m[1])}/_nuxt/api/${url}.json`
    console.log('   Using static file.', url)
    return app.$axios.get(url)
  } catch (e) {
    console.log('   Static file', e)
  }
}
