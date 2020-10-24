import modelPair from "../models/mongoose/model.pair";
import {
    addExclusion,
    deleteExclusion,
    editExclusion,
    editExclusionGroup,
    removeExclusionGroup
} from "../script/exclusion/exclude_pair";
import {Pair} from "../models/interphace/pair";
import modelExchange from "../models/mongoose/model.exchange";
import modelSeverity from "../models/mongoose/model.severity";
import modelReason from "../models/mongoose/model.reason";
import {Reason} from "../models/interphace/reason";



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

export const group_pair_unreport = async  (req, res)=>{
    try{
        const listName : string[] = req.body.list
        const pairs : Pair[] = await modelPair.find({name : {$in : listName}})
        let exclusions = removeExclusionGroup(pairs)
        const bulkOpsPairs = listName.map((name,i) => ({
            updateOne: {
                filter: { name : name },
                update: { $set: {exclusion : exclusions[i]}},
                option : {upsert: false}
            }}));

        const resp = await modelPair.collection.bulkWrite(bulkOpsPairs)
        res.status(200).json({title : 'Les paires ont bien été blanchies',data : resp})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
    }
}

export const group_pair_report = async  (req, res)=>{
    try{
        const listName : string[] = req.body.list
        const data = req.body.data
        const pairs : Pair[] = await modelPair.find({name : {$in : listName}})
        let exclusions = editExclusionGroup(pairs, data)
        const bulkOpsPairs = listName.map((name,i) => ({
            updateOne: {
                filter: { name : name },
                update: { $set: {exclusion : exclusions[i]}},
                option : {upsert: false}
            }}));

        const resp = await modelPair.collection.bulkWrite(bulkOpsPairs)
        res.status(200).json({title : 'Les paires ont bien été signalées',data : resp})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
    }
}

export const group_market_unreport = async  (req, res)=>{
    try{
        const namesExchanges : string[] = req.body.list
        console.log(namesExchanges)
        const bulkOpsExchanges = namesExchanges.map(name => ({
            updateOne: {
                filter: { id_exchange : name },
                update: { $set: {
                        exclusion : {
                            exchangeIsExclude : false,
                            reasons : [],
                            severity : null,
                            excludeBy : null,
                            note : null
                        }},
                },
                option : {upsert: false}
            }}));

        const resp = await modelExchange.collection.bulkWrite(bulkOpsExchanges)
        res.status(200).json({title : 'Les markets ont été blanchis',data : resp})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
    }
}

export const group_market_report = async  (req, res)=>{
    try{
        const namesExchanges : string[] = req.body.list
        const data = req.body.data
        const bulkOpsExchanges = namesExchanges.map(name => ({
            updateOne: {
                filter: { id_exchange : name },
                update: { $set: {
                        exclusion : {
                            exchangeIsExclude : data.severity === 4,
                            reasons : data.reasons,
                            severity : data.severity,
                            excludeBy : 'unknow',
                            note : data.note || ''
                        }},
                },
                option : {upsert: false}
            }}));

        const resp = await modelExchange.collection.bulkWrite(bulkOpsExchanges)
        res.status(200).json({title : 'Les markets ont bien été signalés',data : resp})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
    }
}


export const addExclusion_pair = async  (req, res)=>{
    try{
        let pair : Pair = await modelPair.findOne({name : req.params.name }).lean()
        let exclusion = addExclusion(pair, req.body)
        const updatedDoc = await  modelPair.findOneAndUpdate(
          {name : req.params.name},{$set : {exclusion} }, {new: true}
        )
        res.status(200).json(updatedDoc)
    }
    catch (erreur){
        res.status(500).json({title : "Erreur lors de l'exclusions d'une pair", message : erreur.message})
    }

}

export const updateExclusions_pair = async  (req, res)=>{
    try{
        let pair : Pair = await modelPair.findOne({name : req.params.name }).lean()
        let exclusion = editExclusion(pair, req.body)
        const updatedDoc = await  modelPair.findOneAndUpdate(
          {name : req.params.name},
          {$set : {exclusion }},
          {new: true})
        res.status(200).json(updatedDoc)
    }
    catch (erreur){
        res.status(500).json({title : "Erreur lors de l'update du ban", message : erreur.message})
    }

}

export const deleteExclusion_pair = async  (req, res)=>{
    try{
        let pair : Pair = await modelPair.findOne({name : req.params.name }).lean()
        let exclusion = deleteExclusion(pair, req.query.market)
        const updatedDoc = await modelPair.findOneAndUpdate(
          {name : req.params.name},
          {$set : {exclusion}},
          {new: true})
        res.status(200).json(updatedDoc)
    }
    catch (erreur){
        res.status(500).json({title : "Erreur lors du debanissement d'un asset", message : erreur.message})
    }

}

interface req_bodyExchange {
    reasons : string[]
    severity : number
    note? : string
}


export const updateExclusion_exchange = async  (req, res)=>{
    try{
        let {body} : {body : req_bodyExchange} = req
        const updatedDoc = await modelExchange.findOneAndUpdate(
          {id_exchange : req.params.id },
          {$set : {
                exclusion : {
                    exchangeIsExclude : body.severity === 4,
                    reasons : body.reasons,
                    severity : body.severity,
                    excludeBy : 'unknown',
                    note : body.note ? body.note : null,
                    date : new Date()
                }
          }},
          {new: true})
        res.status(200).json(updatedDoc)
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
    }

}

export const deleteExclusion_exchange = async  (req, res)=>{
    try{
        const updatedDoc = await modelExchange.findOneAndUpdate(
          {id_exchange : req.params.id },
          {$set : {
                exclusion : {
                    exchangeIsExclude : false,
                    reasons : [],
                    severity : null,
                    excludeBy : null,
                    note : null
                }
            }},
          {new: true})
        res.status(200).json(updatedDoc)
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
    }

}
