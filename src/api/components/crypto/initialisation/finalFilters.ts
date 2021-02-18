import {Symbol} from "../../../models/interphace/symbol";
import {Asset} from "../../../models/interphace/asset";
import {Market} from "../../../models/interphace/market";
import modelAsset from "../../../models/mongoose/model.asset";



//Vérifie que chaque pair appartiennent a un groupe de 2 minimum
async function symbsVerifyGroups (symbols : Symbol[]) :Promise<Symbol[]> {
  let group : Record<string, Symbol[]> = {}
  symbols.forEach(symb =>{
    if(!group[symb.pair]) {
      group[symb.pair] = []
    }
    group[symb.pair].push(symb)
  })
  let filteredSymbols : Symbol[] = []
  for (let pair in group) {
    if(group[pair].length >= 2 )  filteredSymbols.push(...group[pair])
  }

  return filteredSymbols
}

//Verifie dans chaque symboles les ptes "market", "base" et "quote"
async function symbsVerifyProperties (symbols : Symbol[], assets : Asset[], markets : Market[],) :Promise<Symbol[]> {
  return symbols.filter(symb => (
    assets.some(asset => symb.base === asset.name)  &&
    assets.some(asset => symb.quote === asset.name) &&
    markets.some(market => symb.market === market.name)
  ))
}


//Vérifier que chaque market et assets soient présent dans aumoins 1 symbole
async function verifyAssetsAndMarkets (symbols : Symbol[], assets : Asset[], markets : Market[],) :Promise<[Asset[], Market[]]> {
  return await Promise.all([
    assets.filter(asset => symbols.some(symb => symb.quote === asset.name || symb.base === asset.name)),
    markets.filter(market => symbols.some(symb => symb.market === market.name))
  ])
}


//Vérifier que chaque market et assets soient présent dans aumoins 1 symbole
async function finalFilters (symbols : Symbol[], assets : Asset[], markets : Market[],) :Promise<{markets : Market[],symbols : Symbol[], assets : Asset[]}> {
  const filteredSymbs1 : Symbol[] = await symbsVerifyGroups(symbols)
  const filteredSymbs2 : Symbol[] = await symbsVerifyProperties(filteredSymbs1,assets,markets)

  //On filtre les symboles qui contiennes des assets qu'on à ban  !
  const bannedAssets : Array<{name : string}> = await modelAsset.find({"exclusion.isExclude" : true},"name -_id").lean()
  const filteredSymbs3 = filteredSymbs2.filter(symb => (
    !bannedAssets.some(asset => asset.name === symb.base) &&
    !bannedAssets.some(asset => asset.name === symb.quote)
  ))

  const [filteredAssets , filteredMarkets] = await verifyAssetsAndMarkets(filteredSymbs3, assets, markets)

  return {assets : filteredAssets, symbols : filteredSymbs3, markets : filteredMarkets}
}

export default finalFilters
