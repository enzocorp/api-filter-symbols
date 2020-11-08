import {Best, BestFor} from "../../models/interphace/best";
import {Price} from "../../models/interphace/price";

async function filterNegatives(bests : Best[]) : Promise<Best[]>{ //Enelves les bests negatifs
  return bests.filter(best => best.for1k.spread_quote > 0
    || best.for15k.spread_quote> 0 || best.for30k.spread_quote > 0
  )
}

async function findBestOne(bests : Best[], isFor : 'for1k' |'for15k' | 'for30k' ) : Promise<string> {
  let theBest : Best = null
  bests.forEach(best => {
    if(best[isFor].spread_quote && best[isFor].spread_usd){
      if (!theBest && best[isFor].spread_usd > 0)
        theBest = best
      else if (theBest && theBest[isFor].spread_usd < best[isFor].spread_usd)
        theBest = best
    }
  })
  return theBest? theBest.pair : null
}

async function filterBests (bests : Best[]) : Promise<{bests: Best[], podium : [string,string,string] }>{
  let [filteredBests,strBestFor1k,strBestFor15k,strBestFor30k] = await Promise.all([
    filterNegatives(bests),
    findBestOne(bests,'for1k'),
    findBestOne(bests,'for15k'),
    findBestOne(bests,'for30k'),
  ])
  return {bests : filteredBests, podium : [strBestFor1k,strBestFor15k,strBestFor30k]}
}

export default filterBests
