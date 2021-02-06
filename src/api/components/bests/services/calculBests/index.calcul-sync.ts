import axios from 'axios'
import modelSymbol from "../../../../models/mongoose/model.symbol";
import makePrices from "./makePrices";
import {Asset} from "../../../../models/interphace/asset";
import modelAsset from "../../../../models/mongoose/model.asset";
import updateSymbols from "./updateSymbols";
import {Market} from "../../../../models/interphace/market";
import modelMarket from "../../../../models/mongoose/model.market";
import calculBests from "./calcul.bests";
import {Best} from "../../../../models/interphace/best";
import {Symbol} from "../../../../models/interphace/symbol";
import {Pair} from "../../../../models/interphace/pair";
import updatePairs from "./updatePairs";
import makePodium from "./makePodium";
import debuger from "debug";
import {COINAPI_URL} from "../../../../../config/globals";
import {Price} from "../../../../models/interphace/price";
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


interface axiosResponse {
  data? : orderbook[],
  isAxiosError : boolean,
  response? : {
    status : number,
    statusText : string,
    data : any
  },
}

const aggregateSymbols = [
  {$match: {"exclusion.isExclude" : false}},
  {$lookup: {
      from: "pairs",
      localField: "pair",
      foreignField: "name",
      as: "pair"
    }
  },
  {$lookup: {
      from: "markets",
      localField: "market",
      foreignField: "name",
      as: "market"
    }
  },
  {$unwind: "$pair"},
  {$unwind: "$market"},
  {$match: {"market.exclusion.isExclude" : false, "pair.exclusion.isExclude" : false}},
  {$group : {
      _id : "$pair.name",
      symbs : { $push: "$symbolCoinapi" }
  }},
]

const debug = debuger("api:index-calcul")

//Incrémente de +1 la pté "isBestFreq" sur la meilleur pair de chaque categorie de prix (100, 200, 400 ...)
function awardPairs(pairs: Pair[], podium: Record<number, string>[]) : Pair[] {
  let pairsCopy : Pair[] = [...pairs]
  for (let i = START_GRAPH; i < END_GRAPH; i += PAS_GRAPH){
    if(podium[i]){
      const index : number = pairs.findIndex(pair => pair.name === podium[i])
      if (index !== -1)
        ++pairsCopy[index].isfor[i].isBestFreq
      else
        debug(`-----ERREUR : Le best "${i}" de '${podium[i]}' n'as pa pue être attribué----`)
    }
  }
  return pairsCopy
}


//Incrémente de +1 la pté "isBestFreq" sur le meilleur market de chaque symbole qui a été positif (100, 200, 400 ...)
function awardMarkets (symbols : Symbol[],  bests : Best[]) : Symbol[]{
  bests.forEach(best => {
    for (let i = START_GRAPH; i < END_GRAPH; i += PAS_GRAPH){
      let indexBuy : number = symbols.findIndex(symb => symb.name === best.isfor[i].buy.symbol)
      let indexSell : number= symbols.findIndex(symb => symb.name === best.isfor[i].sell.symbol)
      if ( best.isfor[i].buy.price_quote)
        symbols[indexBuy].isfor[i].buy.bestMarketFreq = symbols[indexBuy].isfor[i].buy.bestMarketFreq + 1
      if ( best.isfor[i].sell.price_quote)
        symbols[indexSell].isfor[i].sell.bestMarketFreq = symbols[indexBuy].isfor[i].sell.bestMarketFreq + 1
    }
  })
  return symbols
}

//Supprime les bests qui ont un resultat negatif !
function ejectNegativesBests(bests : Best[]) : Best[]{
  return bests.filter(best => Object.values(best.isfor)[0].spread_quote > 0 )
}


// On crée des groupes de requêtes par "pairs" , ainsi chaque groupe de symboles d'une même pair sera récupérer au même moment !
// Cela permet de préserver la cohérence malgré le temps d'attente entre chaque requêtes .
function createGroupsRequest(symbolsGroups : Array<{_id : string,symbs:string[] }>) :  Array<string[]> {
  let requestGroup : Array<string[]> = []
  while (symbolsGroups.length){
    let tab : Array<string> = []
    while(symbolsGroups.length && tab.length + symbolsGroups[0]?.symbs.length <= 100 ){
      tab.push(...symbolsGroups[0].symbs)
      symbolsGroups.shift()
    }
    requestGroup.push(tab)
  }
  return requestGroup
}


//On récupère l'orderbook de chaque symbole de manière synchrone
async function getOrderbooks (requestGroup : Array<string[]> ) : Promise<orderbook[]>{
  const x = 100/ requestGroup.length
  let result = 0
  let url = `${COINAPI_URL}/v1/orderbooks/current`
  const orderbooks : orderbook[] = []
  for(const group of requestGroup) {
    debug("chargement: ", result.toFixed(0) , " %")
    result += x
    let axiosResp : axiosResponse = await axios.get(url, {params: {filter_symbol_id: group.toString()}})
    if(axiosResp.isAxiosError)
      throw  {
        status : axiosResp.response.status,
        statusText  : axiosResp.response.statusText,
        data : axiosResp.response.data
      }
    orderbooks.push(...axiosResp.data)
  }
  return orderbooks
}

//Execute chaque parties du programme
async function programmeBests () : Promise<{ positivesBests : Best[], symbols : Symbol[], pairs : Pair[]}>{
  const [symbsGroups,assets, markets] : [ Array<{_id : string,symbs:string[] }>, Asset[],Market[] ] = await Promise.all([
    modelSymbol.aggregate(aggregateSymbols),
    modelAsset.find().lean(),
    modelMarket.find().lean(),
  ])
  let symbols : string[] = []
  symbsGroups.forEach(group => symbols.push(...group.symbs))
  const requestGroup = createGroupsRequest([...symbsGroups])
  const raw_orderbooks = await getOrderbooks(requestGroup)

  //Certains symboles ne seront pas renvoyée par l'API et d'autre seront en trop, on filtre celles en trop et on signal celles manquantes
  const orderbooks : orderbook[] = raw_orderbooks.filter(orderbook => symbols.includes(orderbook.symbol_id) )

  const prices : Price[] = await makePrices(orderbooks, assets, markets)

  const [uptSymbols, bests] = await Promise.all([
    updateSymbols(prices),
    calculBests(prices)
  ])
  const positivesBests : Best[] = ejectNegativesBests(bests)
  let [uptPairs, podium] : [Pair[], podium : Record<number, string>[]] = await Promise.all([
    updatePairs(bests),
    makePodium(positivesBests)
  ])

  const uptPairs2 = awardPairs(uptPairs, podium)
  const uptSymbols2 = awardMarkets(uptSymbols,positivesBests)

  return {positivesBests, symbols : uptSymbols2, pairs : uptPairs2}
}


export default programmeBests
