import {Pair, PairFor} from "../../../../models/interphace/pair";
import modelPair from "../../../../models/mongoose/model.pair";
import {Best, BestFor} from "../../../../models/interphace/best";
import debuger from "debug";
import {
  END_GRAPH,
  NOT_BASEUSD_INFOS,
  NOT_DATA_IN_ORDERBOOK,
  NOT_ENOUGHT_VOLUME,
  PAS_GRAPH,
  START_GRAPH
} from "../../config_bests";

const debug = debuger("api:updatePairs")

async function calculFor(isfor : number, bestFor : BestFor, pairFor : PairFor) : Promise<{[key : string] : PairFor}> {

  const checkSpread = () : 1 | -1 | string => {
    if (typeof bestFor.spread_quote === "string") return bestFor.spread_quote
    else if (bestFor.spread_quote > 0) return 1
    else if (bestFor.spread_quote < 0) return -1
  }

  const doMoyenne = (initVal: number, newVal : number, freq : number) : number => ( initVal * freq + newVal) / (freq + 1)

  const infoSpread = checkSpread()
  const pairforUpdated : PairFor = {
    positiveFreq : infoSpread === 1 ? pairFor.positiveFreq + 1 : pairFor.positiveFreq,
    negativeFreq : infoSpread === -1 ? pairFor.negativeFreq + 1 : pairFor.negativeFreq,
    notEnoughtVolFreq :infoSpread === NOT_ENOUGHT_VOLUME ? pairFor.notEnoughtVolFreq + 1 : pairFor.notEnoughtVolFreq,
    errorFreq : infoSpread === (NOT_DATA_IN_ORDERBOOK || NOT_BASEUSD_INFOS) ? pairFor.errorFreq + 1 : pairFor.errorFreq,
    spreadMoyen_quote  : infoSpread === 1 ?
      doMoyenne(pairFor.spreadMoyen_quote,+bestFor.spread_quote, pairFor.positiveFreq) : pairFor.spreadMoyen_quote,

    spreadMoyen_usd  : infoSpread === 1 ?
      doMoyenne(pairFor.spreadMoyen_usd,+bestFor.spread_usd, pairFor.positiveFreq) : pairFor.spreadMoyen_usd,

    volumeMoyen_base : bestFor.buy.volume_base ?
      doMoyenne(pairFor.volumeMoyen_base,+bestFor.buy.volume_base, pairFor.positiveFreq) : pairFor.volumeMoyen_base,

    isBestFreq : pairFor.isBestFreq,
    hightestSpread_usd : pairFor.hightestSpread_usd < bestFor.spread_usd ? +bestFor.spread_usd : pairFor.hightestSpread_usd
  }

  return {[isfor] : pairforUpdated}
}


async function updatePair (best : Best, pair : Pair) : Promise<Pair>{
  const promises : Promise<{[key : string] : PairFor}>[] = []
  for (let i = START_GRAPH; i <= END_GRAPH; i += PAS_GRAPH){
    promises.push(calculFor(i,best.isfor[i],pair.isfor[i]))
  }
  const allIsfor = await Promise.all(promises)
  let updatedPair : Pair  = {...pair}
  allIsfor.forEach(pairFor => {
    updatedPair.isfor = {...updatedPair.isfor, ...pairFor}
  })
  return updatedPair
}

//Met a jour chaque pair
async function updatePairs (bests : Best[]) : Promise<Pair[]>{
  try{
    let pairs : Pair[] = await modelPair.find().lean()
    const promisePairs : Promise<Pair>[]  =  []
    bests.forEach(best => {
      const pair = pairs.find(pair => best.pair === pair.name)
      if (pair)
        promisePairs.push(updatePair(best, pair))
      else
        debug(`--- Attention : La pair ${best.pair} n'as pas pue être mise a jour car elle n'existe pas dans la BDD---`)
    })
    return await Promise.all(promisePairs)
  }
  catch (err){
    debug(err)
  }
}

export default updatePairs
