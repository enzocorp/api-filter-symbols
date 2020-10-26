import axios from 'axios'
import {Best} from "../../models/interphace/best";
import {Pair} from "../../models/interphace/pair";
import {Market} from "../../models/interphace/market";
import modelPair from "../../models/mongoose/model.pair";
import modelMarket from "../../models/mongoose/model.market";
import {COINAPI} from "../../app";
import modelSymbol from "../../models/mongoose/model.symbol";
import {Symbol} from "../../models/interphace/symbol";

//LES INTERPHACES

interface resp_symbole {
  "symbol_id": string,
  "ask_price": number,
  "ask_size": number,
  "bid_price": number,
  "bid_size": number,
}

interface resp_asset {
  asset_id?: string
  price_usd: number
}

//1 Recuperation des assets pour avoir leurs valeurs
async function getAssets (pairs : Pair[]) : Promise<resp_asset[]>{
  let urlAssets = `${COINAPI}/v1/assets`
  let filter_assets = ''
  pairs.forEach(pair => {
    filter_assets += pair.quote
    filter_assets += pair.base
  })
  let {data} : {data : resp_asset[]} = await axios.get(urlAssets, {params : filter_assets })

  return <resp_asset[]>data
}

//2 Pour chaque symbol calcul le "best buy market" et le "best sell market"
function calculBest(allData : resp_symbole[], pair : Pair, assets : resp_asset[], exchanges : Market[], groupId : string) : Best{

  let asset : {quote_usd, base_usd} = {quote_usd : undefined, base_usd : undefined}

  if(pair.base !== 'USD')
    asset.base_usd = assets.find(asset => asset.asset_id === pair.base).price_usd
  else asset.base_usd
  if(pair.quote !== 'USD')
    asset.quote_usd = assets.find(asset => asset.asset_id === pair.quote).price_usd
  else asset.quote_usd = 1

  let best : Best = {
    pair : pair.name,
    quote : pair.quote,
    base : pair.base,
    buy : {
      exchange : undefined,
      symbol_id : undefined,
      website : undefined,
      price : undefined,
      price_for1kusd_quote : undefined,
      price_for15kusd_quote : undefined,
      price_for30kusd_quote : undefined,
      volume : undefined,
      volume_usd : undefined,
      volume_for1kusd : undefined,
      volume_for15kusd : undefined,
      volume_for30kusd : undefined,
    },
    sell : {
      exchange : undefined,
      symbol_id : undefined,
      website : undefined,
      price : undefined,
      price_for1kusd_quote : undefined,
      price_for15kusd_quote : undefined,
      price_for30kusd_quote : undefined,
      volume : undefined,
      volume_usd : undefined,
      volume_for1kusd : undefined,
      volume_for15kusd : undefined,
      volume_for30kusd : undefined,
    },
    spread : undefined,
    spread_1usd : undefined,
    spread_15kusd : undefined,
    volume : undefined,
    volume_usd : undefined,
    volumeLimiteur : undefined,
    profitMaxi_usd : undefined,
    _createdBy : 'unknow',
    groupId : groupId
  }

  let ex : Array<string> = pair.exchanges.map(exchanges => exchanges.symbol_id)
  let data : resp_symbole[] = allData.filter(item => ex.includes(item.symbol_id)  )

  data.forEach(symb => {

  //Calcul si le symbole est mieux en achat ou en vente ou en rien
    if(!best.buy.price || symb.ask_price < best.buy.price ){
      best.buy.price = symb.ask_price
      const price_usd =  best.buy.price * asset.quote_usd
      best.buy.price_for1kusd_quote = (1 / asset.base_usd) * price_usd
      best.buy.price_for15kusd_quote = (15000 / asset.base_usd) * price_usd
      best.buy.price_for30kusd_quote = 99999 / asset.base_usd * 2

      best.buy.volume = symb.ask_size
      best.buy.volume_usd = best.buy.volume * asset.quote_usd

      best.buy.volume_for1kusd = best.buy.volume * asset.quote_usd * 1.1
      best.buy.volume_for15kusd = best.buy.volume * asset.quote_usd * 15
      best.buy.volume_for30kusd = best.buy.volume * asset.quote_usd * 99

      let str = symb.symbol_id
      best.buy.symbol_id = str
      best.buy.exchange = str.substr(0, str.indexOf('_'));
      best.buy.website = exchanges.find(exchange=> best.buy.exchange === exchange.id_exchange)?.website
    }

    if(!best.sell.price || (symb.bid_price > best.sell.price) ){
      best.sell.price = symb.bid_price
      const price_usd =  best.sell.price * asset.quote_usd
      best.sell.price_for1kusd_quote = (1 / asset.base_usd) * price_usd
      best.sell.price_for15kusd_quote = (15000 / asset.base_usd) * price_usd
      best.sell.price_for30kusd_quote = 99999 / asset.base_usd * 2

      best.sell.volume = symb.bid_size
      best.sell.volume_usd = best.sell.volume * asset.quote_usd

      best.sell.volume_for1kusd = best.sell.volume * asset.quote_usd * 1.1
      best.sell.volume_for15kusd = best.sell.volume * asset.quote_usd * 15
      best.sell.volume_for30kusd = best.sell.volume * asset.quote_usd * 99


      let str = symb.symbol_id
      best.sell.symbol_id = str
      best.sell.exchange = str.substr(0, str.indexOf('_'));
      best.sell.website = exchanges.find(exchange=> best.sell.exchange === exchange.id_exchange)?.website
    }

  //Calcul du spread entre l'achat et la vente :
    best.spread = best.sell.price - best.buy.price //1 base token give this spread on quote token
    const spread_usd = best.spread * asset.quote_usd //1 base token give this spread on usd
    best.spread_1usd = (1 / asset.base_usd) * spread_usd
    best.spread_15kusd = (15000 / asset.base_usd) * spread_usd
    best.volume_usd = best.volume * asset.base_usd
    best.profitMaxi_usd = best.volume * spread_usd

    if(best.sell.volume > best.buy.volume){
      best.volume = best.buy.volume
      best.volumeLimiteur = 'buy'
    }
    else{
      best.volume = best.sell.volume
      best.volumeLimiteur = 'sell'
    }
  })


  return <Best>best
}

