import axios from 'axios'
import {COINAPI} from "../../app";
import {Asset} from "../../models/interphace/asset";

interface resp_asset {
  "data_symbols_count": number
  "asset_id": string
  "name": string
  "volume_1day_usd": number
  type_is_crypto : 1 | 0
  price_usd : number
}

async function findAssets () : Promise<Asset[]> {
  try {
    let url = `${COINAPI}/v1/assets`
    let {data : assets} : { data : resp_asset[] } =  await axios.get(url)
    return <Asset[]>(
      assets.filter(asset=> asset.volume_1day_usd >= 1000000 && asset.data_symbols_count >= 2)
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
          }
        }))
    )
  }
  catch (err){
    console.log('Il y a eu une erreur dans la recherche d`assets', err)
  }
}

export default findAssets
