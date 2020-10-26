import findMarkets from "../script/crypto/findMarkets";
import findAssets from "../script/crypto/findAssets";
import makeInitPairs from "../script/crypto/make_initPairs";
import modelPair from "../models/mongoose/model.pair";
import modelMarket from "../models/mongoose/model.market";
import modelGlobal from "../models/mongoose/model.global";
import modelReason from "../models/mongoose/model.reason";
import modelSeverity from "../models/mongoose/model.severity";
import {Reason} from "../models/interphace/reason";

export  const ping = async (req,res)=> {
  try{
    console.log('-------PING RECU------------')
    res.status(200).json({title : "J'ai recu un ping", message : 'voici un message'})
  }catch (err){
    res.status(404).json({title : 'probleme', message : err.message})
  }
}
export const init_app = async  (req, res)=>{
    try{
        let [markets,assets] = await Promise.all([findMarkets(),findAssets()])
        let pairs = await makeInitPairs(markets,assets)

        const bulkOpsPairs = pairs.map(pair => ({
            updateOne: {
                filter: { name : pair.name },
                update: { $setOnInsert: {...pair} }, //N'applqiue le contenu que sur les INSERTION !
                upsert: true                         //Ainsi les pairs déjà existante ne seront pas update
            }
        }));
        const bulkOpsExchanges = markets.map(exchange => ({
            updateOne: {
                filter: { name : exchange.name },
                update: { $setOnInsert: {...exchange} },
                upsert: true
            }
        }));

        let [resPairs,resExchanges] = await Promise.all([
            modelPair.collection.bulkWrite(bulkOpsPairs),
            modelMarket.collection.bulkWrite(bulkOpsExchanges)])

        res.status(200).json({resPairs, resExchanges})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur lors de l'init est survenue", message : erreur.message})
    }

}

export const get_coinapi = async  (req, res)=>{
    try{
        const infos = await modelGlobal.findOne()
        res.status(200).json({data : infos})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur lors de l'init est survenue", message : erreur.message})
    }

}


export const autocompleteReasons = async  (req, res)=>{
    try{
        const queryParam = req.query.for ? {for : req.query.for} : {}
        const reasons = await modelReason.find(queryParam)
        res.status(200).json(reasons)
    }
    catch (erreur){
        res.status(500).json({title : "Erreur est survenue", message : erreur.message})
    }

}

export const autocompleteSeverity= async  (req, res)=>{
    try{
        const severity = await modelSeverity.find({})
        res.status(200).json(severity)
    }
    catch (erreur){
        res.status(500).json({title : "Erreur est survenue", message : erreur.message})
    }

}

export const newReason = async  (req, res)=>{
    try{
        const newReason : Reason = await new modelReason(req.body).save()
        res.status(200).json({title : "Ajout effectué", data : newReason})
    }
    catch (erreur){
        res.status(500).json({title : "Erreur est survenue", message : erreur.message})
    }

}
