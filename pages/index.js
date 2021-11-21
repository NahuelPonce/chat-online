import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { API, Auth, withSSRContext, graphqlOperation } from "aws-amplify";
import { listMensajes } from "../src/graphql/queries";
import { createMensaje } from "../src/graphql/mutations";
import Mensaje from "../components/mensaje";
import { onCreateMensaje } from "../src/graphql/subscriptions";

function Home({ mensajes }) {
  const [stateMensajes, setStateMensajes] = useState([...mensajes]);
  const [mensajeTexto, setMensajeTexto] = useState("");
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const amplifyUser = await Auth.currentAuthenticatedUser();
        setUsuario(amplifyUser);
      } catch (err) {
        setUsuario(null);
      }
    };

    fetchUsuario();

    const subscription = API.graphql(
      graphqlOperation(onCreateMensaje)
    ).subscribe({
      next: ({ provider, value }) => {
        setStateMensajes((stateMensajes) => [
          ...stateMensajes,
          value.data.onCreateMensaje,
        ]);
      },
      error: (error) => console.warn(error),
    });
  }, []);

  useEffect(() => {
    async function getMensajes() {
      try {
        const mensajesReq = await API.graphql({
          query: listMensajes,
          authMode: "AMAZON_COGNITO_USER_POOLS",
        });
        setStateMensajes([...mensajesReq.data.listMensajes.items]);
      } catch (error) {
        console.error(error);
      }
    }
    getMensajes();
  }, [usuario]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMensajeTexto("");

    const input = {
      mensaje: mensajeTexto,
      propietario: usuario.username,
    };

    try {
      await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: createMensaje,
        variables: {
          input: input,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (usuario) {
    return (
      <div className={styles.background}>
            <AmplifySignOut />
        <div className={styles.container}>
          <h1 className={styles.title}> Chat Online</h1>
          <div className={styles.chatbox}>
            {stateMensajes

              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((mensaje) => (
                <Mensaje
                  mensaje={mensaje}
                  usuario={usuario}
                  soyYo={usuario.username === mensaje.propietario}
                  key={mensaje.id}
                />
              ))}
          </div>
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.formBase}>
              <input
                type="text"
                id="mensaje"
                name="mensaje"
                autoFocus
                required
                value={mensajeTexto}
                onChange={(e) => setMensajeTexto(e.target.value)}
                placeholder="Escribe un mensaje aquí 💬"
                className={styles.textBox}
              />
              <button style={{ marginLeft: "8px" }}>Enviar</button>
            </form>
          </div>
        </div>
      </div>
    );
  } else {
    return <p>Cargando...</p>;
  }
}

export default withAuthenticator(Home);

export async function getStaticProps({ req }) {

  const SSR = withSSRContext({ req });

  try {
    const usuario = await SSR.Auth.currentAuthenticatedUser();

    const response = await SSR.API.graphql({
      query: listMensajes,
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });


    return {
      props: {
        mensajes: response.data.listMensajes.items,
      },
    };
  } catch (error) {

    return {
      props: {
        mensajes: [],
      },
    };
  }
}
