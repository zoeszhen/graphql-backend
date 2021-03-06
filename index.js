const { ApolloServer, UserInputError, gql } = require('apollo-server')
// Load Chance
var Chance = require('chance');
// Instantiate Chance so it can be used
var chance = new Chance();

const uuid = require('uuid/v1')


let persons = [
  {
    name: "Arto Hellas",
    phone: "040-123543",
    street: "Tapiolankatu 5 A",
    city: "Espoo",
    id: "3d594650-3436-11e9-bc57-8b80ba54c431"
  },
  {
    name: "Matti Luukkainen",
    phone: "040-432342",
    street: "Malminkaari 10 A",
    city: "Helsinki",
    id: '3d599470-3436-11e9-bc57-8b80ba54c431'
  },
  {
    name: "Venla Ruuska",
    street: "Nallemäentie 22 C",
    city: "Helsinki",
    id: '3d599471-3436-11e9-bc57-8b80ba54c431'
  },
]

let authors = Array.from({ length: 10 }, (_, i) => ({
  name: chance.name(),
  born: chance.year(),
  bookCount: chance.integer({ min: 1, max: 5 }),
  id: chance.guid()
}))

let books = Array.from({ length: 10 }, (_, i) => ({
  title: chance.sentence(),
  author: chance.name(),
  published: chance.year(),
  id: chance.guid()
}))

const typeDefs = gql`
  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }
  type Author {
    name: String!
    born: String
    bookCount: Int!
    id: ID!
  }
  type Book {
    title: String!
    author: String!
    published: Int!
    id: ID!
  }
  type Address {
    street: String!
    city: String! 
  }
  enum YesNo {
    YES
    NO
  }
  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
    allAuthors: [Author!]!
    allBooks: [Book!]!
  }
  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(
      name: String!
      phone: String!
    ): Person    
  }  
`

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: (root, args) => {
      if (!args.phone) {
        return persons
      }

      const byPhone = (person) =>
        args.phone === 'YES' ? person.phone : !person.phone

      return persons.filter(byPhone)
    },
    findPerson: (root, args) =>
      persons.find(p => p.name === args.name),
    allAuthors: () => authors,
    allBooks: () => books
  },

  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city
      }
    }
  },
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find(p => p.name === args.name)) {
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.name,
        })
      }
      const person = { ...args, id: uuid() }
      persons = persons.concat(person)
      return person
    },
    editNumber: (root, args) => {
      const person = persons.find(p => p.name === args.name)
      if (!person) {
        return null
      }

      const updatedPerson = { ...person, phone: args.phone }
      persons = persons.map(p => p.name === args.name ? updatedPerson : p)
      return updatedPerson
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})