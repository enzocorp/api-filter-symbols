import axios from 'axios'
import {COINAPI} from "../../app";

interface resp_asset {
  "data_symbols_count": number,
  "asset_id": string,
  "name": string,
  "volume_1day_usd": number,
}

async function findAssets () : Promise<resp_asset[]> {
  let url = `${COINAPI}/v1/assets`
  let filteredData : resp_asset[]
  try {
    let {data} : { data : resp_asset[] } =  await axios.get(url)
    filteredData = data.filter(item=>{
      return  item.volume_1day_usd >= 1000000 && item.data_symbols_count >= 2
    })
  }
  catch (err){
    console.log('Il y a eu une erreur dans assets', err)
  }

  return filteredData
}

export default findAssets
