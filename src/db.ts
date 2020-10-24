import {connect} from 'mongoose'

export function dbConnexion(){
  const {
    MONGO_PORT,
    MONGO_DB,
    MONGO_HOSTNAME,
  } = process.env

  const options = {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true ,
    useFindAndModify: false
  }
  const url = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}`

  connect(url,options).then(()=>{
    console.log('MA BASE MONGO EST CONNECTE ET ECOUTE SUR : ',url)
  })
    .catch((err)=>{
      console.log('IL Y A UNE UNE ERREUR DE BASE DE DONNE !! : ',err)
    })
}
