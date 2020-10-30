import {Pair, PairFor} from "../../models/interphace/pair";
import modelPair from "../../models/mongoose/model.pair";
import {Best, BestFor} from "../../models/interphace/best";

async function calculSide(bestFor : BestFor, pairFor : PairFor) : Promise<PairFor> {

  const isPositive = (bestFor: BestFor) : boolean => bestFor.spread_quote > 0

  const doMoyenne = (initVal: number, newVal : number, freq : number) : number => ( initVal * freq + newVal) / (freq + 1)

  return {
    postiveFreq : isPositive(bestFor) ? pairFor.postiveFreq + 1 : pairFor.postiveFreq,
    negativeFreq : !isPositive(bestFor) ? pairFor.negativeFreq + 1 : pairFor.negativeFreq,
    notEnoughtVolFreq : bestFor.spread_quote === null ? pairFor.notEnoughtVolFreq + 1 : pairFor.notEnoughtVolFreq,
    errorFreq : bestFor.spread_quote === undefined ? pairFor.errorFreq + 1 : pairFor.errorFreq,
    spreadMoyen_quote  : isPositive(bestFor) ?
      doMoyenne(pairFor.spreadMoyen_quote,bestFor.spread_quote, pairFor.postiveFreq) : pairFor.spreadMoyen_quote,

    spreadMoyen_usd  : isPositive(bestFor) ?
      doMoyenne(pairFor.spreadMoyen_usd,bestFor.spread_quote, pairFor.postiveFreq) : pairFor.spreadMoyen_usd,

    volumeMoyen_base : bestFor.buy.volume_base ?
      doMoyenne(pairFor.volumeMoyen_base,bestFor.buy.volume_base, pairFor.postiveFreq) : pairFor.volumeMoyen_base,

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
