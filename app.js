const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')

const app = express()
// middlewares
app.use(express.json())
// para arreglar el cors
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }
  }
}))
app.disable('x-powered-by')

const PORT = process.env.PORT ?? 1234
const moviesJSON = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

// GET http://localhost:1234/movies
app.get('/movies', (req, res) => {
  // para el param opcional genre
  const { genre } = req.query
  if (genre) {
    const filteredMovies = moviesJSON.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }

  res.json(moviesJSON)
})

// GET http://localhost:1234/movies/1
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = moviesJSON.find(movie => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie not found' })
})

// POST http://localhost:1234/movies
app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (result.error) {
    return res.status(400).json({
      error: JSON.parse(result.error.message)
    })
  }
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  moviesJSON.push(newMovie)
  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = moviesJSON.findIndex(movie => movie.id === id)

  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  const updateMovie = { // operador de propragación de JS
    ...moviesJSON[movieIndex], // partimos de la movie original
    ...result.data // si el data contiene campos que coinciden con el movie
    // original, se sobreescrbien
  }
  moviesJSON[movieIndex] = updateMovie
  return res.json(updateMovie)
})

app.use((req, res) => {
  res.send('<h1>404</h1>')
})

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`)
})
