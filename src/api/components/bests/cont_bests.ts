import programmeBests from "./services/index.calcul-sync";
import modelPair from "../../models/mongoose/model.pair";
import modelBest from "../../models/mongoose/model.best";
import modelSymbol from "../../models/mongoose/model.symbol";
import {RequesterMongo} from "../../../services/requesterMongo";
import {Best} from "../../models/interphace/best";
import modelPodium from "../../models/mongoose/model.podium";

export const get_bests = async  (req,res,next)=>{
    try{
        const requester = new RequesterMongo(modelBest)
        const content :{data : any,metadata? : any} = await requester.make(req.query.request)
        res.status(200).json(content)
    }
    catch (error){
      return  next(error)
    }
}

export const get_best = async  (req,res,next)=>{
    try {
        const best = await modelBest.findOne({_id : req.params.id})
        res.status(200).json({data : best})
    }catch (error){
      return  next(error)
    }
}

export const get_podium = async  (req,res,next)=>{
  try {
    const podium = await modelPodium.find({groupId : req.params.groupId})
    res.status(200).json({data : podium})
  }catch (error){
    return  next(error)
  }
}


export const get_last_groupId = async  (req, res,next)=>{
    try{
        const best : Best[] = await modelBest.find().sort('-_id').limit(1)
        res.status(200).json({data : best[0]?.groupId})
    }
    catch (error){
      return  next(error)
    }
}


export const calcul_bests = async  (req,res,next)=>{
  try{
    console.log("1- C'est partie pour le calcul !")
    let {positivesBests,pairs,symbols,podium} = await programmeBests()

    console.log("10- Sauvegarde des pairs")
    const bulkPairs = pairs.map(pair => ({
        updateOne: {
            filter: { name : pair.name },
            update: { $set: pair },
        }
    }));

    console.log("11- Sauvegarde des symbs")
    const bulkSymbols = symbols.map(symbol => ({
        updateOne: {
            filter: { name : symbol.name },
            update: { $set: symbol },
        }
    }));
    console.log("10- Save Mongo pair, symb, bests et podium")
    const [insertedPairs,insertedBests,insertedPodium,insertedSymbs] = await Promise.all([
      modelPair.collection.bulkWrite(bulkPairs),
      modelBest.insertMany(positivesBests),
      modelPodium.insertMany(podium),
      modelSymbol.collection.bulkWrite(bulkSymbols)
    ])

    console.log('calcul fini avec succes')
    res.status(200).json({title : "Calcul effectué avec succès",data : insertedBests, metadata : {pairs : insertedPairs, symbols : insertedSymbs}})
  }
   catch (error){
       return  next(error)
   }
}


export const reset_bests = async  (req,res,next)=>{
    try{
        await modelBest.remove({})
        res.status(200).json({title : "Succès : Suppression de l'historique effectuée"})
    }catch (error){
         return  next(error)
     }
}
