
export interface PriceIsfor {
  qtyBase: number
  buy: number //(en quote)
  sell: number  //(en quote)
}

export interface Price {
  infos: {
    market: string
    symbolCoinapi: string
    symbol: string
    base: string
    quote: string
    pair: string
    website: string
    quote_usd : number
    base_usd : number
  }
  isfor: Record<number, PriceIsfor>


}
