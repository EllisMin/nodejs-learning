const { buildSchema } = require("graphql");

// Send dummy query to receive String (!: required) text
module.exports = buildSchema(`

    type TestData {
        text: String!
        views: Int!
    }

    type RootQuery {
        dummy123: TestData!
    }

    schema {
        query: RootQuery
    }
`);
