import {Model} from "mongoose";

export class RequesterMongo {

  test : Promise<any>
  model : Model<any>
  constructor(model : Model<any>) {
    this.model = model
  }

  private async notraw(request: Object&any) : Promise<{data : any[],metadata?:any}> {
    const {skip = 0,limit = Infinity,...req}  = request
    let bool = true
    const facet = {$facet : {
        metadata: [ { $count: "total" }],
        data: [{ $skip: skip}, { $limit: limit }]
      }}
    let aggregate : Object[] = []
    if(req){
      const len : number = Object.keys(req).length
      for (let key in req ){
        if(isNaN(+key))
          throw `La requête est mauvaise car une des clés n'est pas un nombre (${key})`
        else if( +key > len-1)
          throw `La requête est mauvaise car l'index de la clé(${key}) est supérieur a la taille du tableau ( 0 --> ${len-1})`
        else{
          aggregate[+key] = req[+key]
          if (typeof req[+key] === 'object' && '$facet' in req[+key])
            bool = false
        }
      }
    }
    if(aggregate.includes(undefined))
      throw "La requête est mauvaise car le tableau d'aggrégation possède un Trou de vide OU un champ indéfini ! "

    if(bool)
      aggregate.push(facet,{$unwind : "$metadata"})
    const [result] = await this.model.aggregate(aggregate)
    return result
  }

  private async raw(request: any[]) : Promise<{data : any[]}> {
    const result = await this.model.aggregate(request)
    return {data : result}
  }

  async make(rawReq : string){
    const req = JSON.parse(rawReq) || []
    if (Array.isArray(req))
      return await this.raw(req)
    else
      return this.notraw(req)
  }
}
