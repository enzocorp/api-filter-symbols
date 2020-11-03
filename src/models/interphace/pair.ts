export interface PairFor{
  positiveFreq : number
  negativeFreq : number
  isBestFreq : number
  notEnoughtVolFreq : number
  errorFreq : number

  spreadMoyen_quote : number
  spreadMoyen_usd : number
  volumeMoyen_base : number
  hightestSpread_usd : number
}


export interface Pair {
  name: string
  base : string
  quote : string
  marketsForThis? : number
  for1k : PairFor
  for15k : PairFor
  for30k : PairFor
  exclusion : {
    isExclude : boolean
    reasons : string[]
    severity : number
    note? : string
    excludeBy : string
    date? : Date
  }
  date? : Date
}
