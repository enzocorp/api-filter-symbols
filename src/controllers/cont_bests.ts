import makeBests from "../script/crypto/calcul_bests";
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
        let {bests,updatedPairs,updatedAverages} = await makeBests()


        const bulkOpsPairs = updatedPairs.map(pair => ({
            updateOne: {
                filter: { name : pair.name },
                update: { $set: pair },
            }
        }));

        const bulkOpsAverage = updatedAverages.map(average => ({
            updateOne: {
                filter: { pair : average.pair, exchange : average.market },
                update: { $set: average },
                upsert: true
            }
        }));

        let [resPairs,resDocs,resAverage] = await Promise.all([
            modelPair.collection.bulkWrite(bulkOpsPairs),
            modelBest.insertMany(bests),
            modelSymbol.bulkWrite(bulkOpsAverage)
        ])
        res.json({message : 'La base à été mise a jour',resPairs,data : resDocs[0].groupId,resAverage})
    }
    catch (erreur){
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
