export const apiname = process.env.API_NAME  || 'api1'
export const api_port =  process.env.API_PORT || 3000
export const env = process.env.NODE_ENV

const defUrl = () => {
  switch (env) {
    case 'production' :
      return 'http://rest.coinapi.io'
    case 'development' :
      return 'http://rest-sandbox.coinapi.io'
    case 'test' :
      return 'http://rest.coinapi.io'
    default :
      return 'http://rest-sandbox.coinapi.io'
  }
}

export const coinapi_key = process.env.COINAPI_KEY
export const coinapi_url = defUrl()