//3 Mettre a jour les données des pair en fonction de chaque "BEST"
function updatePair (best : Best,pair : Pair) : Pair {

  let {frequences, ifPositiveSpread} = pair
  if(best.spread > 0 ){
    frequences.positive++
    if(ifPositiveSpread.hightestSpread_15kusd === -1){
      ifPositiveSpread.spreadMoyen = best.spread
      ifPositiveSpread.spreadMoyen_1usd = best.spread_1usd
      ifPositiveSpread.spreadMoyen_15kusd = best.spread_15kusd

      ifPositiveSpread.volumeMoyen = best.volume
      ifPositiveSpread.volumeMoyen_usd = best.volume_usd

      ifPositiveSpread.hightestSpread_15kusd = best.spread_15kusd
      ifPositiveSpread.profitMaxiMoyen_usd = best.profitMaxi_usd
    }else{
      const { positive : freq} = frequences

      ifPositiveSpread.spreadMoyen = (ifPositiveSpread.spreadMoyen * (freq - 1) + best.spread) / freq
      ifPositiveSpread.spreadMoyen_1usd = (ifPositiveSpread.spreadMoyen_1usd * (freq - 1) + best.spread_1usd) / freq
      ifPositiveSpread.spreadMoyen_15kusd = (ifPositiveSpread.spreadMoyen_15kusd * (freq - 1) + best.spread_15kusd) / freq

      ifPositiveSpread.volumeMoyen = (ifPositiveSpread.volumeMoyen * (freq - 1) + best.volume) / freq
      ifPositiveSpread.volumeMoyen_usd = (ifPositiveSpread.volumeMoyen_usd * (freq - 1) + best.volume_usd) / freq
      ifPositiveSpread.profitMaxiMoyen_usd = (ifPositiveSpread.profitMaxiMoyen_usd * (freq - 1) + best.profitMaxi_usd) / freq

      if(ifPositiveSpread.hightestSpread_15kusd < best.spread_15kusd)
        ifPositiveSpread.hightestSpread_15kusd = best.spread_15kusd
    }
  }
  else {
    frequences.negative++
  }
  return <Pair>{
    ...pair,
    frequences,
    ifPositiveSpread
  }

}

