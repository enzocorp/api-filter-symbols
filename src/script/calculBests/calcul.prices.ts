import {Asset} from "../../models/interphace/asset";
import {Price} from "../../models/interphace/price";
import {Market} from "../../models/interphace/market";


interface orderbook {
  symbol_id: string
  asks: Array<{
    price: number
    size: number
  }>
  bids: Array<{
    price: number
    size: number
  }>
}

function makeInfos (book: orderbook, assets : Asset[],markets : Market[]):Price['infos'] {
  const tab = book.symbol_id.split("_")
  const obj : Price['infos'] = {
    market : tab[0],
    website : markets.find(market => market.name === tab[0])?.website,
    quote_usd : assets.find(asset => asset.name === tab[0])?.price_usd,
    base : tab[2],
    quote : tab[3],
    pair : `${tab[2]}_${tab[3]}`,
    symbolCoinapi : book.symbol_id,
    symbol : `${tab[0]}_${tab[2]}_${tab[3]}`  }
  return {...obj, }
}

function makeQties (infos : Price['infos'], assets : Asset[]) : Price['qty'] {
  try{
    let asset = assets.find(asset => asset.name === infos.base)
    if(asset === undefined){
      console.log(`---- Prolbeme ! ${infos.base} n'était pas dans la base de donnée !--- `)
      throw `---- Prolbeme ! ${infos.base} n'était pas dans la base de donnée !--- `
    }
    const price_usd = asset.price_usd
    return {
      qtyBase_with1kusd : 1000/ price_usd,
      qtyBase_with15kusd : 15000/ price_usd,
      qtyBase_with30kusd : 30000/ price_usd,
    }
  }catch (err){
    return {
      qtyBase_with1kusd : 10,
      qtyBase_with15kusd : 150,
      qtyBase_with30kusd : 300
    }
  }
}

async function makePrice(quantity : number, side : orderbook['bids' | 'asks']) : Promise<number>{
  const prices = []
  let qty = quantity
  for(let item of side) {
    if (item.size === 0) //Volume inconnu
      continue

    if(qty - item.size > 0) {
      prices.push(item.size * item.price)
      qty -= item.size
    }
    else{
      prices.push(qty * item.price)
      qty = 0
      break ;
    }
  }
  if(qty === 0)
    return prices.reduce((acc,val)=> acc + val) / quantity
  else if (qty === quantity) //Volume inconnu
    return undefined
  else //Pas assez de volume
    return null
}

async function makeSide (side : 'asks' | 'bids', qties : Price['qty'],book : orderbook) : Promise<Price['buy'|'sell']> {
    const [price1k,price15k,price30k] = await Promise.all([
      makePrice(qties.qtyBase_with1kusd,book[side]),
      makePrice(qties.qtyBase_with15kusd,book[side]),
      makePrice(qties.qtyBase_with30kusd,book[side])
    ])
    return {
      price_for1kusd_quote : price1k,
      price_for15kusd_quote : price15k,
      price_for30kusd_quote : price30k
    }
}

async function getSides(qties : Price['qty'],book : orderbook) : Promise<{buy :Price['buy'],sell: Price['sell']}>{
  const [asks,bids] = await Promise.all([
    makeSide('asks',qties, book),
    makeSide('bids',qties, book)
  ])
  return {buy : asks, sell : bids}
}

async function makeObject (book : orderbook, assets : Asset[],markets : Market[]) : Promise<Price>{
  const infos : Price['infos'] = makeInfos(book, assets, markets)
  const qties : Price['qty'] = makeQties(infos,assets)
  const {buy, sell} = await  getSides(qties,book)
  return {infos, qty : qties, buy, sell}
}

async function calculPrices (ordersbooks : orderbook[], assets : Asset[], markets : Market[]) : Promise<Price[]>{
  const promises : Promise<Price>[] = ordersbooks.map(book => makeObject(book,assets, markets))
  const [...prices] : Price[] = await Promise.all(promises)
  return prices
}

export default calculPrices

/*
const orderTest  : orderbook[] = [
  {
    "symbol_id": "BINANCE_SPOT_BTC_USDT",
    "asks": [
      {
        "price": 13126,
        "size": 1
      },
      {
        "price": 13156.36,
        "size": 0
      },
      {
        "price": 13184.36,
        "size": 2
      },
    ],
    "bids": [
      {
        "price": 13101,
        "size": 42
      },
      {
        "price": 13050,
        "size": 5
      },
    ]
  }
]

const assets : any = [
  {name : 'BTC', price_usd: 13126},
  {name : 'USDT', price_usd: 1},
]

programmeBests(orderTest, assets).then(resp=>{
  console.log('------ il y a eu une resp ------------')
  console.log(resp)
})
*/
