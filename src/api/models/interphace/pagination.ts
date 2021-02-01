export interface Paginate {limit : number, skip : number}

export interface MongoPaginate extends Paginate{
  match? : Object
  sort? : Object
  project? : Object
  lookups? : Array<Object>,
  addFields? : Object
}

export interface MongoPaginatev2 extends Paginate{
  aggregate : Array<Record<string,Object>>
  facet : Array<Record<string,Object>>
}
