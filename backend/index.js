const express = require('express')
const app = express()
const port = 5000

app.get('/', (req, res) => {
  res.send('SkillSwap Backend API is running perfectly!')
})

app.listen(port, () => {
  console.log(`SkillSwap Backend server running on port ${port}`)
})
