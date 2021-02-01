import {Pair, PairFor} from "../../../models/interphace/pair";
import {Symbol} from "../../../models/interphace/symbol";

async function makeInitPairs (symbols : Symbol[]) :Promise< Pair[]> {
  let pairs : Pair[] = []
  const schema : PairFor = {
    isBestFreq : 0,
    errorFreq : 0,
    negativeFreq : 0,
    notEnoughtVolFreq : 0,
    positiveFreq : 0,
    spreadMoyen_quote : null,
    spreadMoyen_usd : null,
    volumeMoyen_base : null,
    hightestSpread_usd : null,
  }
  symbols.forEach(symbol => {
    const index = pairs.findIndex(pair => pair.name === symbol.name)
    if(index === -1 ){
      pairs.push({
        name : symbol.pair,
        base : symbol.base,
        quote : symbol.quote,
        for1k : schema,
        for15k : schema,
        for30k : schema,
        exclusion: {
          isExclude: false,
          reasons: [],
          severity: 0,
          excludeBy: null,
          note: null
        },
        date : new Date()
      })
    }
  })
  return pairs
}

export default makeInitPairs
