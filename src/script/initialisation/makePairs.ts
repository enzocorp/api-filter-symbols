import {Pair} from "../../models/interphace/pair";
import {Symbol} from "../../models/interphace/symbol";

async function makeInitPairs (symbols : Symbol[]) :Promise< Pair[]> {
  let pairs : Pair[] = []
  const schema : Pair['ifPositiveSpread_1kusd' | 'ifPositiveSpread_15kusd' | 'ifPositiveSpread_30kusd'] = {
    frequence : 0,
    frequenceBest : 0,
    spreadMoyen_quote : null,
    spreadMoyen_usd : null,
    volumeMoyen_base : null,
    volumeMoyen_usd : null,
    hightestSpread_quote : null,
    hightestSpread_usd : null,
  }
  symbols.forEach(symbol => {
    const index = pairs.findIndex(pair => pair.name === symbol.name)
    if(index === -1 ){
      pairs.push({
        name : symbol.pair,
        base : symbol.base,
        quote : symbol.quote,
        negativeFreq : 0,
        ifPositiveSpread_1kusd : schema,
        ifPositiveSpread_15kusd : schema,
        ifPositiveSpread_30kusd : schema,
        exclusion: {
          isExclude: false,
          reasons: [],
          severity: 0,
          excludeBy: null,
          note: null
        }
      })
    }
  })
  return pairs
}

export default makeInitPairs
