const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const schema = require('./schema/schema')
const mongoose = require('mongoose')
const app = express()
const PORT = process.env.PORT || 4000

// allow cors
app.use(cors())

app.use(morgan('dev'))

app.use(express.json({ limit: '50mb', type: 'application/json' }))
app.use(
  express.urlencoded({
    limit: '50mb',
    type: 'application/x-www-form-urlencoded',
    extended: true
  })
)

// connect to graphql
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true
  })
)

// Connect DB
mongoose
  .connect(process.env.ATLAS_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('mongoDB is connected'))
  .then(
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`)
    })
  )
  .catch((err) => console.log(err))
