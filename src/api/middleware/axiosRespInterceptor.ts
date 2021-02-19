import debuger, {Debugger} from "debug";
import modelApikey from "../models/mongoose/model.apikey";
import axios from "axios";
import {coinapi_key} from "../../config/apikey";

const debug : Debugger = debuger('api:axiosInterceptor')

//Se declenche après la reponse de success d'axios
export async function saveCoinapiLimitSucces (resp) {
  try{
    const usedKey = resp?.config?.headers['X-CoinAPI-Key']
    if (usedKey && resp.headers['x-ratelimit-limit'])
      await modelApikey.updateOne(
        {key : usedKey},
        {
          limit : +resp.headers['x-ratelimit-limit'],
          remaining : +resp.headers['x-ratelimit-remaining'],
          dateReflow : resp.headers['x-ratelimit-reset']
        },
        { upsert : false}
      )
    coinapi_key().then(key => axios.defaults.headers.common['X-CoinAPI-Key'] = key)//A la fin de chaque axios-request réussi, on redéfini la clé d'api
    return resp;
  }
  catch (err){
    return resp;
  }
}

//Se declenche après la reponse d'erreur d'axios
export async function saveCoinapiLimitError (error) {
  try{
    const {response} = error
    const usedKey = response?.config?.headers['X-CoinAPI-Key']
    if (usedKey && response.headers['x-ratelimit-limit']) //On met a jour la clé utilisée pour la requête
      await modelApikey.updateOne(
        {key : usedKey},
        {
          limit : +response.headers['x-ratelimit-limit'],
          remaining : +response.headers['x-ratelimit-remaining'],
          dateReflow : response.headers['x-ratelimit-reset']
        },
        { upsert : false})
    coinapi_key().then(key => axios.defaults.headers.common['X-CoinAPI-Key'] = key)//A la fin de chaque axios-request échouée, on redéfini la clé d'api
    return error;
  }
  catch (catchedErr){
    return error
  }
}
