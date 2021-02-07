export interface SymbolFor {
  buy : {
    bestMarketFreq : number
    okFreq : number
    notDataFreq : number
    notEnoughVolFreq : number
    prixMoyen_quote : number
  }
  sell : {
    bestMarketFreq: number
    okFreq : number
    notDataFreq : number
    notEnoughVolFreq : number
    prixMoyen_quote : number
  }
}

export interface Symbol {
  name: string
  market: string
  pair: string
  base : string
  quote : string
  symbolCoinapi : string
  isfor: Record<number, SymbolFor>
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
