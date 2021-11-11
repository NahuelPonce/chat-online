/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMensaje = /* GraphQL */ `
  query GetMensaje($id: ID!) {
    getMensaje(id: $id) {
      id
      propietario
      mensaje
      createdAt
      updatedAt
    }
  }
`;
export const listMensajes = /* GraphQL */ `
  query ListMensajes(
    $filter: ModelMensajeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMensajes(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        propietario
        mensaje
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
