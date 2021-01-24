import {COINAPI} from "../../app";
import axios from 'axios'
import modelSymbol from "../../models/mongoose/model.symbol";
import calculPrices from "./calcul.prices";
import {Asset} from "../../models/interphace/asset";
import modelAsset from "../../models/mongoose/model.asset";
import {Price} from "../../models/interphace/price";
import calculSymbols from "./calcul.symbols";
import {Market} from "../../models/interphace/market";
import modelMarket from "../../models/mongoose/model.market";
import calculBests from "./calcul.bests";
import {Best} from "../../models/interphace/best";
import {Symbol} from "../../models/interphace/symbol";
import {Pair} from "../../models/interphace/pair";
import calculPairs from "./calcul.pairs";
import filterBests from "./filter.bests";

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


interface axiosRequest {
  data : orderbook[]
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
  {$project: {"pair.name" : 1, _id : 0}}
]

//Certaines monnaies ne seront pas renvoyée par l'API et d'autre seront en trop, on filtre celles en trop et on signal celles manquantes
function filterCoinapiResponse (axiosResp : Array<axiosRequest>, referenceSymbols : string[]) : orderbook[] {
  const orderbooks : orderbook[] = []
  axiosResp.forEach(({data} : {data : orderbook[]}) => {
    if(!data)
      throw "AHAHAHA Vous n'avez plus de requêtes"
    const filteredData = data.filter(symbol => referenceSymbols.includes(symbol.symbol_id) )
    orderbooks.push(...filteredData)
  })
  return orderbooks
}

//On récupère l'orderbook de chaque symbole de manière synchrone
async function getPrices (pairs : string[]) : Promise<orderbook[]>{
  let url = `${COINAPI}/v1/orderbooks/current`
  const division = Math.ceil(pairs.length / 350)
  const axiosResponses : axiosRequest[] = []
 /* for(let i = 0; i < division; i++){
    let tab = pairs.slice(i*350,(i+1)*350)
    let synchrone : any = await axios.get(url, {params: {filter_symbol_id: tab.toString()}})
    axiosResponses.push(synchrone)
  }*/
  const filter = pairs.map(filter => "_"+filter).toString()
  let debut = Date.now()
  let synchrone : any = await axios.get(url, {params: {filter_symbol_id: filter }})
  let fin = Date.now()
  console.log(synchrone.data)
  console.log(debut, fin)
  throw "hey"
  let test : orderbook[]
  return test
 /* const orderbooks : orderbook[] = filterCoinapiResponse(axiosResponses,strSymbs)
  return await calculPrices(orderbooks, assets, markets)*/
}

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

//Execute chaque parties du programme
async function programmeBests () : Promise<{ positivesBests : Best[], symbols : Symbol[], pairs : Pair[]}>{
  const [symb,assets, markets] : [ Array<{pair : {name : string}}>, Asset[],Market[] ] = await Promise.all([
    modelSymbol.aggregate(aggregateSymbols),
    modelAsset.find().lean(),
    modelMarket.find().lean(),
  ])
  const setPairs : Set<string> = new Set(symb.map(symb => symb.pair.name))
  const prices : any = await getPrices( [...setPairs])
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
