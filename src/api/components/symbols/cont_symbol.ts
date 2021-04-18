import modelSymbol from "../../models/mongoose/model.symbol";
import {RequesterMongo} from "../../../services/requesterMongo";
import {END_GRAPH, PAS_GRAPH, START_GRAPH} from "../bests/config_bests";
import {SymbolFor} from "../../models/interphace/symbol";


export const get_symbols = async  (req,res,next)=>{
    try{
        const requester = new RequesterMongo(modelSymbol)
        const content :{data : any,metadata? : any} = await requester.make(req.query.request)
        res.status(200).json(content)
    }
    catch (error){
        return  next(error)
    }
}



export const get_symbol = async (req,res,next)=> {
    try {
        const data = await modelSymbol.findOne({name : req.params.name})
        res.status(200).json({data})
    }
    catch (error){
        return  next(error)
    }
}

export const reset_moyennes_symbols = async  (req,res,next)=>{
    try {
        const side : SymbolFor['buy' | 'sell'] = {
            bestMarketFreq : 0,
            okFreq : 0,
            notDataFreq : 0,
            notEnoughVolFreq : 0,
            prixMoyen_quote :null
        }

        let isfor = {}
        for (let i = START_GRAPH; i <= END_GRAPH; i += PAS_GRAPH){
            isfor[i] = {
                buy : side,
                sell : side,
            }
        }

        const dataUpdated = await modelSymbol.updateMany(
          {'exclusion.isExclude' : false},
          {$set : {
                  isfor : isfor,
              }},
        )
        res.status(200).json({title : 'Les symbols ont été resets',data : dataUpdated})
    }
    catch (error){
        return  next(error)
    }
}

export const group_symbols_unreport = async  (req,res,next)=>{
    try{
        const names : string[] = req.body.data
        const bulkSymbol = names.map(name => ({
            updateOne: {
                filter: { name : name },
                update: { $set: {
                        exclusion : {
                            isExclude : false,
                            reasons : [],
                            severity : 0,
                            excludeBy : null,
                            note : null
                        }},
                },
                option : {upsert: false}
            }}));

        const resp = await modelSymbol.collection.bulkWrite(bulkSymbol)
        res.status(200).json({title : 'Les symboles ont été blanchies',data : resp})
    }
    catch (error){
        return  next(error)
    }
}

export const group_symbols_report = async  (req,res,next)=>{
    try {
        const {symbols: names, ...data} = req.body.data
        const bulkSymbols = names.map(name => ({
            updateOne: {
                filter: {name: name},
                update: {
                    $set: {
                        exclusion: {
                            isExclude: data.severity === 4,
                            reasons: data.reasons,
                            severity: data.severity,
                            excludeBy: 'unknow',
                            note: data.note || null,
                            date : new Date()
                        }
                    },
                },
                option: {upsert: false}
            }
        }));

        const resp = await modelSymbol.collection.bulkWrite(bulkSymbols)
        res.status(200).json({title: 'Les symboles ont bien été signalés', data: resp})
    }
    catch (error){
        return  next(error)
    }
}
