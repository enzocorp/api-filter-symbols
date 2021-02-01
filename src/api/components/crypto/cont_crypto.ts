import findMarkets from "./initialisation/findMarkets";
import findAssets from "./initialisation/findAssets";
import makeInitPairs from "./initialisation/makePairs";
import modelPair from "../../models/mongoose/model.pair";
import modelMarket from "../../models/mongoose/model.market";
import modelReason from "../../models/mongoose/model.reason";
import modelSeverity from "../../models/mongoose/model.severity";
import {Reason} from "../../models/interphace/reason";
import findSymbols from "./initialisation/findSymbols";
import modelSymbol from "../../models/mongoose/model.symbol";
import modelAsset from "../../models/mongoose/model.asset";
import filterAssetsMarkets from "./initialisation/filterAssetsMarkets";
import {Pair} from "../../models/interphace/pair";
import {Asset} from "../../models/interphace/asset";
import patchMiss from "./initialisation/patchMissing";
import {Market} from "../../models/interphace/market";
import calculQties from "./initialisation/calculQties";
import modelGlobal from "../../models/mongoose/model.global";
import {Global} from "../../models/interphace/global";
import ErrorsGenerator from "../../../services/ErrorsGenerator";
import {StatusCodes} from "http-status-codes";

export const init_app = async  (req,res,next)=>{
    try{
        let tempAssets = await findAssets()
        console.log("markets ok")
        let tempMarkets = await findMarkets()


        let symbols = await findSymbols(tempMarkets,tempAssets)
        let [missAssets,missMarkets] = await patchMiss(tempMarkets,tempAssets,symbols)

        let [[assets,markets],pairs] : [[Asset[],Market[]],Pair[]] = await Promise.all([
            filterAssetsMarkets(symbols,tempAssets.concat(missAssets),tempMarkets.concat(missMarkets)),
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
    catch (error){
        return next(error)
    }

}

export const get_coinapi = async  (req,res,next)=>{
    try{
        const coinapi : Global['coinapi'] = await modelGlobal.findOne({name :'coinapi'}).lean()
        if (!coinapi)
            throw new ErrorsGenerator("Pas de données","La base de donnée n'as pas d'infos sur les res CoinAPI restantes",StatusCodes.NOT_FOUND)
        const verifyDate = (coin_api) => {
            if (Date.parse(coin_api.dateReflow) < Date.now())
                return {dateReflow : coin_api.dateReflow, remaining : '100', limit : '100'}
            else
                return coin_api
        }
        const infos = verifyDate(coinapi)
          res.status(200).json({title : "Les infos de CoinAPI ont été récup de la base de donnée",coinapi : infos})
    }
    catch (error){
        return next(error)
    }

}


export const autocompleteReasons = async  (req,res,next)=>{
    try{
        const queryParam = req.query.for ? {for : req.query.for} : {}
        const reasons = await modelReason.find(queryParam)
        res.status(200).json({data : reasons})
    }
    catch (error){
        return next(error)
    }

}

export const autocompleteSeverity= async  (req,res,next)=>{
    try{
        const severity = await modelSeverity.find({})
        res.status(200).json({data : severity})
    }
    catch (error){
        return next(error)
    }

}

export const newReason = async  (req,res,next)=>{
    try{
        const newReason : Reason = await new modelReason(req.body).save()
        res.status(200).json({title : "Ajout effectué", data : newReason})
    }
    catch (error){
        return next(error)
    }

}
