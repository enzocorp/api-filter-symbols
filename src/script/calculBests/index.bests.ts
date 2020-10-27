import {COINAPI} from "../../app";
import axios from 'axios'
import {Symbol} from "../../models/interphace/symbol";
import modelSymbol from "../../models/mongoose/model.symbol";
import {Best} from "../../models/interphace/best";

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

async function programme (tab : string[],symbs : Symbol[]) : Promise<any>{
  let url = `${COINAPI}/v1/orderbooks/current`
  const updatedSymbols : Symbol[] = []
  const bests : Best[] = []
  const {data : orderbooks} : {data : orderbook[]} = await axios.get(url, {params: {
      filter_symbol_id: tab.toString()
    }})


}

async function makeBests () : Promise<any>{
  const tabsymbs : string[] = await modelSymbol.distinct("symbolCoinapi")
  const symbs : Symbol[] = await modelSymbol.find().lean()
  let len = tabsymbs.slice(0,350)
  await programme(len,symbs)
}


export default makeBests
