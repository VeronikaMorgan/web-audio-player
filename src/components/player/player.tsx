import React, { FC, useState, useRef, useEffect } from "react";
import styles from './player.module.scss';
import { clearSong } from '../../services/song-slice'
import { useAppDispatch } from "../../types/hooks";
import { throttle } from "../../utils/throttle";
import { calculateTime } from "../../utils/calculate-time";

const Player: FC<{ song: string }> = ({ song }) => {
  const [play, setPlay] = useState<boolean>(false)
  const [duration, setDuration] = useState<number>(0)
  const [pending, setPending] = useState<boolean>(true)
  const [firstPlay, setFirstPlay] = useState<boolean>(false)
  const [progressWidth, setProgressWidth] = useState<number>(0)
  const [isPlayBlocked, setIsPlayBlocked] = useState<boolean>(true)
  const [isDrag, setIsDrag] = useState(false)

  const [volumeWidth, setVolumeWidth] = useState<number>(50)
  const [currentTime, setCurrentTime] = useState<string>('00:00')
  const audioRef = useRef<HTMLAudioElement>(null)

  const progressTrackRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)
  const volumeThumbRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const progressThumbRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const song = audioRef.current
    if (!song) return
    song.oncanplaythrough = () => {
      setDuration(song.duration)
      setPending(false)
      setIsPlayBlocked(false)
    }
  }, [])

  const handleReturn = (e: React.MouseEvent<HTMLButtonElement>) => {
    dispatch(clearSong())
  }
  // play button 
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if(!firstPlay) {setFirstPlay(true)}
    const song = audioRef.current
    if (play) {
      setPlay(false)
      song?.pause()
    } else {
      setPlay(true)
      song?.play()
    }
  }

  // update progress width on song time change
  useEffect(() => {
    const song = audioRef.current
    if (!song) return
    song?.addEventListener('timeupdate', updateProgress)
    return () => {
      song?.removeEventListener('timeupdate', updateProgress)
    }
  }, [audioRef.current])

  const updateProgress = (e: any) => {
    const { currentTime } = e.srcElement;
    const progressWidth = (currentTime / duration) * 100;
    // update progress bar width
    setProgressWidth(progressWidth)
    const time = calculateTime(currentTime)
    // update time counter
    setCurrentTime(time)
  }

  const setProgressOnClick = (e: any) => {
    if (isPlayBlocked) return
    if (!firstPlay) return
    const track = progressRef.current
    const song = audioRef.current
    if (!song) return
    if (!track) return
    const width = track.clientWidth
    const clickX = e.nativeEvent.offsetX
    song.currentTime = (clickX / width) * duration
  }

  const setVolumeOnClick = (e: any) => {
    if (isPlayBlocked) return
    const track = volumeRef.current
    const song = audioRef.current
    if (!song) return
    if (!track) return
    const width = track.clientWidth
    const clickX = e.nativeEvent.offsetX
    const newWidth = +(clickX / width).toFixed(3)
    song.volume = newWidth
    // unable set an observer on song.volume change as it updates only on play
    setVolumeWidth(song.volume * 100)
  }
  // mouse move event - doest't work very smooth
  const throttledVolumeMove = throttle(onVolumeMove, 200)
  const throttledProgressMove = throttle(onProgressMove, 200)

  function onVolumeMove(event: any) {
    if (!isDrag) return
    event.preventDefault()
    const song = audioRef.current
    const track = volumeRef.current
    const thumb = volumeThumbRef.current
    if (!track) return
    if (!thumb) return
    if (!song) return

    let { left, right } = track.getBoundingClientRect();
    right = right - thumb.getBoundingClientRect().width;

    const trackWidth = track.clientWidth
    const width = event.pageX < left ? left : event.pageX > right ? right : event.pageX
    const newWidth = (width - left);
    const progressWidth = +(newWidth / trackWidth).toFixed(3)
    song.volume = progressWidth
    setVolumeWidth(song.volume * 100)
  }

  const mouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDrag(false)
  }
  const mouseOn = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDrag(true)
  }

  function onProgressMove(event: any) {
    if (!isDrag) return
    event.preventDefault()
    const song = audioRef.current
    const track = progressRef.current
    const thumb = progressThumbRef.current
    if (!track) return
    if (!thumb) return
    if (!song) return

    let { left, right } = track.getBoundingClientRect();
    right = right - thumb.getBoundingClientRect().width;

    const trackWidth = track.clientWidth
    const width = event.pageX < left ? left : event.pageX > right ? right : event.pageX
    const newWidth = (width - left);
    const progressWidth = +(newWidth / trackWidth).toFixed(3)
    song.currentTime = (progressWidth) * duration
    console.log(progressWidth)
  }

  // keyboard events
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowLeft':
        changeTime('back', 15)
        break;
      case 'ArrowRight':
        changeTime('forth', 15)
        break;
      case 'Equal':
        changeVolume('plus', 0.1)
        break;
      case 'Minus':
        changeVolume('minus', 0.1)
        break;
      default: {
        return
      }
    }
  }
  const changeTime = (direction: 'back' | 'forth', interval: number) => {
    const song = audioRef.current
    if (!song) return
    const { currentTime } = song
    if (direction === 'back') {
      song.currentTime = currentTime - interval
    } else {
      song.currentTime = currentTime + interval
    }
  }
  const changeVolume = (direction: 'plus' | 'minus', interval: number) => {
    const song = audioRef.current
    if (!song) return
    const { volume } = song
    if (direction === 'minus') {
      if (volume - interval < 0) {
        song.volume = 0
        setVolumeWidth(0)
      } else {
        song.volume = volume - interval
        setVolumeWidth(song.volume * 100)
      }
    } else {
      if (volume + interval > 1) {
        song.volume = 1
        setVolumeWidth(100)
      } else {
        song.volume = volume + interval
        setVolumeWidth(song.volume * 100)
      }
    }
  }

  return (
    <>
      <button className={styles.player__return} onClick={handleReturn}>← Back</button>
      <div className={styles.player__wrapper}>{
        pending && <div className={styles.player__loader}></div>
      }
        <button className={styles.player__play} onClick={handleClick} disabled={isPlayBlocked}>
          <div className={`${styles.player__play_icon} ${play ? `${styles.type_pause_left}` : `${styles.type_play_left}`}`} style={{ width: play ? '35px' : '40px' }}></div>
          <div className={`${styles.player__play_icon} ${play ? `${styles.type_pause_right}` : `${styles.type_play_right}`}`} style={{ width: play ? '35px' : '40px' }}></div>
        </button>
        <audio ref={audioRef} src={song} onError={() => console.log('audio error')}></audio>
        <div className={styles.player__progress} onClick={setProgressOnClick} ref={progressRef}>
          <div ref={progressTrackRef} className={styles.player__progress_track} style={{ width: progressWidth > 90 ? `${progressWidth}%` : `${progressWidth + 3}%` }}>
            <div onMouseMove={throttledProgressMove} onMouseDown={mouseOn} onMouseLeave={mouseUp} ref={progressThumbRef} className={styles.player__progress_thumb}></div>
          </div>
        </div>
        <span className={styles.player__time}>{currentTime}</span>
        <div className={styles.player__volume} onClick={setVolumeOnClick} ref={volumeRef} >
          <div className={styles.player__volume_track} style={{ width: `${volumeWidth + 5}%` }}>
            <div onMouseMove={throttledVolumeMove} onMouseDown={mouseOn} onMouseLeave={mouseUp} className={styles.player__volume_thumb} ref={volumeThumbRef} onClick={(e) => e.preventDefault()}></div>
          </div>
        </div>
      </div>
    </>
  )
}
export default Player