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

async function getPricesDevEnvironnement (strSymbs : string[], assets : Asset[],markets : Market[]) : Promise<Price[]>{
  let url = `${COINAPI}/v1/orderbooks/current`
  const division = Math.ceil(strSymbs.length / 350)
  const orderbooks : orderbook[] = []
  for(let i = 0; i < division; i++){
    let tab = strSymbs.slice(i*350,(i+1)*350)
    const {data} = await axios.get(url, {params: {filter_symbol_id: tab.toString()}})
    orderbooks.push(...data)
  }
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
    //Certaines monnaies ne seront pas renvoyée par l'API et d'autre seront en trop .
  }
  const axiosResponses : Array<axiosRequest> = await Promise.all(axiosPromises)
  const orderbooks : orderbook[] = []
  axiosResponses.forEach(({data}) => {
    orderbooks.push(...data)
  })
  return await calculPrices(orderbooks, assets, markets)
}

function awardPairs(pairs : Pair[],podium : {for1k:string,for15k : string,for30k:string}){
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

async function programmeBests () : Promise<{ bests : Best[], symbols : Symbol[], pairs : Pair[]}>{
  const [strSymbs,assets, markets] = await Promise.all([
    modelSymbol.distinct("symbolCoinapi"),
    modelAsset.find().lean(),
    modelMarket.find().lean(),
  ])

  const prices: Price[] = process.env.NODE_ENV === 'development' ?
    await getPricesDevEnvironnement(strSymbs, assets, markets) :
    await getPrices(strSymbs, assets, markets)

  const [uptSymbols, bests] = await Promise.all([
    calculSymbols(prices),
    calculBests(prices)
  ])
  let [uptPairs, objBests] = await Promise.all([
    calculPairs(bests),
    filterBests(bests)
  ])

  const finalPairs = awardPairs(uptPairs, objBests.podium)
  return {bests : objBests.bests, symbols : uptSymbols, pairs : finalPairs}
}


export default programmeBests
