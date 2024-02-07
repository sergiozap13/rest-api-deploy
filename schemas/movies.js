const z = require('zod')

const movieSchema = z.object({
  title: z.string(),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: 'Must be a valid URL'
  }),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi'])
  )
})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

// función para validar parcialmente una película.
// Lo que hace es convertir todos los campos que se pasen en opcionales
function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
