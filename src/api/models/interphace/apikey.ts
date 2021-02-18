export interface Apikey{
  user_owner : string
  mail? : string
  key : string
  limit : number
  remaining : number
  dateReflow : Date
  used : boolean
}
