import modelPair from "../../../models/mongoose/model.pair";
import {Pair} from "../../../models/interphace/pair";
import {BAN_BASE, BAN_QUOTE} from "../config_bancodes";

export const banLinkedPairs = async  (assets : string[],side : 'base' | 'quote',status : string) : Promise<void> =>{
  const pairs : Pair[] = await modelPair.find({[side] : {$in: assets }}  ).lean()
  if(pairs.length === 0) return
  const uptPairs = pairs.map(pair => {
    const setReasons : Set<string> = new Set(pair.exclusion.reasons)
    setReasons.add(status)
    pair.exclusion = {
      //Attention on ne doit appliquer l'historique de "ban-asset" uniquement sur une pair ne possedant pas deja un historique !!
      severityHistoric : pair.exclusion.severityHistoric === null ? pair.exclusion.severity : pair.exclusion.severityHistoric,
      isExclude : true,
      reasons : [...setReasons],
      severity : 4,
      excludeBy : 'unknow',
      note : pair.exclusion.note,
      date : new Date()
    }
    return pair
  })

  const bulkPairs = uptPairs.map(pair => ({
    updateOne: {
      filter: { name : pair.name },
      update: { $set: { exclusion : pair.exclusion } },
      option : {upsert: false}
    }
  }));

  await modelPair.collection.bulkWrite(bulkPairs)
}

export const unBanLinkedPairs = async  (assets : string[],side:'base'|'quote',status : string) : Promise<void> =>{
  const pairs : Pair[] = await modelPair.find({[side] : {$in: assets}, "exclusion.reasons" : status } ).lean()
  if(pairs.length === 0) return
  const uptPairs = pairs.map(pair => {
    const setReasons : Set<string> = new Set([...pair.exclusion.reasons])
    setReasons.delete(status)
    const keepExclude : boolean = setReasons.has(BAN_BASE) || setReasons.has(BAN_QUOTE)
    pair.exclusion = {
      //On enleve le ban uniquement si les 2 assets qui constituent la paire ne sont pas ban !! !!
      severityHistoric : keepExclude ? pair.exclusion.severityHistoric : null,
      isExclude : keepExclude ? true : pair.exclusion.severityHistoric === 4,
      reasons : [...setReasons],
      severity : keepExclude ? 4 : pair.exclusion.severityHistoric,
      excludeBy : 'unknow',
      note : pair.exclusion.note,
      date : new Date()
    }
    return pair
  })

  const bulkPairs = uptPairs.map(pair => ({
    updateOne: {
      filter: { name : pair.name },
      update: { $set: { exclusion : pair.exclusion } },
      option : {upsert: false}
    }
  }));

  await modelPair.collection.bulkWrite(bulkPairs)
}
