import {Best, BestFor} from "../../../models/interphace/best";
import {END_GRAPH, PAS_GRAPH, START_GRAPH} from "../config_bests";
import {Podium} from "../../../models/interphace/podium";


//Trouve le Best d'une marche du podium
async function calculPodium(isFor : number, bests : Best[]) : Promise<Podium> {
  let theBest : Best = undefined
  bests.forEach(best => {
    if(best.isfor[isFor].spread_quote && best.isfor[isFor].spread_usd){
      if (!theBest && best.isfor[isFor].spread_quote > 0)
        theBest = best
      else if (theBest && theBest.isfor[isFor].spread_usd < best.isfor[isFor].spread_usd)
        theBest = best
    }
  })

  return theBest ? {
    nameBest  : theBest.name,
    spread_usd : +theBest.isfor[isFor].spread_usd,
    pair : theBest.pair,
    groupId : `${theBest.groupId}`,
   index : isFor,
  } : null

}

//Fabrique le podium de chaque valeur en dollar
async function makePodium (bests : Best[]) : Promise<Podium[]>{
  const promises: Promise<Podium>[] = []
  for (let i = START_GRAPH; i <= END_GRAPH; i += PAS_GRAPH){
    promises.push(calculPodium(i,bests))
  }
  const result : Podium[] =  await Promise.all(promises)
  return result

}
export default makePodium
