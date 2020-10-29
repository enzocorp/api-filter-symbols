
export interface Symbol{
  name: string
  market: string
  pair: string
  base : string
  quote : string
  symbolCoinapi : string
  buy : {
    testedFreq : number
    notData : number
    notEnoughVolume_1kusd : number
    notEnoughVolume_15kusd : number
    notEnoughVolume_30kusd : number
    prixMoyen_for1kusd_quote : number
    prixMoyen_for15kusd_quote : number
    prixMoyen_for30kusd_quote : number
  },
  sell : {
    testedFreq : number
    notData : number
    notEnoughVolume_1kusd : number
    notEnoughVolume_15kusd : number
    notEnoughVolume_30kusd : number
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
