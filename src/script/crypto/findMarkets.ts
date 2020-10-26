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
  let url = `${COINAPI}/v1/exchanges`
  let tabData = []
  try {
    let {data} : { data : resp_exchanges[] } =  await axios.get(url)
    let filteredData : resp_exchanges[] = data.filter(item=>{
      return  item.volume_1day_usd >= 1000000 && item.data_symbols_count >= 3
    })
    filteredData.forEach(item => {
      let exchange : Market = {
        name : item.name,
        website : item.website,
        symbolsCount : item.data_symbols_count,
        id_exchange : item.exchange_id,
        exclusion: {
          exchangeIsExclude : false,
          reasons : [],
          severity : null,
          excludeBy : null,
          note : null
        },
      }
      tabData.push(exchange)
    })
  }
  catch (err){
    console.log('Il y a eu une erreur dans exchanges ', err)
  }

  return <Market[]>tabData
}

export default findMarkets
