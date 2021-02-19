import {Pair, PairFor} from "../../../../models/interphace/pair";
import {Symbol} from "../../../../models/interphace/symbol";
import {END_GRAPH, PAS_GRAPH, START_GRAPH} from "../../../bests/config_bests";


//Construit les pairs a partir des symboles finaux
async function buildPairs (symbols : Symbol[]) :Promise< Pair[]> {
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
  let isfor = {}
  for (let i = START_GRAPH; i <= END_GRAPH; i += PAS_GRAPH){
    isfor[i] = schema
  }
  symbols.forEach(symbol => {
    const index = pairs.findIndex(pair => pair.name === symbol.name)
    if(index === -1 ){
      pairs.push({
        name : symbol.pair,
        base : symbol.base,
        quote : symbol.quote,
        isfor,
        exclusion: {
          severityHistoric : null, //Null signifie qu'aucun asset n'est ban, s'il y a un nombre alors aumoins 1 asset qui est ban
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

export default buildPairs
