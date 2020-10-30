import programmeBests from "../script/calculBests/index.calcul";
import modelPair from "../models/mongoose/model.pair";
import modelBest from "../models/mongoose/model.best";
import {MongoPaginate} from "../models/interphace/pagination";
import modelSymbol from "../models/mongoose/model.symbol";

export const get_bests = async  (req, res)=>{
    try{
        const query : MongoPaginate = JSON.parse(req.query.filters)
        const obj : MongoPaginate = {
            limit : Infinity,
            match : {},
            sort : {_id: 1},
            skip : 0,
            ...query
        }
        const __makedata : Array<any> = [{ $skip: obj.skip }, { $limit: obj.limit }]
        if (obj.project)
            __makedata.push(obj.project)
        const aggregate : Array<any> = [
            { $match : obj.match  },
            { $sort : obj.sort },
            { $facet : {
                metadata: [ { $count: "total" }],
                data: __makedata
            }}
        ]
        if (obj.addFields)
            aggregate.splice(1, 0, {$addFields : obj.addFields})
        if (obj.lookups){
            obj.lookups.forEach((lookup,i)=>{
                aggregate.splice(i + 1, 0, {$lookup : lookup})
            })
        }
        const [data]  = await modelBest.aggregate(aggregate)

        res.status(200).json(data)
    }
    catch (err){
        res.status(404).json({title : "Une erreur est survenue", message : err.message})
    }
}

export const calcul_bests = async  (req,res)=>{
    try{
        let {bests,pairs,symbols} = await programmeBests()

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

        const afterUpdate = await Promise.all([
            modelPair.collection.bulkWrite(bulkPairs),
            modelBest.insertMany(bests),
            modelSymbol.collection.bulkWrite(bulkSymbols)
        ])
        res.status(200).json({title : 'La base à été mise a jour',data : afterUpdate})
    }
    catch (erreur){
        console.log(erreur)
        res.status(404).json({title : "Une erreur est survenue", message : erreur.message})
    }

}

export const get_best = async  (req,res)=>{
    modelBest.findOne({_id : req.params.id})
      .then(result => {
          res.status(200).json(result)
      })
      .catch(err=>{
          res.status(404).json({title : "Une erreur est survenue", message : err.message})
      })
}

export const reset_bests = async  (req,res)=>{
    try{
        await modelBest.remove({})
        res.status(200).json({title : "Suppression effectuée"})
    }catch(err){
        res.status(404).json({title : "Une erreur est survenue", message : err.message})
    }
}
