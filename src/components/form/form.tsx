import React, { FC, useState, useRef, useEffect } from "react";
import styles from './form.module.scss';
import img from '../../vendor/images/icon.png';
import { setSearchHistory, getSearchHistory } from "../../utils/history";
import { useAppDispatch } from "../../types/hooks";
import { setSong } from "../../services/song-slice";

const Form: FC = () => {
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [isValid, setIsValid] = useState<boolean>(true)

  const [inputValue, setInputValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const dispatch = useAppDispatch()
  useEffect(() => {
    const history = getSearchHistory()
    setHistory(history)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    dispatch(setSong(inputValue))
    setSearchHistory(inputValue)
  }
  // mb we can check it some other way too
  const checkValidity = (value: string): boolean => {
    return /^https?:\/\//.test(value)
  }
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value)
    const isValid = checkValidity(value)
    isValid ? setIsValid(true) : setIsValid(false)
  }

  const setFromHistory = (value: string, e: React.MouseEvent) => {
    e.preventDefault()
    setInputValue(value)
    const isValid = checkValidity(value)
    isValid ? setIsValid(true) : setIsValid(false)
    setShowHistory(false)
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault()
    setShowHistory(true)
  }

  const handleCloseHistory = (e: any) => {
    e.preventDefault()
    if (e.target.closest("form")) {
      return
    }
    setShowHistory(false)
  }
  useEffect(() => {
    if (!showHistory) return
    document.addEventListener('click', handleCloseHistory)
    return () => {
      document.removeEventListener('click', handleCloseHistory)
    }
  }, [showHistory])

  return (
    <>
      <h2 className={styles.title}>Insert the link</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.form__input_wrapper}>
          <input style={{ paddingRight: isValid ? '16px' : '56px', borderColor: isValid ? 'transparent' : 'rgba(198, 168, 39, 1)' }} value={inputValue} onFocus={onFocus} ref={inputRef} onChange={handleChange} className={styles.form__input} type="text" placeholder="https://" ></input>
          {!isValid && <div className={styles.form__error_icon}></div>}
          {!isValid && <span className={styles.form__error_text}>Please, provide a direct link</span>}
          <ul className={styles.form__history}>
            {(history && showHistory) && history.map((item, index) => (
              <li key={index} className={styles.form__history_item} onClick={(e) => setFromHistory(item, e)}>{item}</li>
            )
            )}
          </ul>
        </div>
        <button className={styles.form__btn} type="submit" disabled={!isValid || inputValue === ''}>
          <img src={img} alt="" />
        </button>
      </form>
   </>

  )
}

export default Form