import {Symbol} from "../../../models/interphace/symbol";
import {Asset} from "../../../models/interphace/asset";
import {Market} from "../../../models/interphace/market";


//Filtre les markets et les assets pour vérifier qu'ils soient présent dans aumoins 1 symbole
async function filterAssetsMarkets (symbols : Symbol[], assets : Asset[], markets : Market[],) :Promise<[Asset[], Market[]]> {
  const filterAssets = async ()=> assets.filter(asset => symbols.some(symb => symb.quote === asset.name || symb.base === asset.name))
  const filterMarkets = async ()=> markets.filter(market => symbols.some(symb => symb.market === market.name))
  const [A,M] : [Asset[],Market[]] = await Promise.all([
    filterAssets(),
    filterMarkets()
  ])
  return [A, M]
}

export default filterAssetsMarkets
