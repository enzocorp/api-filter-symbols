export interface Market{
  name : string
  longName : string
  pairsCount : number
  website: string
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
