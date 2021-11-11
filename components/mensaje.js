import React from "react";
import styles from "../styles/Message.module.css";

export default function Mensaje({ mensaje, soyYo }) {
  return (
    <div
      className={
        soyYo ? styles.sentMessageContainer : styles.receivedMessageContainer
      }
    >
      <p className={styles.senderText}>{mensaje.propietario}</p>
      <div className={soyYo ? styles.sentMessage : styles.receivedMessage}>
        <p>{mensaje.mensaje}</p>
      </div>
    </div>
  );
}