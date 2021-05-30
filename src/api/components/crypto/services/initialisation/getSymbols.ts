import axios from 'axios'
import {Market} from "../../../../models/interphace/market";
import {Symbol, SymbolFor} from "../../../../models/interphace/symbol";

import {Asset} from "../../../../models/interphace/asset";
import {COINAPI_URL} from "../../../../../config/globals";
import {symbol_type, symbol_volume_usd1day} from "../../config_init";
import {END_GRAPH, PAS_GRAPH, START_GRAPH} from "../../../bests/config_bests";


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
  for (let asset of assets) {
    str += `${asset.name},`
  }
  return str
}

/*To fixed
market 125 = 1000
asset 1515 = 7320
total = 8300
ERROR
----------------
markets 125 = 1000
asset 1300 = 6200
total = 7200
SUCESS --> Donc Le maximum de caracteres dans l'url doit être de 7200 caracteres
*/



//Recupere les symbols sur coinapi en fonction des markets et des paires demandées
async function getSymbols (markets : Market[], assets : Asset[]) :  Promise<Symbol[]> {
  let url = `${COINAPI_URL}/v1/symbols`
  let [strMarkets, strAssets] = await Promise.all([
    strMarketsNames(markets),
    strAssetsNames(assets)
  ])

  let {data : symbols } : { data : resp_symbols[] } =  await axios.get(url, {params : {
        filter_exchange_id : strMarkets,
        filter_asset_id : strAssets
      }})
  const side : SymbolFor['buy' | 'sell'] = {
    bestMarketFreq : 0,
    okFreq : 0,
    notDataFreq : 0,
    notEnoughVolFreq : 0,
    prixMoyen_quote :null
  }

  let isfor = {}
  for (let i = START_GRAPH; i <= END_GRAPH; i += PAS_GRAPH){
    isfor[i] = {
      buy : side,
      sell : side,
    }
  }

  symbols = symbols.filter(symbol=> symbol.volume_1day_usd >= symbol_volume_usd1day && symbol.symbol_type === symbol_type)
  symbols = symbols.filter(symbol => symbol.symbol_id.split('_').length === 4 ) //Filtre les symboles bizzares qui ne sont pas composés de 4 morceaux
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
      isfor,
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


export default getSymbols
