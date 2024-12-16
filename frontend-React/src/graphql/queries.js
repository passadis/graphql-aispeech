import { gql } from "@apollo/client";

export const LIST_TRANSCRIPTIONS = gql`
  query {
    listTranscriptions {
      id
      filename
    }
  }
`;

export const GET_TRANSCRIPTION = gql`
  query GetTranscription($id: ID!) {
    getTranscription(id: $id) {
      id
      filename
      transcription
      fileUrl
    }
  }
`;