//4 Mettre a jour les average pour chaques best positif
async function  updateAverage(bests : Best[]) : Promise<Symbol[]> {
  const averages : Symbol[] = await modelSymbol.find({}).lean()
  const updtAv : Symbol[] = []
  bests.forEach((best : Best) => {
    [best.buy,best.sell].forEach((side ,i)=>{
      const index = averages.findIndex(av => av.symbole_id === side.symbol_id)
      if (index === -1){
        updtAv.push({
          symbole_id : side.symbol_id,
          pair : best.pair,
          exchange : side.exchange,
          best : {
            buy1k : 0,
            buy15k : 0,
            buy30k : 0,
            sell1k : 0,
            sell15k : 0,
            sell30k : 0
          },
          buy : {
            frequence : i === 0 ?  1 : 0,
            prixMoyen_for1kusd_quote : i === 0 ? side.price_for1kusd_quote : 0,
            prixMoyen_for15kusd_quote : i === 0 ?  side.price_for15kusd_quote : 0,
            prixMoyen_for30kusd_quote : i === 0 ?  side.price_for30kusd_quote : 0,
            volumeMoyen_for1kusd :  i === 0 ?  side.volume_for1kusd : 0,
            volumeMoyen_for15kusd :  i === 0 ?  side.volume_for15kusd : 0,
            volumeMoyen_for30kusd :  i === 0 ?  side.volume_for30kusd : 0,
          },
          sell : {
            frequence : i === 1 ?  1 : 0,
            prixMoyen_for1kusd_quote : i === 1 ? side.price_for1kusd_quote : 0,
            prixMoyen_for15kusd_quote : i === 1 ?  side.price_for15kusd_quote : 0,
            prixMoyen_for30kusd_quote : i === 1 ?  side.price_for30kusd_quote : 0,
            volumeMoyen_for1kusd :  i === 1 ?  side.volume_for1kusd : 0,
            volumeMoyen_for15kusd :  i === 1 ?  side.volume_for15kusd : 0,
            volumeMoyen_for30kusd :  i === 1 ?  side.volume_for30kusd : 0,
          },

        })
      }else{
        const obj : Symbol['sell'] | Symbol['buy'] = averages[index][i ? 'sell' : 'buy']
        const { frequence : freq} = obj
        obj.volumeMoyen_for1kusd = (obj.volumeMoyen_for1kusd * freq + side.volume_for1kusd) / freq
        obj.volumeMoyen_for15kusd = (obj.volumeMoyen_for15kusd * freq + side.volume_for15kusd) / freq
        obj.volumeMoyen_for30kusd = (obj.volumeMoyen_for30kusd * freq + side.volume_for30kusd) / freq
        obj.prixMoyen_for1kusd_quote = (obj.prixMoyen_for1kusd_quote * freq + side.price_for1kusd_quote) / freq
        obj.prixMoyen_for15kusd_quote = (obj.prixMoyen_for15kusd_quote * freq + side.price_for15kusd_quote) / freq
        obj.prixMoyen_for30kusd_quote = (obj.prixMoyen_for30kusd_quote * freq + side.price_for30kusd_quote) / freq
        obj.frequence = freq + 1
        averages[index][i ? 'sell' : 'buy'] = obj
        updtAv.push(averages[index])
      }

    })
  })
  return updtAv
}


/*------------------------ LE PROGRAMME  ---------------------------------*/

async function makeBests () : Promise<{ bests : Best[], updatedPairs : Pair[], updatedAverages : Symbol[] }>{

  let url = `${COINAPI}/v1/quotes/current`
  let filter_symbol_id = []
  let pairs : Pair[] = await modelPair.find({}).lean()
  pairs.forEach(pair => pair.exchanges.forEach(
    exchange => filter_symbol_id.push(exchange.symbol_id)
  ))
  let [dataAxios,assets,exchanges] = await Promise.all<any, resp_asset[],Market[]>([
    axios.get(url),
    getAssets(pairs),
    modelMarket.find()
  ])

  let {data : bigData} : {data : resp_symbole[]} = dataAxios
  let data = bigData.filter(item => filter_symbol_id.includes(item.symbol_id) )
  let bests : Best[] = []
  let updatedPairs : Pair[] = []
  const groupId = `${Date.now()}`
  pairs.forEach(pair => {
    let best = calculBest(data, pair,assets,exchanges, groupId)
    bests.push(best)
    let updatedPair = updatePair(best,pair)
    updatedPairs.push(updatedPair)
  })
  bests = bests.filter(best => best.spread_15kusd > 20) // Seulement quand le spread15$ est > 15$
  // let updatedExchanges: Exchange[] = await updateExchanges(bests)
  let updatedAverages: Symbol[] = await updateAverage(bests)


  let best : Best = undefined
  bests.forEach(item => {
    if(!best || item.spread_15kusd > best.spread_15kusd ){
      best = item
    }
  })
  updatedPairs.forEach(pair => {
    if(pair.name === best.pair){
      pair.frequences.isBest++
    }
  })
  return {bests,updatedPairs,updatedAverages}
}

export default makeBests
