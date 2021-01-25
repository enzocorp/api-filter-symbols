export interface Price {
  infos : {
    market : string
    symbolCoinapi : string
    symbol : string
    base : string
    quote : string
    pair : string
    website : string
    quote_usd : number
  }
  qty : {
    qtyBase_with1kusd : number
    qtyBase_with15kusd : number
    qtyBase_with30kusd : number
  }
  buy : {
    price_for1kusd_quote : number
    price_for15kusd_quote : number
    price_for30kusd_quote : number
  }
  sell : {
    price_for1kusd_quote : number
    price_for15kusd_quote : number
    price_for30kusd_quote : number
  }
}
