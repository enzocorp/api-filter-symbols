import {COINAPI} from "../../../../../app";
import axios from 'axios'
import modelSymbol from "../../../../models/mongoose/model.symbol";
import calculPrices from "./calcul.prices";
import {Asset} from "../../../../models/interphace/asset";
import modelAsset from "../../../../models/mongoose/model.asset";
import {Price} from "../../../../models/interphace/price";
import calculSymbols from "./calcul.symbols";
import {Market} from "../../../../models/interphace/market";
import modelMarket from "../../../../models/mongoose/model.market";
import calculBests from "./calcul.bests";
import {Best} from "../../../../models/interphace/best";
import {Symbol} from "../../../../models/interphace/symbol";
import {Pair} from "../../../../models/interphace/pair";
import calculPairs from "./calcul.pairs";
import filterBests from "./filter.bests";
import {Error} from "mongoose";
import {log} from "util";

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
      _id : "$pair",
      symbs : { $push: "$symbolCoinapi" }
  }}
]

//Incrémente de +1 la pté "isBestFreq" sur la meilleur pair de chaque categorie de prix ( 1k,15k,30k )
function awardPairs(pairs: Pair[], podium: [string,string,string]){
  const isForTab = ['for1k','for15k','for30k']
  isForTab.forEach((isFor,i) => {
    if(podium[i]){
      const index : number = pairs.findIndex(pair => pair.name === podium[i])
      if (index !== -1)
        ++pairs[index][isFor].isBestFreq
      else
        console.log(`-----ERREUR : Le best "${isFor}" de '${podium[i]}' n'as pa pue être attribué----`)
    }
  })
  return pairs
}

//On récupère l'orderbook de chaque symbole de manière synchrone
async function getOrderbooks (requestGroup : Array<string[]>,qty : number ) : Promise<orderbook[]>{
  const x = 100/ requestGroup.length
  let result = 0
  let url = `${COINAPI}/v1/orderbooks/current`
  const orderbooks : orderbook[] = []
  for(const group of requestGroup) {
    console.log("chargement: ", result.toFixed(0) , " %")
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


function createGroupsRequest(symbolsGroups : Array<{_id : string,symbs:string[] }>) :  Array<string[]> {
  // On crée des groupes de requêtes par "pairs" , ainsi chaque groupe de symboles d'une même pair sera récupérer au même moment !
  // Cela permet de préserver la cohérence malgré le temps d'attente entre chaque requêtes .
  let requestGroup : Array<string[]> = []
  while (symbolsGroups.length){
    let tab : Array<string> = []
    while(symbolsGroups.length && tab.length + symbolsGroups[0]?.symbs.length < 120 ){
      tab.push(...symbolsGroups[0].symbs)
      symbolsGroups.shift()
    }
    requestGroup.push(tab)
  }
  return requestGroup
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
  const raw_orderbooks = await getOrderbooks(requestGroup,symbols.length)

  //Certains symboles ne seront pas renvoyée par l'API et d'autre seront en trop, on filtre celles en trop et on signal celles manquantes

  const orderbooks : orderbook[] = raw_orderbooks.filter(orderbook => symbols.includes(orderbook.symbol_id) )

  let prices : any = await calculPrices(orderbooks, assets, markets)
  const [uptSymbols, bests] = await Promise.all([
    calculSymbols(prices),
    calculBests(prices)
  ])
  let [uptPairs, positivesBests] : [Pair[], {bests : Best[],podium : [string,string,string] }] = await Promise.all([
    calculPairs(bests),
    filterBests(bests)
  ])

  const finalPairs = awardPairs(uptPairs, positivesBests.podium)
  return {positivesBests : positivesBests.bests, symbols : uptSymbols, pairs : finalPairs}
}


export default programmeBests
