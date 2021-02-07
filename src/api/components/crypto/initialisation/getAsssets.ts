import axios from 'axios'
import {Asset} from "../../../models/interphace/asset";
import {COINAPI_KEY, COINAPI_URL} from "../../../../config/globals";
import {asset_symbolsCount, asset_volume_usd1day} from "../config_init";
import ErrorsGenerator from "../../../../services/ErrorsGenerator";
import {StatusCodes} from "http-status-codes";
import path from "path";
import debuger, {Debugger} from "debug";


interface axios_resp  {
  data? : resp_asset[]
  response? : { data : {error : string}}
}

interface resp_asset {
  "data_symbols_count": number
  "asset_id": string
  "name": string
  "volume_1day_usd": number
  type_is_crypto : 1 | 0
  price_usd : number
}

const debug : Debugger = debuger('api:findAssets')


//Recupere les assets sur l'api coinapi
async function getAsssets (params = {}) : Promise<Asset[]> {
    let url = `${COINAPI_URL}/v1/assets`
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
        "Probleme CoinAPI",
        "Echec de récupération des assets sur coinApi",
        StatusCodes.INTERNAL_SERVER_ERROR,
        "/" + path.basename(__filename)
      )
    }
    const assets : resp_asset[] = axiosResp.data

    return <Asset[]>(
      assets.filter(asset=> asset.volume_1day_usd >= asset_volume_usd1day && asset.data_symbols_count >= asset_symbolsCount)
        .map(asset => ({
          name: asset.asset_id,
          longName: asset.name,
          price_usd: asset.price_usd || 1,
          typeIsCrypto: !!asset.type_is_crypto,
          inPairCount : asset.data_symbols_count,
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

export default getAsssets
