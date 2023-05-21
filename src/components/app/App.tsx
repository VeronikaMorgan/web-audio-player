import React, { useEffect, useState } from "react";
import { FC } from "react";
import { useAppSelector } from "../../types/hooks";
import Form from "../form/form";
import Player from "../player/player";
import styles from './app.module.scss'

const App: FC = () => {
  const song = useAppSelector(store => store.song)
  return (
    <div className={styles.wrapper}>
      {!!song ? <Player song={song}/> : <Form />}
    </div>
  )
}

export default App