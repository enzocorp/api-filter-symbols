import {Asset} from "../../../../models/interphace/asset";
import {Price} from "../../../../models/interphace/price";
import {Market} from "../../../../models/interphace/market";


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

function makeInfos (orderbook: orderbook, assets : Asset[],markets : Market[]):Price['infos'] {
  const tab = orderbook.symbol_id.split("_")
  const obj : Price['infos'] = {
    market : tab[0],
    website : markets.find(market => market.name === tab[0])?.website,
    quote_usd : assets.find(asset => asset.name === tab[3])?.price_usd,
    base : tab[2],
    quote : tab[3],
    pair : `${tab[2]}_${tab[3]}`,
    symbolCoinapi : orderbook.symbol_id,
    symbol : `${tab[0]}_${tab[2]}_${tab[3]}`  }
  return {...obj, }
}

function makeQties (infos : Price['infos'], assets : Asset[]) : Price['qty'] {
    try{
      let asset = assets.find(asset => asset.name === infos.base)
      if(asset === undefined){
        throw `L'asset ${infos.base} n'est pas dans la base de donnée !--- `
      }
      const price_usd = asset.price_usd
      return {
        qtyBase_with1kusd : 1000/ price_usd,
        qtyBase_with15kusd : 15000/ price_usd,
        qtyBase_with30kusd : 30000/ price_usd,
      }
    }
    catch (err){
      return {
        qtyBase_with1kusd : undefined,
        qtyBase_with15kusd : undefined,
        qtyBase_with30kusd : undefined,
      }
    }
}

async function makePrice(wantedQty : number, sideOrderbook : orderbook['bids' | 'asks']) : Promise<number>{
  const prices = []
  let qty = wantedQty
  for(let order of sideOrderbook) {
    if (order.size === 0) //Volume inconnu
      continue

    if(qty - order.size > 0) {
      prices.push(order.size * order.price)
      qty -= order.size
    }
    else{
      prices.push(qty * order.price)
      qty = 0
      break ;
    }
  }
  if(wantedQty === undefined) //Si la quantitée souhaitée n'est pas définie (= On jète : c'est une pair parasite non présente en BDD qui n'as pas été filtrée par coinapi)
    return undefined
  else if (qty === wantedQty) //Si le volume de chaque ordre est indéfini dans l'orderbook (= On garde : c'est coinapi n'as pas fourni les volumes de l'orderbook)
    return undefined
  else if(qty === 0) //Si tout va bien
    return prices.reduce((acc,val)=> acc + val) / wantedQty
  else //Si il n'y avais pas assez de volume pour acheter jusqu'au wantedVolume
    return null
}

async function makeSide (side : 'asks' | 'bids', qties : Price['qty'],orderbook : orderbook) : Promise<Price['buy'|'sell']> {
    const [price1k,price15k,price30k] = await Promise.all([
      makePrice(qties.qtyBase_with1kusd,orderbook[side]),
      makePrice(qties.qtyBase_with15kusd,orderbook[side]),
      makePrice(qties.qtyBase_with30kusd,orderbook[side])
    ])
    return {
      price_for1kusd_quote : price1k,
      price_for15kusd_quote : price15k,
      price_for30kusd_quote : price30k
    }
}

async function getSides(qties : Price['qty'],orderbook : orderbook) : Promise<{buy :Price['buy'],sell: Price['sell']}>{
  const [asks,bids] = await Promise.all([
    makeSide('asks',qties, orderbook),
    makeSide('bids',qties, orderbook)
  ])

  return {buy : asks, sell : bids}
}

async function makeObject (orderbook : orderbook, assets : Asset[],markets : Market[]) : Promise<Price>{
  const infos : Price['infos'] = makeInfos(orderbook, assets, markets)
  const qties : Price['qty'] = makeQties(infos,assets)
  const {buy, sell} = await  getSides(qties,orderbook)
  return {infos, qty : qties, buy, sell}
}

async function calculPrices (ordersbooks : orderbook[], assets : Asset[], markets : Market[]) : Promise<Price[]>{
  const promises : Promise<Price>[] = ordersbooks.map(book => makeObject(book,assets, markets))
  const prices : Price[] = await Promise.all(promises)

  return prices.filter(price => {       //Filtres les prix "parasites" n'ayant pas leur "market" ou leur "assets" en BDD pour eviter tout problemes...
    return assets.some(asset => asset.name === price.infos.quote || asset.name === price.infos.base)
      && markets.some(market => price.infos.market === market.name)
      && price.qty.qtyBase_with1kusd !== undefined && price.qty.qtyBase_with15kusd !== undefined && price.qty.qtyBase_with30kusd !== undefined
  })
}

export default calculPrices
