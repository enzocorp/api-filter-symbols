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
  {$project: {symbolCoinapi : 1, _id : 0}}
]

//Certaines monnaies ne seront pas renvoyée par l'API et d'autre seront en trop, on filtre celles en trop et on signal celles manquantes
function filterCoinapiResponse (axiosResp : Array<axiosRequest>, referenceSymbols : string[]) : orderbook[] {
  const orderbooks : orderbook[] = []
  console.log('demadné symbols', referenceSymbols.length)
  axiosResp.forEach(({data} : {data : orderbook[]}) => {
    const filteredData = data.filter(symbol => referenceSymbols.includes(symbol.symbol_id) )
    orderbooks.push(...filteredData)
  })
  console.log('retourné',orderbooks.length)
  return orderbooks
}

async function getPricesDevEnvironnement (strSymbs : string[], assets : Asset[],markets : Market[]) : Promise<Price[]>{
  let url = `${COINAPI}/v1/orderbooks/current`
  const division = Math.ceil(strSymbs.length / 350)
  const axiosResponses : Array<axiosRequest> = []
  for(let i = 0; i < division; i++){
    let tab = strSymbs.slice(i*350,(i+1)*350)
    const axiosResp :{data : orderbook[]} = await axios.get(url, {params: {filter_symbol_id: tab.toString()}})
    axiosResponses.push(axiosResp)
  }
  const orderbooks : orderbook[] =  filterCoinapiResponse(axiosResponses,strSymbs)
  return await calculPrices(orderbooks, assets, markets)
}

async function getPrices (strSymbs : string[], assets : Asset[],markets : Market[]) : Promise<Price[]>{
  let url = `${COINAPI}/v1/orderbooks/current`
  const division = Math.ceil(strSymbs.length / 350)
  const axiosPromises : Promise<axiosRequest>[] = []
  for(let i = 0; i < division; i++){
    let tab = strSymbs.slice(i*350,(i+1)*350)
    axiosPromises.push(
      axios.get(url, {params: {filter_symbol_id: tab.toString()}})
    )
  }
  const axiosResponses : Array<axiosRequest> = await Promise.all(axiosPromises)
  const orderbooks : orderbook[] = filterCoinapiResponse(axiosResponses,strSymbs)
  return await calculPrices(orderbooks, assets, markets)
}

function awardPairs(pairs: Pair[], podium: Object){
  for(let key in podium){
    if (!podium[key])
      continue
    const index : number = pairs.findIndex(pair => pair.name === podium[key])
    if (index !== -1)
      pairs[index][key].isBestFreq++
    else
      console.log(`-----ERREUR : Le best "${key}" de '${podium[key]}' n'as pa pue être attribué----`)
  }
  return pairs
}

async function programmeBests () : Promise<{ positivesBests : Best[], symbols : Symbol[], pairs : Pair[]}>{
  const [nameSymbs,assets, markets] : [{symbolCoinapi : string}[], Asset[],Market[]] = await Promise.all([
    modelSymbol.aggregate(aggregateSymbols),
    modelAsset.find().lean(),
    modelMarket.find().lean(),
  ])
  const strSymbs : string[] = nameSymbs.map(symb => symb.symbolCoinapi)

  const prices: Price[] = process.env.NODE_ENV === 'development' ?
    await getPricesDevEnvironnement(strSymbs, assets, markets) :
    await getPrices(strSymbs, assets, markets)

  const [uptSymbols, bests] = await Promise.all([
    calculSymbols(prices),
    calculBests(prices)
  ])
  let [uptPairs, positivesBests] : [Pair[], {bests : Best[],podium : Object }] = await Promise.all([
    calculPairs(bests),
    filterBests(bests)
  ])

  const finalPairs = awardPairs(uptPairs, positivesBests.podium)
  return {positivesBests : positivesBests.bests, symbols : uptSymbols, pairs : finalPairs}
}


export default programmeBests
