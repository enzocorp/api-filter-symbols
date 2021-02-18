import axios from 'axios'
import {Market} from "../../../../models/interphace/market";
import {COINAPI_URL} from "../../../../../config/globals";
import {market_symbolsCount, market_volume_usd1day} from "../../config_init";
import debuger, {Debugger} from "debug";
import ErrorsGenerator from "../../../../../services/ErrorsGenerator";
import {StatusCodes} from "http-status-codes";
import path from "path";


const debug : Debugger = debuger('api:findMarkets')

interface axios_resp  {
  data? : resp_exchanges[]
  response? : { data : {error : string}}
}

interface resp_exchanges {
  data_symbols_count: number,
  exchange_id: string,
  name: string,
  volume_1day_usd: number,
  website: string
}

//Recupere les markets sur coinapi
async function getMarkets (params = {}) :  Promise<Market[]> {
  let url = `${COINAPI_URL}/v1/exchanges`
  let axiosResp : axios_resp =  await axios.get(url,{params})
  if(!axiosResp.data && axiosResp.response?.data?.error){
    throw new ErrorsGenerator(
      "Probleme coinApi",
      axiosResp.response.data.error,
      StatusCodes.PRECONDITION_FAILED,
      "/" + path.basename(__filename)
    )
  }
  else if(!axiosResp.data){
    debug("%O", axiosResp)
    throw new ErrorsGenerator(
      "Probleme coinApi",
      "Echec de récupération des markets sur coinApi",
      StatusCodes.INTERNAL_SERVER_ERROR,
      "/" + path.basename(__filename)
    )
  }
  const exchanges : resp_exchanges[] = axiosResp.data

  return <Market[]>(
    exchanges.filter(exchange=> exchange.volume_1day_usd >= market_volume_usd1day && exchange.data_symbols_count >= market_symbolsCount)
      .map(exchange => ({
            name: exchange.exchange_id,
            longName: exchange.name,
            website: exchange.website,
            pairsCount: exchange.data_symbols_count,
            exclusion: {
              isExclude: false,
              reasons: [],
              severity: 0,
              excludeBy: null,
              note: null
            },
        date : new Date()
      }))
  )
}


export default getMarkets
