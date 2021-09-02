const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/dogs', (req, res) =>
    res.send("Ludde, Lufsen, Molle, Micke")
)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))