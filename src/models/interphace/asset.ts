export interface Asset{
  name : string
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
