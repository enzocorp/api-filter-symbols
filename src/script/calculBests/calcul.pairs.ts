import {Pair, PairFor} from "../../models/interphace/pair";
import modelPair from "../../models/mongoose/model.pair";
import {Best, BestFor} from "../../models/interphace/best";

async function calculSide(bestFor : BestFor, pairFor : PairFor) : Promise<PairFor> {

  const testSpread = () : 1 | -1 | null | undefined => {
    if (bestFor.spread_quote === null) return null
    else if (bestFor.spread_quote === undefined) return undefined
    else if (bestFor.spread_quote > 0) return 1
    else if (bestFor.spread_quote < 0) return -1
    else return undefined
  }

  const doMoyenne = (initVal: number, newVal : number, freq : number) : number => ( initVal * freq + newVal) / (freq + 1)

  const infoSp = testSpread()
  return {
    positiveFreq : infoSp === 1 ? pairFor.positiveFreq + 1 : pairFor.positiveFreq,
    negativeFreq : infoSp === -1 ? pairFor.negativeFreq + 1 : pairFor.negativeFreq,
    notEnoughtVolFreq :infoSp === null ? pairFor.notEnoughtVolFreq + 1 : pairFor.notEnoughtVolFreq,
    errorFreq : infoSp === undefined ? pairFor.errorFreq + 1 : pairFor.errorFreq,
    spreadMoyen_quote  : infoSp === 1 ?
      doMoyenne(pairFor.spreadMoyen_quote,bestFor.spread_quote, pairFor.positiveFreq) : pairFor.spreadMoyen_quote,

    spreadMoyen_usd  : infoSp === 1 ?
      doMoyenne(pairFor.spreadMoyen_usd,bestFor.spread_quote, pairFor.positiveFreq) : pairFor.spreadMoyen_usd,

    volumeMoyen_base : bestFor.buy.volume_base ?
      doMoyenne(pairFor.volumeMoyen_base,bestFor.buy.volume_base, pairFor.positiveFreq) : pairFor.volumeMoyen_base,

    isBestFreq : pairFor.isBestFreq,
    hightestSpread_usd : pairFor.hightestSpread_usd < bestFor.spread_usd ? bestFor.spread_usd : pairFor.hightestSpread_usd
  }
}


async function updatePair (best : Best, pair : Pair) : Promise<Pair>{
  const [for1k,for15k,for30k] = await Promise.all([
    calculSide(best.for1k,pair.for1k),
    calculSide(best.for15k,pair.for15k),
    calculSide(best.for30k,pair.for30k),
  ])
  return {
    ...pair,
    for1k,
    for15k,
    for30k,
  }
}

async function calculPairs (bests : Best[]) : Promise<Pair[]>{
  try{
    let pairs : Pair[] = await modelPair.find().lean()
    const promisePairs : Promise<Pair>[]  =  []
    bests.forEach(best => {
      const pair = pairs.find(pair => best.pair === pair.name)
      if (pair)
        promisePairs.push(updatePair(best, pair))
      else
        console.log(`--- Erreur : La pair ${best.pair} n'as pas pue être mise a jour car elle n'existe pas dans la BDD---`)
    })
    return await Promise.all(promisePairs)
  }
  catch (err){
    console.log(err)
  }
}

export default calculPairs
