import { gql } from "@apollo/client";

export const UPLOAD_FILE_MUTATION = gql`
  mutation UploadFile($file: Upload!) {
    uploadFile(file: $file) {
      success
      message
    }
  }
`;
