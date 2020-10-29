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

async function getPrices (strSymbs : string[], assets : Asset[],markets : Market[]) : Promise<Price[]>{
  let url = `${COINAPI}/v1/orderbooks/current`
  let tab = strSymbs.slice(0,100)
  const {data : orderbooks} : {data : orderbook[]} = await axios.get(url, {params: {
      filter_symbol_id: tab.toString()
    }})
  return await calculPrices(orderbooks, assets, markets)
}

async function programmeBests () : Promise<{ bests : Best[], symbols : Symbol[] }>{
  const [strSymbs,assets, markets] = await Promise.all([
    modelSymbol.distinct("symbolCoinapi"),
    modelAsset.find().lean(),
    modelMarket.find().lean()
  ])
  const prices: Price[] = await getPrices(strSymbs, assets, markets)
  const [uptSymbols, bests] = await Promise.all([
    calculSymbols(prices),
    calculBests(prices)
  ])
  return {bests : bests, symbols : uptSymbols}
}


export default programmeBests
