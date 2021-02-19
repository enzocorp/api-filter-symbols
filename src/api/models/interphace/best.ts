export interface BestFor {
  buy : {
    market : string
    symbol : string
    website: string
    price_quote : number|string
    volume_base : number|string
  }
  sell : {
    market : string
    symbol : string
    website: string
    price_quote : number|string
    volume_base : number|string
  }
  spread_quote : number|string
  spread_usd : number
}

export interface Best {
  name : string
  pair : string
  base : string
  quote : string
  groupId : string
  createdBy : string,
  isfor : Record<number, BestFor>
  date? : Date
}
