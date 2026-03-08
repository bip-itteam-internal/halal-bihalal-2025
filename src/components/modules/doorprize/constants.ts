export const getCardStyle = (count: number) => {
  if (count > 400)
    return { width: '4.5vw', height: '2.5vh', fontSize: '0.45vw' }
  if (count > 250) return { width: '5.8vw', height: '4vh', fontSize: '0.65vw' }
  if (count > 150) return { width: '7.8vw', height: '6vh', fontSize: '0.8vw' }
  if (count > 80) return { width: '10vw', height: '8vh', fontSize: '1vw' }
  if (count > 40) return { width: '14vw', height: '10vh', fontSize: '1.2vw' }
  if (count > 20) return { width: '18vw', height: '14vh', fontSize: '1.8vw' }
  if (count > 10) return { width: '22vw', height: '16vh', fontSize: '2.2vw' }
  if (count > 5) return { width: '30vw', height: '26vh', fontSize: '2.6vw' }
  if (count === 5) return { width: '30vw', height: '40vh', fontSize: '3vw' }
  if (count === 4) return { width: '47vw', height: '40vh', fontSize: '3.4vw' }
  if (count === 3) return { width: '30vw', height: '45vh', fontSize: '3.8vw' }
  if (count === 2) return { width: '47vw', height: '45vh', fontSize: '4.2vw' }
  return { width: '90vw', height: '50vh', fontSize: '6vw' }
}
