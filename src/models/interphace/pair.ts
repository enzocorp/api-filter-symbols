
export interface Pair {
  name: string
  base : string
  quote : string
  negativeFreq : number
  ifPositiveSpread_1kusd : {
    frequence : number
    frequenceBest : number
    spreadMoyen_quote : number
    spreadMoyen_usd : number
    volumeMoyen_base : number
    volumeMoyen_usd : number
    hightestSpread_quote : number
    hightestSpread_usd : number
  },
  ifPositiveSpread_15kusd : {
    frequence : number
    frequenceBest : number
    spreadMoyen_quote : number
    spreadMoyen_usd : number
    volumeMoyen_base : number
    volumeMoyen_usd : number
    hightestSpread_quote : number
    hightestSpread_usd : number
  },
  ifPositiveSpread_30kusd : {
    frequence : number
    frequenceBest : number
    spreadMoyen_quote : number
    spreadMoyen_usd : number
    volumeMoyen_base : number
    volumeMoyen_usd : number
    hightestSpread_quote : number
    hightestSpread_usd : number
  },
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
