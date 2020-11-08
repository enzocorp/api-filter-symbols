import findMarkets from "../script/initialisation/findMarkets";
import findAssets from "../script/initialisation/findAssets";
import makeInitPairs from "../script/initialisation/makePairs";
import modelPair from "../models/mongoose/model.pair";
import modelMarket from "../models/mongoose/model.market";
import modelGlobal from "../models/mongoose/model.global";
import modelReason from "../models/mongoose/model.reason";
import modelSeverity from "../models/mongoose/model.severity";
import {Reason} from "../models/interphace/reason";
import findSymbols from "../script/initialisation/findSymbols";
import modelSymbol from "../models/mongoose/model.symbol";
import modelAsset from "../models/mongoose/model.asset";
import doubleFilter from "../script/initialisation/doubleFilter";
import {Pair} from "../models/interphace/pair";
import {Asset} from "../models/interphace/asset";
import patchMiss from "../script/initialisation/patchMissing";
import {Market} from "../models/interphace/market";
import calculQties from "../script/initialisation/calculQties";

export const init_app = async  (req, res)=>{
    try{
        let [tempMarkets,tempAssets] = await Promise.all([
            findMarkets(),
            findAssets()
        ])
        let symbols = await findSymbols(tempMarkets,tempAssets)
        let [missAssets,missMarkets] = await patchMiss(tempMarkets,tempAssets,symbols)

        let [[assets,markets],pairs] : [[Asset[],Market[]],Pair[]] = await Promise.all([
            doubleFilter(symbols,tempAssets.concat(missAssets),tempMarkets.concat(missMarkets)),
            makeInitPairs(symbols)
        ])
        const createBulk = async (items : Array<{name : string} & any>) => items.map(item => ({
            updateOne: {
                filter: { name : item.name },
                update: { $setOnInsert: {...item} },
                upsert: true
            }
        })); //Seul les INSERTION seront traitées grace au "$setOnInsert"!

        const [bulkOpsPairs,bulkOpsMarkets,bulkOpsAssets,bulkOpsSymbols] = await Promise.all([
            createBulk(pairs),
            createBulk(markets),
            createBulk(assets),
            createBulk(symbols)
        ])
        const [resPairs,resMarkets,resSymbols,resAssets] = await Promise.all([
            modelPair.collection.bulkWrite(bulkOpsPairs),
            modelMarket.collection.bulkWrite(bulkOpsMarkets),
            modelSymbol.collection.bulkWrite(bulkOpsSymbols),
            modelAsset.collection.bulkWrite(bulkOpsAssets),
        ])

        await calculQties()
        res.status(200).json({title : 'Initialisation effectuée avec succès',data : {resPairs, resMarkets,resSymbols,resAssets}})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur lors de l'init est survenue", message : erreur.message})
    }

}

export const get_coinapi = async  (req, res)=>{
    try{
        res.status(200).json({title : "Les infos de requêtes ont étés mises a jours"})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur lors de l'init est survenue", message : erreur.message})
    }

}


export const autocompleteReasons = async  (req, res)=>{
    try{
        const queryParam = req.query.for ? {for : req.query.for} : {}
        const reasons = await modelReason.find(queryParam)
        res.status(200).json({data : reasons})
    }
    catch (erreur){
        res.status(500).json({title : "Erreur est survenue", message : erreur.message})
    }

}

export const autocompleteSeverity= async  (req, res)=>{
    try{
        const severity = await modelSeverity.find({})
        res.status(200).json({data : severity})
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
