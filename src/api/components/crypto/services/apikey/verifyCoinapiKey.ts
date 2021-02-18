import {COINAPI_URL} from "../../../../../config/globals";
import axios from "axios";
import ErrorsGenerator from "../../../../../services/ErrorsGenerator";
import {StatusCodes} from "http-status-codes";
import path from "path";
import modelApikey from "../../../../models/mongoose/model.apikey";

interface axios_resp  {
  data? : any
  response? : { data : {error : string} }
  headers : Object
}

async function verifyCoinapiKey (key : string) : Promise<{limit : number, remaining : number, dateReflow}> {

  const exist = await modelApikey.find({key : key}).lean()
  if(exist.length){
    throw new ErrorsGenerator(
      "Doublon de la clé",
      "Cette clé coinapi existe déjà ! ",
      StatusCodes.BAD_REQUEST,
      "/" + path.basename(__filename)
    )
  }
  else if(!key || key.length === 0){
    throw new ErrorsGenerator(
      "Il faut indiquer la clé d'api",
      "Vous devez fournir une clé d'api",
      StatusCodes.BAD_REQUEST,
      "/" + path.basename(__filename)
    )
  }

  let url = `${COINAPI_URL}/v1/assets/BTC`
  let {headers} : axios_resp =  await axios.get(url, {headers: { 'X-CoinAPI-Key' : key } })
  if (headers && headers['x-ratelimit-limit']){
    return {
      limit : +headers['x-ratelimit-limit'],
      remaining : +headers['x-ratelimit-remaining'],
      dateReflow : headers['x-ratelimit-reset']
    }
  }
  else {
    throw new ErrorsGenerator(
      "Probleme ajout clé CoinApi",
      "La nouvelle clé est invalide !",
      StatusCodes.BAD_REQUEST,
      "/" + path.basename(__filename)
    )
  }
}

export default verifyCoinapiKey
