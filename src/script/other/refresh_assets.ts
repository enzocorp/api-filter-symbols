import modelAsset from "../../models/mongoose/model.asset";
import {COINAPI} from "../../app";
import axios from "axios";

interface axios_resp {
  data : Array<{
    asset_id: string
    price_usd : number
  }>
}

async function refreshAssetsPrice () : Promise<{name : string, price_usd : number}[]> {
  const strAssets : string[] = await modelAsset.find().distinct('name')
  let url = `${COINAPI}/v1/assets`
  const division = Math.ceil(strAssets.length / 1200)
  const axiosPromises : Promise<axios_resp>[] = []
  for(let i = 0; i < division; i++){
    let tab = strAssets.slice(i*1200,(i+1)*1200)
    axiosPromises.push(
      axios.get(url, {params: {filter_asset_id: tab.toString()}})
    )
  }
  const axiosResponses : Array<axios_resp> = await Promise.all(axiosPromises)
  const newPriceAssets : Array<{name : string, price_usd : number}> = []
  axiosResponses.forEach(({data}) => {
    if (data.length)
      data.forEach(item => newPriceAssets.push({name : item.asset_id, price_usd : item.price_usd}))
  })

  strAssets.forEach(asset => {
    if(!newPriceAssets.find(newasset => newasset.name === asset))
      console.log(`ATTENTION UN ASSET N'AS PAS ETE MIS A JOUR !! jai pas trouvé ${asset} !!!!`)
  })
  return newPriceAssets
}

export default refreshAssetsPrice
