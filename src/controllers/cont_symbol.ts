import modelSymbol from "../models/mongoose/model.symbol";
import {RequesterMongo} from "../script/mongo_requester/requesterMongo";


export const get_symbols = async  (req, res)=>{
    try{
        const requester = new RequesterMongo(modelSymbol)
        const content :{data : any,metadata? : any} = await requester.make(req.query.request)
        res.status(200).json(content)
    }
    catch (err){
        console.log(err)
        res.status(404).json({title : "Une erreur est survenue", message : err.message})
    }
}



export const get_symbol = async (req,res)=> {
    try {
        const data = await modelSymbol.findOne({name : req.params.name})
        res.status(200).json({data})
    }
    catch (err){
        res.status(404).json({title : "Une erreur est survenue", message : err.message})

    }
}

export const group_symbols_unreport = async  (req, res)=>{
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
    catch (erreur){
        res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
    }
}

export const group_symbols_report = async  (req, res)=> {
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
                            note: data.note || null
                        }
                    },
                },
                option: {upsert: false}
            }
        }));

        const resp = await modelSymbol.collection.bulkWrite(bulkSymbols)
        res.status(200).json({title: 'Les symboles ont bien été signalés', data: resp})
    } catch (erreur) {
        res.status(500).json({title: "Une erreur s'est produite", message: erreur.message})
    }
}
