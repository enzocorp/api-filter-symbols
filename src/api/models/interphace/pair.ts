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
  isfor : Record<number, PairFor>
  exclusion : {
    severityHistoric : number
    /*pour une pair déjà report et qui va être éliminée a cause de ses assets : cela permet de converver sa 'severity' original
    dans le cas où ses assets son deban */
    isExclude : boolean
    reasons : string[]
    severity : number
    note? : string
    excludeBy : string
    date? : Date
  }
  date? : Date
}
