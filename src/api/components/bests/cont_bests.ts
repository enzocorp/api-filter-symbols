import programmeBests from "./services/calculBests/index.calcul-sync";
import modelPair from "../../models/mongoose/model.pair";
import modelBest from "../../models/mongoose/model.best";
import modelSymbol from "../../models/mongoose/model.symbol";
import {RequesterMongo} from "../../../services/requesterMongo";
import {Best} from "../../models/interphace/best";
import {log} from "util";

export const get_bests = async  (req, res)=>{
    try{
        const requester = new RequesterMongo(modelBest)
        const content :{data : any,metadata? : any} = await requester.make(req.query.request)
        res.status(200).json(content)
    }
    catch (err){
        res.status(404).json({title : "Une erreur est survenue", message : err.message || err})
    }
}

export const get_best = async  (req,res)=>{
    try {
        const best = await modelBest.findOne({_id : req.params.id})
        res.status(200).json({data : best})
    }catch (err){
        res.status(404).json({title : "Une erreur est survenue", message : err.message})
    }

}


export const get_last_groupId = async  (req, res)=>{
    try{
        const best : Best[] = await modelBest.find().sort('-_id').limit(1)
        res.status(200).json({data : best[0]?.groupId})
    }
    catch (err){
        res.status(404).json({title : "Une erreur est survenue", message : err.message})
    }
}

export const calcul_bests = async  (req,res)=>{
    try{
        let {positivesBests,pairs,symbols} = await programmeBests()

        const tab : ['for1k','for15k','for30k'] = ['for1k','for15k','for30k']
        positivesBests.forEach(best => {
            tab.forEach(isFor => {
                let indexBuy : number = symbols.findIndex(symb => symb.name === best[isFor].buy.symbol)
                let indexSell : number= symbols.findIndex(symb => symb.name === best[isFor].sell.symbol)
                if ( best[isFor].buy.price_quote)
                    symbols[indexBuy][isFor].buy.bestMarketFreq = symbols[indexBuy][isFor].buy.bestMarketFreq + 1
                if ( best[isFor].sell.price_quote)
                    symbols[indexSell][isFor].sell.bestMarketFreq = symbols[indexBuy][isFor].sell.bestMarketFreq + 1
            })
        })
        const bulkPairs = pairs.map(pair => ({
            updateOne: {
                filter: { name : pair.name },
                update: { $set: pair },
            }
        }));

        const bulkSymbols = symbols.map(symbol => ({
            updateOne: {
                filter: { name : symbol.name },
                update: { $set: symbol },
            }
        }));
        const [updtPairs,bests,updtSymbs] = await Promise.all([
            modelPair.collection.bulkWrite(bulkPairs),
            modelBest.insertMany(positivesBests),
            modelSymbol.collection.bulkWrite(bulkSymbols)
        ])
        console.log('calcul fini avec succes')
        res.status(200).json({title : "Calcul effectué avec succès",data : bests, metadata : {pairs : updtPairs, symbols : updtSymbs}})
    }
    catch (erreur){
        console.log(erreur)
        res.status(404).json({title : "Une erreur est survenue pendant le calcul", message : erreur.message ||erreur})
    }

}


export const reset_bests = async  (req,res)=>{
    try{
        await modelBest.remove({})
        res.status(200).json({title : "Succès : Suppression de l'historique effectuée"})
    }catch(err){
        res.status(404).json({title : "Une erreur est survenue", message : err.message})
    }
}
