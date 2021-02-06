import {Asset} from "../../../../models/interphace/asset";
import {Price} from "../../../../models/interphace/price";
import {Market} from "../../../../models/interphace/market";
import debuger from "debug";
import {END_GRAPH, PAS_GRAPH, START_GRAPH} from "../../config_bests";


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

const debug = debuger("api:makePrices")

//Calcul le prix moyen(en QUOTE) qu'on dépense pour échanger la qté de BASE souhaitée.
function makePrice(wantedQty : number, bookSide : orderbook['bids' | 'asks']) : number {
  if(wantedQty === undefined) //Si la quantitée souhaitée n'est pas définie (= On jète : c'est une pair parasite non présente en BDD qui n'as pas été filtrée par coinapi)
    return undefined

  const prices = [] //Le tableau des prix d'échanges
  let reste = wantedQty //Le reste est le reste de BASE a acheter/Vendre pour atteindre l'objetif

  for(let order of bookSide) {
    if (order.size === 0) //Si le volume de la ligne du book est incunnu alors on passe a la ligne suivante
      continue
    if(reste - order.size > 0) {//Si le reste est > à la ligne du book, alors on échange toute la ligne et on soustrait au RESTE la qte échangée
      prices.push(order.size * order.price)
      reste -= order.size
    }
    else{
      prices.push(reste * order.price)//Si le RESTE est < a la qté dispo, alors on échange sa totalitée a ce prix.
      reste = 0
      break ;
    }
  }

  if (reste === wantedQty) //Si le volume de chaque ordre est indéfini dans l'orderbook (= On garde : c'est coinapi n'as pas fourni les volumes de l'orderbook)
    return undefined
  else if(reste === 0) //Si tout va bien on fait la moyenne en QUOTE du prix d'echange
    return prices.reduce((acc,val)=> acc + val) / wantedQty
  else //Si il n'y avais pas assez de volume pour échanger jusqu'au wantedVolume alors on renvoi null
    return null
}

//Parse les infos de l'orderbook et y ajoute le siteWeb ainsi que la valeur USD des "base" et "quote"
function makeInfos (orderbook: orderbook, assets : Asset[],markets : Market[]):Price['infos'] {
  const part = orderbook.symbol_id.split("_")
  const asset_base  = assets.find(asset => asset.name === part[3])
  const asset_quote = assets.find(asset => asset.name === part[2])
  const market = markets.find(market => market.name === part[0])

  //Filtres les prix "parasites" n'ayant pas leur "market" ou leur "assets" en BDD pour eviter tout problemes...
  if(!asset_base){
    debug ("%s",`Le symbole "${orderbook.symbol_id}" sera ignoré car son ASSET BASE n'est pas présent dans BDD ... !` )
    return undefined //Si l'asset  en base n'existe pas on ignore ce symbole
  }
  else if (!asset_base.price_usd) {
    debug ("%s",`Le symbole "${orderbook.symbol_id}" sera ignoré car son la valeur de son ASSET BASE est indéfinie ... !` )
    return undefined //Si l'asset en base n'as pas de prix usd on ignore ce symbole
  }
  else if(!market) {
    debug ("%s",`Le symbole "${orderbook.symbol_id}" sera ignoré car son market n'est pas présent en base de donnée ... !` )
    return undefined //Si le market n'existe pas en base on ignore ce symbole
  }

  const infos : Price['infos'] = {
    market : part[0],
    website : market.website,
    quote_usd : asset_base.price_usd, //Servira simplement a convertir la valeur du spread en usd
    base_usd : asset_quote.price_usd, //Permettra de calculer la qté de "BASE" qui sera mise en jeux
    base : part[2],
    quote : part[3],
    pair : `${part[2]}_${part[3]}`,
    symbolCoinapi : orderbook.symbol_id,
    symbol : `${part[0]}_${part[2]}_${part[3]}`
  }
  return infos
}

//Fabrique l'objet "Price" de chaque symbole à partir des orderbooks
async function makeObject (orderbook : orderbook, assets : Asset[],markets : Market[]) : Promise<Price>{
  const infos : Price['infos'] = makeInfos(orderbook, assets, markets)
  if(!infos)
    return undefined

  let isfor : Price['isfor']=  {}

  for (let usdQty = START_GRAPH; usdQty < END_GRAPH; usdQty += PAS_GRAPH){
    const qtyBase : number = usdQty / infos.base_usd
    isfor[usdQty] = {
      qtyBase : qtyBase, //Qté de "BASE" acheté&vendu de part et d'autre
      buy : makePrice(qtyBase,orderbook.asks), //Prix d'achat en "QUOTE"
      sell : makePrice(qtyBase,orderbook.bids) //Prix de vente en "QUOTE"
    }
  }

  return {infos, isfor}

}

//Créer l'objet "prices" qui structure l'offre et la demande par tranches de prix.
async function makePrices (orderbooks : orderbook[], assets : Asset[], markets : Market[]) : Promise<Price[]>{
  const promises : Promise<Price>[] = orderbooks.map(book => makeObject(book,assets, markets))
  const prices : Price[] = await Promise.all(promises)

  return prices.filter(price => price !== undefined)
}

export default makePrices
