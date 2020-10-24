export interface Best {
  pair : string
  quote : string
  base : string
  buy : {
    exchange : string
    website: string
    symbol_id : string
    price : number
    volume : number
    volume_usd : number

    price_for1kusd_quote : number
    price_for15kusd_quote : number
    price_for30kusd_quote : number
    volume_for1kusd : number
    volume_for15kusd : number
    volume_for30kusd : number
  },
  sell : {
    exchange : string
    website: string
    symbol_id : string
    price : number
    volume : number
    volume_usd : number

    price_for1kusd_quote : number
    price_for15kusd_quote : number
    price_for30kusd_quote : number
    volume_for1kusd : number
    volume_for15kusd : number
    volume_for30kusd : number
  },
  spread : number
  volume : number
  volume_usd : number
  volumeLimiteur : 'buy' | 'sell'
  spread_1usd : number
  spread_15kusd : number
  profitMaxi_usd : number
  groupId : string
  _createdBy : string,
  date? : Date
}
