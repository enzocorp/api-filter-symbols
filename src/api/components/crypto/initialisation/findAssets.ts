import axios from 'axios'
import {COINAPI} from "../../../../app";
import {Asset} from "../../../models/interphace/asset";
import {asset_symbolsCount, asset_volume_usd1day} from "./initialisationFilters";

interface resp_asset {
  "data_symbols_count": number
  "asset_id": string
  "name": string
  "volume_1day_usd": number
  type_is_crypto : 1 | 0
  price_usd : number
}

async function findAssets (params = {}) : Promise<Asset[]> {
  try {
    let url = `${COINAPI}/v1/assets`
    let {data : assets} : { data : resp_asset[] } =  await axios.get(url,{params})
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
  catch (err){
    console.log('Il y a eu une erreur dans la recherche d`assets', err)
  }
}

export default findAssets
