import axios from 'axios'
import {Market} from "../../models/interphace/market";
import {Symbol} from "../../models/interphace/symbol";
import {COINAPI} from "../../app";
import {Asset} from "../../models/interphace/asset";


interface resp_symbols {
  symbol_id: string,
  symbol_type: 'SPOT' | 'FUTURES'
  asset_id_base: string,
  asset_id_quote: string,
  volume_1day_usd: number,
  exchange_id : string
}

async function strMarketsNames (markets : Market[]) : Promise<string> {
  let str : string = ''
  for  (let market of markets)
    str += `${market.name},`
  return str
}

async function  strAssetsNames(assets : Asset[]) : Promise<string> {
  let str : string = ''
  for (let asset of assets)
    str += `${asset.name},`
  return str
}

async function findSymbols (markets : Market[],assets : Asset[]) :  Promise<Symbol[]> {
  try {
    let url = `${COINAPI}/v1/symbols`
    let [strMarkets, strAssets] = await Promise.all([
      strMarketsNames(markets),
      strAssetsNames(assets)
    ])
    let {data : symbols } : { data : resp_symbols[] } =  await axios.get(url, {params : {
        filter_exchange_id : strMarkets,
        filter_asset_id : strAssets
      }})
    const side : Symbol['buy' | 'sell'] = {
      frequence : 0,
      prixMoyen_for1kusd_quote : null,
      prixMoyen_for15kusd_quote : null,
      prixMoyen_for30kusd_quote : null
    }
    symbols = symbols.filter(symbol=> symbol.volume_1day_usd >= 200000 && symbol.symbol_type === 'SPOT')
    return <Symbol[]>(
     symbols.filter(symbol=> (
       symbols.some(symb => symb.exchange_id !== symbol.exchange_id && symbol.asset_id_quote === symb.asset_id_quote && symbol.asset_id_base === symb.asset_id_base)
     ))
      .map(symb => ({
        name: symb.exchange_id + '_'+ symb.asset_id_base +'_'+ symb.asset_id_quote,
        market: symb.exchange_id,
        pair : symb.asset_id_base + '_'+ symb.asset_id_quote,
        symbolCoinapi: symb.symbol_id,
        base : symb.asset_id_base,
        quote : symb.asset_id_quote,
        buy : side,
        sell : side,
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
    console.log('Il y a eu une erreur dans la captrue des symboles :  ', err)
  }
}

export default findSymbols
