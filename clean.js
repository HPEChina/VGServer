const db = require('./router/collection').db
db.collection('files').truncate()
db.collection('modelsData').truncate()
db.collection('viewer').truncate()
db.collection('toposData').truncate()
db.query(`for d in model
filter d.class!='general'
remove d in model`)
db.query(`for d in modelClass
filter d.name!='general'
remove d in modelClass`)
if (process.env.NODE_SERVE) {
  console.log('Run the command self:\n', `cd ${process.env.NODE_SERVE}/data&&rm -rf */*&&cd -`)
}
