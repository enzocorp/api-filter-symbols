
export interface InitPair{
  name: string
  base : string
  quote : string
  exchanges: Array<{ id : string, symbol_id : string }>
}

export interface Pair extends InitPair{
  frequences :{
    positive : number
    negative: number
    isBest : number
  },
  ifPositiveSpread : {
    volumeMoyen : number
    volumeMoyen_usd : number
    spreadMoyen : number
    spreadMoyen_1usd : number
    spreadMoyen_15kusd : number
    profitMaxiMoyen_usd : number
    ecartType : number
    variance : number
    esperance : number
    medianne : number
    hightestSpread_15kusd : number
  },
  exclusion : {
    pairIsExclude : boolean
    fromMarkets :    Array<{
      market : string
      reasons : string[]
      severity : number
      excludeBy? : string
      note? : string
      date? : Date
    }>
  }
  date? : Date
}
