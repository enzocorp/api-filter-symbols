import axios from 'axios'
import {Market} from "../../models/interphace/market";
import {Pair} from "../../models/interphace/pair";
import {COINAPI} from "../../app";

interface asset {
  data_symbols_count: number,
  asset_id: string,
  name: string,
  volume_1day_usd: number,
}

interface resp_symbols {
  symbol_id: string,
  symbol_type: 'SPOT' | 'FUTURES'
  asset_id_base: string,
  asset_id_quote: string,
  volume_1day_usd: number,
  exchange_id : string
}

async function func_exchanges (exchanges : Market[]) {
  let filteredExchanges : string = ''
  for  (let exchange of exchanges)
    filteredExchanges += `${exchange.id_exchange},`
  return filteredExchanges
}
async function  func_assets(assets : asset[]) {
  let filteredAssets : string = ''
  for (let asset of assets)
    filteredAssets += `${asset.asset_id},`
  return filteredAssets
}

async function makeInitPairs (exchanges : Market[], assets : asset[]) :Promise< Pair[]> {

  try {
    let url = `${COINAPI}/v1/symbols`
    let [filteredExchanges, filteredAssets] = await Promise.all([
      func_exchanges(exchanges),func_assets(assets)
    ])
    let {data} : { data : resp_symbols[] } =  await axios.get(url, {params : {
        filter_exchange_id : filteredExchanges,
        filter_asset_id : filteredAssets
      }})

    let pairs : Pair[] = []
    data.forEach(symbol => {
      if( symbol.volume_1day_usd >= 200000 && symbol.symbol_type === 'SPOT') {
        let name = symbol.asset_id_base + '_' + symbol.asset_id_quote
        const search = (pair) => pair.name === name
        let index = pairs.findIndex(pair => search(pair))
        if(index === -1 ){
          pairs.push({
            name,
            base : symbol.asset_id_base,
            quote : symbol.asset_id_quote,
            exchanges: [{id : `${symbol.exchange_id}`, symbol_id : symbol.symbol_id }],
            exclusion :{
              pairIsExclude : false,
              fromMarkets : []
            },
            frequences : {
              positive : 0,
              negative : 0,
              isBest : 0
            },
            ifPositiveSpread : {
              volumeMoyen : -1,
              volumeMoyen_usd : -1,
              spreadMoyen : -1,
              spreadMoyen_1usd : -1,
              spreadMoyen_15kusd : -1,
              profitMaxiMoyen_usd : -1,
              ecartType : -1,
              variance : -1,
              esperance : -1,
              medianne : -1,
              hightestSpread_15kusd : -1
            },
          })
        }else{
          pairs[index].exchanges.push({id : `${symbol.exchange_id}`, symbol_id : symbol.symbol_id })
        }
      }
    })

    return pairs.filter(pair => pair.exchanges.length >= 2)
  }
  catch (err){
    console.log("Il y a eu une erreur dans le script d'initialisation des markets", err)
  }


}

export default makeInitPairs
