import modelGlobal from "../models/mongoose/model.global";

export async function saveCoinapiLimitSucces (resp) {
  if (resp.headers['x-ratelimit-used'])
    await modelGlobal.updateOne(
      {name : 'coinapi'},
      {
        name : 'coinapi',
        limit : resp.headers['x-ratelimit-limit'],
        remaining : resp.headers['x-ratelimit-remaining'],
        dateReflow : resp.headers['x-ratelimit-reset']
      },
      { upsert : true})
  return resp;
}

export async function saveCoinapiLimitError (error) {
  const {response} = error
  if (response.headers['x-ratelimit-used'])
    await modelGlobal.updateOne(
      {name : 'coinapi'},
      {
        name : 'coinapi',
        limit : response.headers['x-ratelimit-limit'],
        remaining : response.headers['x-ratelimit-remaining'],
        dateReflow : response.headers['x-ratelimit-reset']
      },
      { upsert : true})
  return error;
}
