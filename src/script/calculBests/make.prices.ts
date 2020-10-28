import {Symbol} from "../../models/interphace/symbol";
import {Best} from "../../models/interphace/best";
import {Asset} from "../../models/interphace/asset";
import modelAsset from "../../models/mongoose/model.asset";

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
interface price {
  infos : {
    market : string
    website: string
    symbol : string
    base : string
    quote : string
    pair : string
  }
  qty : {
    qtyBase_with1kusd : number
    qtyBase_with15kusd : number
    qtyBase_with30kusd : number
  }
  buy : {
    price_for1kusd_quote : number
    price_for15kusd_quote : number
    price_for30kusd_quote : number
  }
  sell : {
    price_for1kusd_quote : number
    price_for15kusd_quote : number
    price_for30kusd_quote : number
  }
}

function makeInfos (book: orderbook):price['infos'] {
  const tab = book.symbol_id.split("_")
  const obj = {market : tab[0],base : tab[2], quote : tab[3] }
  return <price['infos']>{...obj, pair : `${obj.base}_${obj.quote}`}
}

function makeQties (infos : price['infos'], assets : Asset[]) : price['qty'] {
  const price_usd = assets.find(asset => asset.name === infos.base).price_usd
  return {
    qtyBase_with1kusd : 1000/ price_usd,
    qtyBase_with15kusd : 15000/ price_usd,
    qtyBase_with30kusd : 30000/ price_usd,
  }
}

async function makePrice(quantity : number, side : orderbook['bids' | 'asks']) : Promise<number>{
  const prices = []
  let qty = quantity
  for(let item of side) {
    if (qty - item.size > 0) {
      prices.push(item.size * item.price)
      qty -= item.size
    }else{
      prices.push(qty * item.price)
      break ;
    }
  }
  // console.log(prices)
  return prices.reduce((acc,val)=> acc + val) / quantity
}

async function makeSide (side : 'asks' | 'bids', qties : price['qty'],book : orderbook) : Promise<price['buy'|'sell']> {
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

async function getSides(qties : price['qty'],book : orderbook) : Promise<{buy :price['buy'],sell: price['sell']}>{
  const [asks,bids] = await Promise.all([
    makeSide('asks',qties, book),
    makeSide('bids',qties, book)
  ])
  return {buy : asks, sell : bids}
}

async function makeObject (book : orderbook, assets : Asset[]) : Promise<price>{
  const infos : price['infos'] = makeInfos(book)
  const qties : price['qty'] = makeQties(infos,assets)
  const {buy, sell} = await  getSides(qties,book)
  return {infos, qty : qties, buy, sell}
}

async function programme (ordersbooks : orderbook[], assets : Asset[]) : Promise<any>{
  const promises : Array<Promise<price>> = ordersbooks.map(book => makeObject(book,assets))
  const [...prices] = await Promise.all(promises)
  return prices
}

const orderTest  : orderbook[] = [
  {
    "symbol_id": "BINANCE_SPOT_BTC_USDT",
    "asks": [
      {
        "price": 13126,
        "size": 2
      },
      {
        "price": 13156.36,
        "size": 23
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

programme(orderTest, assets).then(resp=>{
  console.log('------ il y a eu une resp ------------')
  console.log(resp)
})
