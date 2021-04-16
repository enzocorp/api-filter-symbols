import {Market} from "../../../../models/interphace/market";
import {Symbol} from "../../../../models/interphace/symbol";
import {Asset} from "../../../../models/interphace/asset";
import getAsssets from "./getAsssets";
import getMarkets from "./getMarkets";
import debuger from "debug";

const debug = debuger("api:patchMissing")

//recherche si des markets manquaient et les recupèrent sur coinapi
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
    debug('%O','il manquais des assets : ', tabmiss.toString())
    return await getAsssets({filter_asset_id : tabmiss.toString()})
  }
  return  []
}

//recherche si des asset manquaient et les recupèrent sur coinapi
async function  searchMissMarkets(markets : Market[], symbs : Symbol[]) : Promise<Market[]> {
  const miss = new Set()
  symbs.forEach(symb => {
    if (!markets.some(market => market.name === symb.market )){
      miss.add(symb.market)
    }
  })
  const tabmiss = [...miss]
  if (tabmiss.length){
    debug("%O",'il manquais des markets : ', tabmiss.toString())
    return await getMarkets({filter_exchange_id : tabmiss.toString()})
  }
  return  []
}

//Recherche et Récupère les eventuels markets et assets manquants par rapport aux symboles récupérés
async function patchMiss (markets : Market[], assets : Asset[],symbols : Symbol[]) :  Promise<[Asset[],Market[]]> {
  try {
    const [missingAssets, missingMarkets] = await Promise.all([
      searchMissAssets(assets, symbols),
      searchMissMarkets(markets, symbols)
    ])
    return [missingAssets,missingMarkets]
  }
  catch (err){
    debug('Il y a eu une erreur dans la capture des symboles :  ', err)
  }
}

export default patchMiss
