import {MongoPaginate, MongoPaginatev2} from "../../models/interphace/pagination";

export class RequesterMongo {

  constructor() {
  }

  v1(query : MongoPaginate | Object = {}) : Array<any>{
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
    return aggregate
  }

  v2(query : MongoPaginatev2 | Object = {},limit = Infinity ,skip = 0){
    let aggregate : Array<any> = []
    const dataFacet : Array<any> = [{ $skip: skip}, { $limit: limit }]

    if("aggregate" in query)
      aggregate = query.aggregate
    if("facet" in query){
      dataFacet.push(...query.facet)
    }
    aggregate.push({$facet : {
        metadata: [ { $count: "total" }],
        data: dataFacet
      }})
    return aggregate
  }
}
