import { gql } from "apollo-server";

const typeDefs = gql`
  scalar Upload

  type UploadResponse {
    success: Boolean!
    message: String!
  }

  type Transcription {
    id: ID!
    filename: String!
    transcription: String!
    fileUrl: String!
  }

  type Query {
    hello: String
    listTranscriptions: [Transcription!]
    getTranscription(id: ID!): Transcription
  }

  type Mutation {
    uploadFile(file: Upload!): UploadResponse!
  }
`;

export default typeDefs;
