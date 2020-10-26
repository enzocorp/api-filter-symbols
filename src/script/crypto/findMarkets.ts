import axios from 'axios'
import {Market} from "../../models/interphace/market";
import {COINAPI} from "../../app";


interface resp_exchanges {
  data_symbols_count: number,
  exchange_id: string,
  name: string,
  volume_1day_usd: number,
  website: string
}

async function findMarkets () :  Promise<Market[]> {
  try {
    let url = `${COINAPI}/v1/exchanges`
    let {data : exchanges} : { data : resp_exchanges[] } =  await axios.get(url)
    return <Market[]>(
      exchanges.filter(exchange=> exchange.volume_1day_usd >= 1000000 && exchange.data_symbols_count >= 3)
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
              }
        }))
    )
  }
  catch (err){
    console.log('Il y a eu une erreur dans la capture des nouveaux exchanges :  ', err)
  }
}

export default findMarkets
