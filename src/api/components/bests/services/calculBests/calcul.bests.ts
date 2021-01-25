import {Best, BestFor} from "../../../../models/interphace/best";
import {Price} from "../../../../models/interphace/price";

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
    price_quote : topPrice[side][forusd]
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

  const calculSpread =  (itemBuy : BestFor['buy'],itemSell : BestFor['sell']) => {
    if(itemBuy.price_quote && itemSell.price_quote && (itemSell.volume_base || itemBuy.volume_base))
      return (itemSell.price_quote - itemBuy.price_quote) * (itemSell.volume_base || itemBuy.volume_base)
    else
      return  null
  }

  const [bestBuy,bestSell] = await Promise.all([
    makeOneSide('buy'),
    makeOneSide('sell')
  ])

  if(prices[0].infos.pair === "BTC_USD"){
  }
  return [
    {
      buy : bestBuy.for1k,
      sell : bestSell.for1k,
      spread_quote : calculSpread(bestBuy.for1k,bestSell.for1k),
      spread_usd : calculSpread(bestBuy.for1k,bestSell.for1k) * prices[0].infos.quote_usd || null
    },
    {
      buy : bestBuy.for15k,
      sell : bestSell.for15k,
      spread_quote : calculSpread(bestBuy.for15k,bestSell.for15k),
      spread_usd : calculSpread(bestBuy.for15k,bestSell.for15k) * prices[0].infos.quote_usd || null
    },
    {
      buy : bestBuy.for30k,
      sell : bestSell.for30k,
      spread_quote : calculSpread(bestBuy.for30k,bestSell.for30k),
      spread_usd : calculSpread(bestBuy.for30k,bestSell.for30k) * prices[0].infos.quote_usd || null
    },
  ]
}

async function makeBest(prices : Price[],groupId : string, infos : Price['infos']) : Promise<Best> {
  const bestFor : [BestFor,BestFor,BestFor] = await makeBestFor(prices)
  return {
    name : `${infos.pair}_${groupId}`,
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
  sortedPrices.forEach(tab => {
    if (tab.length > 1)
      tabPromises.push(makeBest(tab,id,tab[0].infos))
    else
      console.log(`----Erreur : La pair ${tab[0].infos.pair} n'est comparée que sur 1 market (${tab[0].infos.market})----`)
  } )
  return await Promise.all(tabPromises)
}

export default calculBests
