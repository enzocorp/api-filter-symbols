export interface Asset{
  name : string
  longName : string
  price_usd : number
  typeIsCrypto : boolean
  inPairCount : number
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
