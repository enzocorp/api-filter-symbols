import {Best, BestFor} from "../../models/interphace/best";
import {Price} from "../../models/interphace/price";

function sortPrices(prices : Price[]) : Array<Price[]> {
  let categories : Record<string,Price[]> = {}
  prices.forEach(price => {
    if(!categories[price.infos.pair]){
      categories[price.infos.pair] = []
    }
    categories[price.infos.pair].push(price)
  })
  return Object.values(categories)
}

async function calculSortAndFormat(prices : Price[],side : 'buy' | 'sell',forusd : string) : Promise<BestFor['buy' | 'sell']> {
  let topPrice : Price = null
  prices.forEach(price => {
      if(topPrice === null)
        topPrice = price
      else if(side === 'buy' && price[side][forusd] < topPrice[side][forusd])
        topPrice = price
      else if(side === 'sell' && price[side][forusd] > topPrice[side][forusd])
        topPrice = price
  })

  let qty = undefined
  switch (forusd){
    case 'price_for1kusd_quote' :
      qty = topPrice.qty.qtyBase_with1kusd
      break
    case 'price_for15kusd_quote' :
      qty = topPrice.qty.qtyBase_with15kusd
      break
    case 'price_for30kusd_quote' :
      qty = topPrice.qty.qtyBase_with30kusd
      break
  }

  return {
    market : topPrice.infos.market,
    symbol : topPrice.infos.symbol,
    website : topPrice.infos.website,
    volume_base : qty,
    price : topPrice[side][forusd]
  }
}

async function makeBestFor(prices : Price[]): Promise<[BestFor,BestFor,BestFor]> {

  const makeOneSide = async (side : 'buy' | 'sell') => {
    let [for1k,for15k,for30k] : Array<BestFor['buy' | 'sell']> = await Promise.all([
      calculSortAndFormat(prices,side,'price_for1kusd_quote'),
      calculSortAndFormat(prices,side,'price_for15kusd_quote'),
      calculSortAndFormat(prices,side,'price_for30kusd_quote')
    ])
    return {for1k,for15k,for30k}
  }
  const [bestsBuy,bestsSell] = await Promise.all([
    makeOneSide('buy'),
    makeOneSide('sell')
  ])
  return [
    {
      buy : bestsBuy.for1k,
      sell : bestsSell.for1k,
      spread_quote : bestsSell.for1k.price - bestsBuy.for1k.price,
      spread_usd : (bestsSell.for1k.price - bestsBuy.for1k.price) * prices[0].infos.quote_usd
    },
    {
      buy : bestsBuy.for15k,
      sell : bestsSell.for15k,
      spread_quote : bestsSell.for15k.price - bestsBuy.for15k.price,
      spread_usd : (bestsSell.for15k.price - bestsBuy.for15k.price) * prices[0].infos.quote_usd
    },
    {
      buy : bestsBuy.for30k,
      sell : bestsSell.for30k,
      spread_quote : bestsSell.for30k.price - bestsBuy.for30k.price,
      spread_usd : (bestsSell.for30k.price - bestsBuy.for30k.price) * prices[0].infos.quote_usd
    },
  ]
}

async function makeBest(prices : Price[],groupId : string, infos : Price['infos']) : Promise<Best> {
  const bestFor : [BestFor,BestFor,BestFor] = await makeBestFor(prices)
  return {
    pair : infos.pair,
    quote : infos.quote,
    base :  infos.base,
    createdBy : 'unknow',
    groupId,
    for1k : bestFor[0] ,
    for15k :  bestFor[1],
    for30k :  bestFor[2],
    date : new Date()
  }
}

async function calculBests (prices : Price[]) : Promise<Best[]>{
  const sortedPrices : Array<Price[]> = sortPrices(prices)
  const tabPromises : Promise<Best>[] = []
  const id = Date.now().toString()
  sortedPrices.forEach(tab => tabPromises.push(makeBest(tab,id,tab[0].infos))
  )
  return await Promise.all(tabPromises)
}

export default calculBests
