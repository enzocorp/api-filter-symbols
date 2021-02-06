import {Best, BestFor} from "../../../../models/interphace/best";
import {Price, PriceIsfor} from "../../../../models/interphace/price";
import debuger from "debug";
import {END_GRAPH, PAS_GRAPH, START_GRAPH} from "../../config_bests";

const debug = debuger("api:calcul-bests")
/*
* 1 - Recupérer toutes les valeurs d'achat
* - recuếrer toutes les valeurs de vente
* 2 - récupérer la meilleur de chaque
* 3 - calculer le spread entre les deux valeurs
* */

//Dans 1 side ( achat ou vente ), elle extrait la paire qui possede le meilleur prix pour 1 valeur de "isfor"
async function compareSide(isfor : number,side :"sell" | "buy",prices : Price[]) : Promise<BestFor['buy' | 'sell']>{
  let topPrice : Price = null
  prices.forEach(price => {
    if(topPrice === null)
      topPrice = price
    else if(side === 'buy' && price.isfor[isfor].buy < topPrice.isfor[isfor].buy )
      topPrice = price
    else if(side === 'sell' && price.isfor[isfor].sell > topPrice.isfor[isfor].sell)
      topPrice = price
  })

  const infos = topPrice.infos
  return {
    market : infos.market,
    symbol : infos.symbol,
    website : infos.website,
    price_quote : topPrice.isfor[isfor][side],
    volume_base :topPrice.isfor[isfor].qtyBase
  }
}


//Retourne l'item BEST d'un groupe de paires pour 1 valeur de "isfor"
async function calculFor(isfor : number,prices : Price[]): Promise<{[key:number]:BestFor}> {

  const [bestBuy,bestSell] = await Promise.all([
    compareSide(isfor,'buy',prices),
    compareSide(isfor,'sell',prices)
  ])

  const calculSpread =  (itemBuy : BestFor['buy'],itemSell : BestFor['sell']) => {
    if(itemBuy.price_quote && itemSell.price_quote && (itemSell.volume_base || itemBuy.volume_base))
      return (itemSell.price_quote - itemBuy.price_quote) * (itemSell.volume_base || itemBuy.volume_base)
    else
      return  null
  }

  const bestfor : BestFor= {
    buy : bestBuy,
    sell : bestSell,
    spread_quote : calculSpread(bestBuy,bestSell),
    spread_usd : calculSpread(bestBuy,bestSell) * prices[0].infos.quote_usd || null
  }

  return {[isfor]: bestfor}
}


//Recupere les BESTs d'une pair pour chaque valeur de "isfor"
async function makeBest(prices : Price[],groupId : string, infos : Price['infos']) : Promise<Best> {
  const promises : Promise<{[key : string] : BestFor}>[] = []
  for (let i = START_GRAPH; i < END_GRAPH; i += PAS_GRAPH){
    promises.push(calculFor(i,prices))
  }
  const bestsfor : Array<Record<number, BestFor> > = await Promise.all(promises)
  let isfor : Best["isfor"] = {}
  bestsfor.forEach(bestfor => isfor = {...isfor, ...bestfor } )
  return {
    name : `${infos.pair}_${groupId}`,
    pair : infos.pair,
    quote : infos.quote,
    base :  infos.base,
    createdBy : 'unknow',
    groupId,
    isfor :isfor,
    date : new Date()
  }
}

//Regroupe les prix par groupes de pairs
function makeGroups(prices : Price[]) : Array<Price[]> {
  let categories : Record<string,Price[]> = {}
  prices.forEach(price => {
    if(!categories[price.infos.pair]){
      categories[price.infos.pair] = []
    }
    categories[price.infos.pair].push(price)
  })
  return Object.values(categories)
}

//Effectue le calcule d'arbitrage de chaque pair pour déterminer leurs rentabilitée
async function calculBests (prices : Price[]) : Promise<Best[]>{
  const groupsPrice : Array<Price[]> = makeGroups(prices)
  const tabPromises : Promise<Best>[] = []
  const id = Date.now().toString()
  groupsPrice.forEach(group => {
    if (group.length > 1)
      tabPromises.push(makeBest(group,id,group[0].infos))
    else
      debug(`----Attention : La pair ${group[0].infos.pair} n'est comparée que sur 1 market (${group[0].infos.market})----`)
  } )
  return await Promise.all(tabPromises)
}

export default calculBests
