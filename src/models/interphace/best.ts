export interface Best {
  pair : string
  quote : string
  base : string
  groupId : string
  createdBy : string,
  buy : {
    market : string
    website: string
    symbol : string
    price_for1kusd_quote : number
    price_for15kusd_quote : number
    price_for30kusd_quote : number
  },
  sell : {
    market : string
    website: string
    symbol : string
    price_for1kusd_quote : number
    price_for15kusd_quote : number
    price_for30kusd_quote : number
  },
  spread_1kusd : {
    spread_quote : number
    spread_usd : number
    volume_base : number
    volume_usd : number
  },
  spread_15kusd : {
    spread_quote : number
    spread_usd : number
    volume_base : number
    volume_usd : number
  },
  spread_30kusd : {
    spread_quote : number
    spread_usd : number
    volume_base : number
    volume_usd : number
  },
  date? : Date
}
