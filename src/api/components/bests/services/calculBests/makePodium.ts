import {Best, BestFor} from "../../../../models/interphace/best";
import {END_GRAPH, PAS_GRAPH, START_GRAPH} from "../../config_bests";

//Trouve le Best d'une marche du podium
async function calculPodium(isFor : number, bests : Best[]) : Promise<{[key:number]: string}> {
  let theBest : Best = undefined
  bests.forEach(best => {
    if(best.isfor[isFor].spread_quote && best.isfor[isFor].spread_usd){
      if (!theBest && best.isfor[isFor].spread_quote > 0)
        theBest = best
      else if (theBest && theBest.isfor[isFor].spread_usd < best.isfor[isFor].spread_usd)
        theBest = best
    }
  })
  const result : string = theBest ? theBest.pair : null
  return {[isFor]: result}
}

//Fabrique le podium de chaque valeur en dollar
async function makePodium (bests : Best[]) : Promise<Record<number, string>[]>{
  const promises: Promise<{[key:number]: string}>[] = []
  for (let i = START_GRAPH; i < END_GRAPH; i += PAS_GRAPH){
    promises.push(calculPodium(i,bests))
  }
  return await Promise.all(promises)
}

export default makePodium
