import modelAsset from "../../../models/mongoose/model.asset";
import axios from "axios";
import {COINAPI_URL} from "../../../../config/globals";

interface axios_resp {
  data : Array<{
    asset_id: string
    price_usd : number
  }>
}

interface raw_asset {
  asset_id: string
  price_usd : number
}



//Rafraichie les prix des assets
async function refreshAssetsPrice () : Promise<{name : string, price_usd : number}[]> {
  let maxArraySize = 1200
  const strOldAssets : string[] = await modelAsset.find().distinct('name')
  let url = `${COINAPI_URL}/v1/assets`
  const division = Math.ceil(strOldAssets.length / maxArraySize)
  const axiosPromises : Promise<axios_resp>[] = []
  for(let i = 0; i < division; i++){
    let tab = strOldAssets.slice(i*maxArraySize,(i+1)*maxArraySize)
    axiosPromises.push(
      axios.get(url, {params: {filter_asset_id: tab.toString()}})
    )
  }
  const axiosResponses : Array<axios_resp> = await Promise.all(axiosPromises)

  const raw_assets : raw_asset[] = []
  axiosResponses.forEach(axios_resp => raw_assets.push(...axios_resp.data))

  const newPriceAssets : Array<{name : string, price_usd : number}> = []
  raw_assets.forEach(raw_asset => {
    if (!raw_asset.price_usd && /USD/i.test(raw_asset.asset_id) ){
      newPriceAssets.push({name : raw_asset.asset_id, price_usd : 1 })
    }
    else {
      newPriceAssets.push({name : raw_asset.asset_id, price_usd : raw_asset.price_usd})
    }
  })


  //Vérifie que tous les assets ont été mis a jours
  strOldAssets.forEach(strOldAsset => {
    if(newPriceAssets.some(newAsset => newAsset.name === strOldAsset) === false )
      console.log(`ATTENTION UN ASSET N'AS PAS ETE MIS A JOUR !! jai pas trouvé ${strOldAsset} !!!!`)
  })
  return newPriceAssets
}

export default refreshAssetsPrice
