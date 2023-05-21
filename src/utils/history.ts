export const setSearchHistory = (data: string) => {
  let arr: string[];
  const history = localStorage.getItem('history')
  if (history) {
    arr = JSON.parse(history)
  } else {
    arr = []
  }
  arr.unshift(data);
  if (arr.length > 10) {
    arr.length = 10
  }
  localStorage.setItem('history', JSON.stringify(arr));
}

export const getSearchHistory = (): string[] => {
  const history = localStorage.getItem('history')
  return history ? JSON.parse(history) : []
}

// export const setSongToHistory = (data: string) => {
//   localStorage.setItem('song', data);
// }
// export const deleteSongfromHistory = () => {
//   localStorage.removeItem('song');
// }

// export const getSongFromHistory = (): string | null  => {
//  const song = localStorage.getItem('song')
//  return song
// }
