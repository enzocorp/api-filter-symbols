import debuger, {Debugger} from "debug";
import modelApikey from "../models/mongoose/model.apikey";
import axios from "axios";
import {coinapi_key} from "../../config/apikey";

const debug : Debugger = debuger('api:axiosInterceptor')

export async function saveCoinapiLimitSucces (resp) {
  try{
    const usedKey = resp?.config?.headers['X-CoinAPI-Key']
    if (usedKey && resp.headers['x-ratelimit-limit'])
      await modelApikey.updateOne(
        {used : true, key : usedKey},
        {
          limit : +resp.headers['x-ratelimit-limit'],
          remaining : +resp.headers['x-ratelimit-remaining'],
          dateReflow : resp.headers['x-ratelimit-reset']
        },
        { upsert : false}
      )
    coinapi_key().then(key => axios.defaults.headers.common['X-CoinAPI-Key'] = key)// A la fin de chaque requetes axios on met a jour la clé d'api
    return resp;
  }
  catch (err){
    return resp;
  }
}


export async function saveCoinapiLimitError (error) {
  try{
    const {response} = error
    const usedKey = response?.config?.headers['X-CoinAPI-Key']
    if (usedKey && response.headers['x-ratelimit-limit'])
      await modelApikey.updateOne(
        {used : true, },
        {
          limit : +response.headers['x-ratelimit-limit'],
          remaining : +response.headers['x-ratelimit-remaining'],
          dateReflow : response.headers['x-ratelimit-reset']
        },
        { upsert : false})
    coinapi_key().then(key => axios.defaults.headers.common['X-CoinAPI-Key'] = key)//Si une requêtes axios échoue on met a jour la clé d'api qu'utilisera l'app
    return error;
  }
  catch (catchedErr){
    return error
  }
}
