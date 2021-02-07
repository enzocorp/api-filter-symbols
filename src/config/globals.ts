export const API_NAME = process.env.API_NAME  || 'api1'
export const API_PORT =  process.env.API_PORT || 3000
export const NODE_ENV = process.env.NODE_ENV

const defUrl = () => {
  switch (NODE_ENV) {
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

export const COINAPI_KEY = process.env.COINAPI_KEY
export const COINAPI_URL = defUrl()
