export interface BestFor {
  buy : {
    price : number
    market : string
    symbol : string
    website: string
    volume_base : number
  }
  sell : {
    price : number
    market : string
    symbol : string
    website: string
    volume_base : number
  }
  spread_quote : number
  spread_usd : number
}

export interface Best {
  pair : string
  quote : string
  base : string
  groupId : string
  createdBy : string,
  for1k : BestFor
  for15k : BestFor
  for30k : BestFor
  date? : Date
}
