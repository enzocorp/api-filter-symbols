import getMarkets from "./services/initialisation/getMarkets";
import getAsssets from "./services/initialisation/getAsssets";
import buildPairs from "./services/initialisation/buildPairs";
import modelPair from "../../models/mongoose/model.pair";
import modelMarket from "../../models/mongoose/model.market";
import modelReason from "../../models/mongoose/model.reason";
import modelSeverity from "../../models/mongoose/model.severity";
import {Reason} from "../../models/interphace/reason";
import getSymbols from "./services/initialisation/getSymbols";
import modelSymbol from "../../models/mongoose/model.symbol";
import modelAsset from "../../models/mongoose/model.asset";
import finalFilters from "./services/initialisation/finalFilters";
import {Asset} from "../../models/interphace/asset";
import patchMiss from "./services/initialisation/patchMissing";
import {Market} from "../../models/interphace/market";
import calculQties from "./services/initialisation/calculQties";
import ErrorsGenerator from "../../../services/ErrorsGenerator";
import {StatusCodes} from "http-status-codes";
import {Symbol} from "../../models/interphace/symbol";
import {Apikey} from "../../models/interphace/apikey";
import modelApikey from "../../models/mongoose/model.apikey";
import verifyCoinapiKey from "./services/apikey/verifyCoinapiKey";
import axios from "axios";
import {coinapi_key} from "../../../config/apikey";

export const init_app = async  (req,res,next)=>{
    try{
        //On recupere les asset et les market pour construire nos symboles
        let assetsGetted : Asset[] = await getAsssets()
        let marketsGetted : Market[] = await getMarkets()
        //On recupere les sumboles grace aux assets et aux markets
        let symbolsGetted : Symbol[] = await getSymbols(marketsGetted,assetsGetted)
        //On esseye de recuperer les markets et assets manquant dans les symboles
        let [missAssets,missMarkets] = await patchMiss(marketsGetted,assetsGetted,symbolsGetted)
        assetsGetted.push(...missAssets)
        marketsGetted.push(...missMarkets)

        const {markets,assets, symbols} = await finalFilters(symbolsGetted,assetsGetted,marketsGetted )
        const pairs = await buildPairs(symbols)

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
        let apikey : Apikey = await modelApikey.findOne({used : true})
        if (!apikey) throw new ErrorsGenerator(
              "Clée d'api manquante",
              "La base de donnée ne contient aucune clés d'api",
              StatusCodes.NOT_FOUND
            )
        if (apikey.dateReflow.getTime() < Date.now())
            apikey = {...apikey, dateReflow : apikey.dateReflow, remaining : apikey.limit, limit : apikey.limit}

        res.status(200).json({title : "Les infos de CoinAPI ont été récup de la base de donnée",coinapi : apikey})
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

export const getall_apikeys = async  (req, res, next)=> {
    try{
        const apikeys : Apikey[] = await modelApikey.find({})
        res.status(200).json({data : apikeys})
    }
    catch (error){
        return next(error)
    }
}

export const add_apikey = async  (req, res, next)=> {
    try{
        const key = req?.body?.key ? req.body.key.trim() : null
        const data = await verifyCoinapiKey(key)
        const apikey : Apikey = {
            ...req.body,
            key : key,
            user_owner : 'unknow',
            limit : +data.limit,
            remaining : +data.remaining,
            dateReflow : data.dateReflow,
            used : false,

        }
        const newkey : Apikey = await new modelApikey(apikey).save()
        res.status(200).json({title : "Ajout effectué", data : newkey})
    }
    catch (error){
        return next(error)
    }
}

export const choose_apikey = async  (req, res, next)=> {
    try{
        const key = req.params.key
        let newChoice = await modelApikey.findOneAndUpdate({key : key}, {used : true})
        if (newChoice){
            axios.defaults.headers.common['X-CoinAPI-Key'] = newChoice.key
            await modelApikey.updateOne({used : true,key : {$ne : newChoice.key}}, {used : false})
            res.status(200).json({title : "Modifications effectuées"})
        }else  {
            throw "Erreur de clés"
        }
    }
    catch (error){
        return next(error)
    }
}

export const delete_apikey = async  (req,res,next)=> {
    try{
        await modelApikey.deleteOne({key : req.params.key})
        axios.defaults.headers.common['X-CoinAPI-Key'] = await coinapi_key()
        res.status(200).json({title : "Suppression effectué"})
    }
    catch (error){
        return next(error)
    }
}
