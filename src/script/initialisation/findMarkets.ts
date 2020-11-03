import axios from 'axios'
import {Market} from "../../models/interphace/market";
import {COINAPI} from "../../app";
import {market_symbolsCount, market_volume_usd1day} from "./initialisationFilters";


interface resp_exchanges {
  data_symbols_count: number,
  exchange_id: string,
  name: string,
  volume_1day_usd: number,
  website: string
}

async function findMarkets (params = {}) :  Promise<Market[]> {
  try {
    let url = `${COINAPI}/v1/exchanges`
    let {data : exchanges} : { data : resp_exchanges[] } =  await axios.get(url,{params : params})
    return <Market[]>(
      exchanges.filter(exchange=> exchange.volume_1day_usd >= market_volume_usd1day && exchange.data_symbols_count >= market_symbolsCount)
        .map(exchange => ({
              name: exchange.exchange_id,
              longName: exchange.name,
              website: exchange.website,
              pairsCount: exchange.data_symbols_count,
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
  catch (err){
    console.log('Il y a eu une erreur dans la capture des nouveaux exchanges :  ', err)
  }
}

export default findMarkets
