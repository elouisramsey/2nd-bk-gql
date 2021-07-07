const promisesAll = require('promises-all')
const { GraphQLUpload } = require('graphql-upload')
const graphql = require('graphql')
const Product = require('../models/product')
const Seller = require('../models/user')

const cloudinary = require('cloudinary')
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLError
} = graphql

const HouseHoldItemType = new GraphQLObjectType({
  // name of type
  name: 'Item',
  fields: () => ({
    id: { type: GraphQLID },
    category: { type: GraphQLString },
    description: { type: GraphQLString },
    nameofitem: { type: GraphQLString },
    color: { type: GraphQLString },
    phone: { type: GraphQLString },
    files: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(GraphQLString))
      )
    },
    address: { type: GraphQLString },
    price: { type: GraphQLInt },
    seller: {
      // connect item to the seller
      type: SellerType,
      resolve(parent, args) {
        // return _.find(sellers, { id: parent.sellerId })
        return Seller.findById(parent.sellerId)
      }
    }
  })
})

const SellerType = new GraphQLObjectType({
  // name of type
  name: 'Seller',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    state: { type: GraphQLString },
    itemsSold: {
      type: new GraphQLList(HouseHoldItemType),
      resolve(parent, args) {
        // return _.filter(furnitures, { sellerId: parent.id })
        return Product.find({ sellerId: parent.id })
      }
    }
  })
})

// how a user can get data from the database
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    item: {
      type: HouseHoldItemType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        //   used to get data from db
        // return _.find(furnitures, { id: args.id })
        return Product.findById(args.id)
      }
    },
    seller: {
      type: SellerType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        //   used to get data from db
        // return _.find(sellers, { id: args.id })
        return Seller.findById(args.id)
      }
    },
    allItems: {
      type: new GraphQLList(HouseHoldItemType),
      resolve(parent, args) {
        // return furnitures
        return Product.find({})
      }
    },
    allSellers: {
      type: new GraphQLList(SellerType),
      resolve(parent, args) {
        return Seller.find({})
      }
    }
  }
})

// mutations
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Mutations for adding of items and sellers', // the description field is optional
  fields: {
    //   mutation for adding seller
    addSeller: {
      type: SellerType,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString)
        },
        email: {
          type: new GraphQLNonNull(GraphQLString)
        },
        state: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve(parent, args) {
        const seller = new Seller({
          name: args.name,
          email: args.email,
          state: args.state
        })
        return seller.save()
      }
    },
    // mutation for adding items for sell
    addItem: {
      type: HouseHoldItemType,
      args: {
        category: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
        nameofitem: { type: new GraphQLNonNull(GraphQLString) },
        color: { type: new GraphQLNonNull(GraphQLString) },
        phone: { type: new GraphQLNonNull(GraphQLString) },
        address: { type: new GraphQLNonNull(GraphQLString) },
        price: { type: new GraphQLNonNull(GraphQLInt) },
        sellerId: { type: new GraphQLNonNull(GraphQLID) },
        files: {
          type: new GraphQLNonNull(
            new GraphQLList(new GraphQLNonNull(GraphQLString))
          )
        }
      },
      async resolve(parent, args) {
        const {
          category,
          description,
          nameofitem,
          color,
          phone,
          address,
          price,
          sellerId,
          files
        } = args
        const images = await Promise.all(files)
        const fileUrls = []

        function createUploader() {
          return cloudinary.uploader.upload_stream(
            { folder: 'ifeejigoro files' },
            (err, result) => {
              console.log('err:', err)
              console.log('result:', result)
              if (err) throw err
              fileUrls.push({
                url: result.secure_url,
                public_id: result.public_id,
                file_type: result.metadata
              })
              console.log(result)
              return result
            }
          )
        }

        await Promise.all(
          images.map(async (file) => await file.stream.pipe(createUploader()))
        )

        const item = new Product({
          category,
          description,
          nameofitem,
          color,
          phone,
          address,
          price,
          sellerId
        })
        item.files = fileUrls
        const savedProduct = await item.save()
        return savedProduct
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})
