import {Market} from "../../../models/interphace/market";
import {Symbol} from "../../../models/interphace/symbol";
import {Asset} from "../../../models/interphace/asset";
import findAssets from "./findAssets";
import findMarkets from "./findMarkets";

async function  searchMissAssets(assets : Asset[], symbs : Symbol[]) : Promise<Asset[]> {
  const miss = new Set()
  symbs.forEach(symb => {
    if (!assets.some(asset => asset.name === symb.base )){
      miss.add(symb.base)
    }
    if (!assets.some(asset => asset.name === symb.quote )){
      miss.add(symb.quote)
    }
  })
  const tabmiss = [...miss]
  if (tabmiss.length){
    console.log('il manquais des assets : ', tabmiss.toString())
    return await findAssets({filter_asset_id : tabmiss.toString()})
  }
  return  []
}

async function  searchMissMarkets(markets : Market[], symbs : Symbol[]) : Promise<Market[]> {
  const miss = new Set()
  symbs.forEach(symb => {
    if (!markets.some(market => market.name === symb.market )){
      miss.add(symb.market)
    }
  })
  const tabmiss = [...miss]
  if (tabmiss.length){
    console.log('il manquais des markets : ', tabmiss.toString())
    return await findMarkets({filter_exchange_id : tabmiss.toString()})
  }
  return  []
}

async function patchMiss (markets : Market[], assets : Asset[],symbols : Symbol[]) :  Promise<[Asset[],Market[]]> {
  try {
    const [missingAssets, missingMarkets] = await Promise.all([
      searchMissAssets(assets, symbols),
      searchMissMarkets(markets, symbols)
    ])
    return [missingAssets,missingMarkets]
  }
  catch (err){
    console.log('Il y a eu une erreur dans la captrue des symboles :  ', err)
  }
}

export default patchMiss
