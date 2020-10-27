import {Symbol} from "../../models/interphace/symbol";
import {Best} from "../../models/interphace/best";
import {Asset} from "../../models/interphace/asset";

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

function bookParser (book: orderbook) {
  console.log('ze')
}

async function makeBests (ordersbooks : orderbook[], asset : Asset[]) : Promise<any>{
  const bests : Best[] = []
  ordersbooks.forEach(book=>{

  })

}
