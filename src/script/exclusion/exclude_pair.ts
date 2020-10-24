import {Pair} from "../../models/interphace/pair";

interface req_body {
  market : string
  reasons : string[]
  severity : number
  note? : string
}

export function addExclusion (pair : Pair, body : req_body) : Pair['exclusion']{
  let {exclusion} = pair

  if( body.market === '*' )
    exclusion.pairIsExclude = body.severity === 4

  let i = exclusion.fromMarkets.findIndex(item => item.market === body.market)
  if(i === -1){
    exclusion.fromMarkets.push({
      market : body.market,
      reasons : body.reasons,
      severity : body.severity,
      excludeBy : 'unknown',
      note : body.note ? body.note : ''
    })
    return exclusion
  }

  throw "Ajout impossible car cette exclusion existe déjà"

}

export function editExclusion (pair : Pair, body : req_body) : Pair['exclusion'] {
  let {exclusion} = pair

  if( body.market === '*' )
    exclusion.pairIsExclude = body.severity === 4

  let i : number = exclusion.fromMarkets.findIndex(item => item.market === body.market)
  if(i !== -1){
    exclusion.fromMarkets[i] = {
      market : body.market,
      reasons : body.reasons,
      severity : body.severity,
      excludeBy : 'unknown',
      note : body.note ? body.note : ''
    }
    return exclusion
  }
  throw "L'exclusion à modifier n'a pas été trouvée"


}

export function deleteExclusion (pair : Pair, body : string) : Pair['exclusion'] {
  let {exclusion} = pair
  let i : number = exclusion.fromMarkets.findIndex(item => item.market === body)
  if(i !== -1){
    let item = exclusion.fromMarkets[i]
    if( item.market === '*')
      exclusion.pairIsExclude = false

    exclusion.fromMarkets.splice(i,1)
    return exclusion
  }
  throw "L'exclusion qui doit être supprimer n'as pas été trouvée"
}

export function editExclusionGroup (pairs : Pair[], body : req_body) : Pair['exclusion'][] {
  const exclusions : Pair['exclusion'][] = []
  pairs.forEach(pair => {
    let {exclusion} = pair
    if( body.market === '*' )
      exclusion.pairIsExclude = body.severity === 4

    let i : number = exclusion.fromMarkets.findIndex(item => item.market === body.market)
    if(i === -1){
      exclusion.fromMarkets.push({
        market : body.market,
        reasons : body.reasons,
        severity : body.severity,
        excludeBy : 'unknown',
        note : body.note ? body.note : ''
      })
      exclusions.push(exclusion)
    }
    else if(i !== -1){
      exclusion.fromMarkets[i] = {
        market : body.market,
        reasons : body.reasons,
        severity : body.severity,
        excludeBy : 'unknown',
        note : body.note ? body.note : ''
      }
      exclusions.push(exclusion)
    }
    else {
      throw "Le signalement de " + pair.name + " n'a pas pue être effectué ! "
    }

  })
  return exclusions
}

export function removeExclusionGroup (pairs : Pair[]) : Pair['exclusion'][] {
  const exclusions : Pair['exclusion'][] = []
  pairs.forEach(pair => {
    let {exclusion} = pair
    let i : number = exclusion.fromMarkets.findIndex(item => item.market === '*')
    if(i !== -1){
      let item = exclusion.fromMarkets[i]
      if( item.market === '*')
        exclusion.pairIsExclude = false
      exclusion.fromMarkets.splice(i,1)
      exclusions.push(exclusion)
    }
    else{
      throw "Le blanchiement de" + pair.name + " n'as pas pue être effectué"
    }

  })
  if (pairs.length !== exclusions.length)
    throw "Le blanchiement n'as pas pue être effectué"
  return exclusions
}


