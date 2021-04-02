import {connect} from 'mongoose'

export function dbConnexion(){
  const {
    MONGO_PORT,
    MONGO_DB,
    MONGO_DB_DEV,
    MONGO_HOSTNAME,
    MONGO_INITDB_USERNAME : user,
    MONGO_INITDB_PASSWORD : pwd,
    MONGO_URI
  } = process.env

  const options = {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true ,
    useFindAndModify: false
  }
  let url : string
  if(process.env.NODE_ENV === 'development')
    url = `mongodb://${user}:${pwd}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB_DEV}?authSource=${MONGO_DB}`
  else if(process.env.NODE_ENV === 'production')
    url = `mongodb+srv://${user}:${pwd}@${MONGO_URI}/${MONGO_DB}?retryWrites=true&w=majority`
  else
    url = `mongodb://${user}:${pwd}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}`

  connect(url,options)
    .then(()=>{
    console.log('BDD MONGO EST CONNECTE SUR : ',url)
  })
    .catch((err)=>{
      console.log('IL Y A UNE UNE ERREUR DE BASE DE DONNE !! : ',`\n L'url DB : ${url}`,`\nl'erreur est : \n`,err)
    })
}
