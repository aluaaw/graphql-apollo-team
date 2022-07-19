const database = require("./database");
const { ApolloServer, gql } = require("apollo-server");
const { equipments } = require("./database");
const typeDefs = gql`
  type Query {
    teams: [Team]
    teamsWithSupplies: [Team]
    team(id: Int): Team
    equipments: [Equipment]
    supplies: [Supply]
  }
  type Mutation {
    insertEquipment(
      id: String
      used_by: String
      count: Int
      new_or_used: String
    ): Equipment
    editEquipment(
      id: String
      used_by: String
      count: Int
      new_or_used: String
    ): Equipment
    deleteEquipment(id: String): Equipment
  }
  type Team {
    id: Int
    manager: String
    office: String
    extension_number: String
    mascot: String
    cleaning_duty: String
    project: String
    supplies: [Supply]
  }
  type Equipment {
    id: String
    used_by: String
    count: Int
    new_or_used: String
  }
  type Supply {
    id: String
    team: Int
  }
`;
const resolvers = {
  Query: {
    teams: () => database.teams,
    teamsWithSupplies: () =>
      database.teams.map((team) => {
        team.supplies = database.supplies.filter((supply) => {
          return supply.team === team.id;
        });
        return team;
      }),
    team: (parent, args, context, info) =>
      database.teams.filter((team) => {
        return team.id === args.id;
      })[0],
    equipments: () => database.equipments,
    supplies: () => database.supplies,
  },
  Mutation: {
    insertEquipment: (parent, args, context, info) => {
      database.equipments.push(args);
      return args;
    },
    editEquipment: (parent, args, context, info) => {
      console.log(
        "what is this? ",
        database.equipments.filter((equipment) => {
          return args.id === equipment.id;
        })[0]
      );
      return Object.assign(
        database.equipments.filter((equipment) => {
          return args.id === equipment.id;
        })[0],
        args
      );
    },
    deleteEquipment: (parent, args, context, info) => {
      // 삭제'된' 항목을 return
      const deleted = database.equipments.filter((equipment) => {
        return args.id === equipment.id;
      })[0];
      // 실질적으로 삭제 (새로운 배열로 덮는다)
      database.equipments = database.equipments.filter((equipment) => {
        return equipment.id !== args.id;
      });
      return deleted;
    },
  },
};
const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
