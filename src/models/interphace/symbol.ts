
export interface Symbol{
  name: string
  market: string
  pair: string
  buy : {
    frequence : number
    prixMoyen_for1kusd_quote : number
    prixMoyen_for15kusd_quote : number
    prixMoyen_for30kusd_quote : number
  },
  sell : {
    frequence : number
    prixMoyen_for1kusd_quote : number
    prixMoyen_for15kusd_quote : number
    prixMoyen_for30kusd_quote : number
  }
  exclusion : {
    isExclude : boolean
    reasons : string[]
    severity : number
    excludeBy : string
    note? : string
    date? : Date
  }
  date? : Date
}
