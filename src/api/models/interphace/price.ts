
export interface PriceIsfor {
  qtyBase: number|string //(en base) ou code erreur
  buy: number|string //(en quote) ou code erreur
  sell: number|string  //(en quote) ou code erreur
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
