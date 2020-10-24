export interface Exchange{
  name : string
  id_exchange : string
  symbolsCount : number
  website: string
  exclusion : {
    exchangeIsExclude : boolean
    reasons : string[]
    severity : number
    note? : string
    excludeBy : string
    date? : Date
  }
  date? : Date
}
