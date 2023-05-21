import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TState = {
  song: string | null
}
const initialState = <TState>{
  song: null
}
const SongSlice = createSlice({
  name: "song",
  initialState: initialState,
  reducers: {
    setSong: (state, action: PayloadAction<string>) => {state.song = action.payload},
    clearSong: (state) => {state.song = null}
  }
})

export const {setSong, clearSong} = SongSlice.actions
export default SongSlice.reducer