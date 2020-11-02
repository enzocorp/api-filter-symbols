import {Model} from "mongoose";

export class RequesterMongo {

  test : Promise<any>
  model : Model<any>
  constructor(model : Model<any>) {
    this.model = model
  }

  private async notraw(request: Object&any) : Promise<{data : any[],metadata?:any}> {
    const {skip = 0,limit = Infinity,...rawReq}  = request
    const facet = {$facet : {
        metadata: [ { $count: "total" }],
        data: [{ $skip: skip}, { $limit: limit }]
      }}
    let aggregate : Object[] = []
    if(rawReq){
      const len : number = Object.keys(rawReq).length
      for (let key in rawReq ){
        if(isNaN(+key))
          throw `La requête est mauvaise car une des clés n'est pas un nombre (${key})`
        if( +key > len-1)
          throw `La requête est mauvaise car l'index de la clé(${key}) est supérieur a la taille du tableau -1 (${len-1})`
        aggregate[+key] = rawReq[+key]
      }
    }
    if(aggregate.includes(undefined))
      throw "La requête est mauvaise car le tableau d'aggrégation possède un Trou de vide OU un champ indéfini ! "

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
