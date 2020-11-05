export interface BestFor {
  buy : {
    market : string
    symbol : string
    website: string
    price_quote : number
    volume_base : number
  }
  sell : {
    price_quote : number
    market : string
    symbol : string
    website: string
    volume_base : number
  }
  spread_quote : number
  spread_usd : number
}

export interface Best {
  name : string
  pair : string
  base : string
  quote : string
  groupId : string
  createdBy : string,
  for1k : BestFor
  for15k : BestFor
  for30k : BestFor
  date? : Date
}
