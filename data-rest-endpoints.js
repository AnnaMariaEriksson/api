const bcrypt = require("bcrypt");


module.exports = (app, db) => {

    // Authentication routes

    // register user
    app.post('/api/users', async (request, response) => {
        let password = await bcrypt.hash(request.body.password, 10);
        let result = await db.query("INSERT INTO users SET ?", { ...request.body, password })
        response.json(result)
    });

    // authentication: perform login
    app.post('/api/login', async (request, response) => {
        let user = await db.query('SELECT * FROM users WHERE username = ?', [request.body.username])
        user = user[0]

        if(user && user.username && await bcrypt.compare(request.body.password, user.password)){
            request.session.user = user
            user.loggedin = true
            response.json({loggedin: true})
        }else{
            response.status(401) // unauthorized  https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
            response.json({message:"no matching user"})
        }
    })

    // authentication: get logged in user
    app.get('/api/login', async (request, response) => {
        let user
        if(request.session.user){
            user = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [request.session.user.username, request.session.user.password])
            user = user[0]
        }
        if(user && user.username){
            user.loggedin = true
            delete(user.password)
            response.json(user)
        }else{
            response.status(401) // unauthorized  https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
            response.json({message:"not logged in"})
        }
    })

    // logga ut
    app.delete('/api/login', async (request, response) => {
        request.session.destroy( () => {
            response.json({loggedin: false})
        } )
    })

    // Get playlists
    app.get('/api/playlists', async (request, response) => {
        let data = await db.query('SELECT * FROM playlists')
        response.json(data)
    })

    // Get songs
    app.get('/api/songs', async (request, response) => {
        let data = await db.query('SELECT * FROM songs')
        response.json(data)
    })

    //Get single playlist
    app.get("/api/playlists/:id", async (request, response) => {
        let data = await db.query("SELECT * FROM ljudio1.playlists WHERE playlist_id = ?", [request.params.id])
        data = data[0] // single row
        response.json(data)
    })

    //Create playlist
    app.post("/api/playlists", async (request, response) => {
        // check if user exists before writing
        /*if(!request.session.user){
            response.status(403) // forbidden
            response.json({error:'not logged in'})
            return;
        }*/
        let result = await db.query("INSERT INTO ljudio1.playlists SET ?", request.body)
        response.json(result)
    })

    //Add song to library
    app.post("/api/songs", async (request, response) => {
        try {
            // check if user exists before writing
            if(!request.session.user){
                response.status(403) // forbidden
                response.json({error:'not logged in'})
                return;
            }
            let result = await db.query("INSERT INTO ljudio1.songs SET ?", request.body)
            response.json(result)
        }
        catch (e) {

        }
        
    })

    // Example routes

    // public get all table rows
    app.get('/api/examples', async (request, response) => {
        let data = await db.query('SELECT * FROM examples')
        response.json(data)
    })

    // public get one table row
    app.get("/api/examples/:id", async (request, response) => {
        let data = await db.query("SELECT * FROM examples WHERE id = ?", [request.params.id])
        data = data[0] // single row
        response.json(data)
    })

    // public get another table (happens to be a left joined view)
    app.get("/api/examples_with_colors", async (request, response) => {
        let data = await db.query("SELECT * FROM examples_with_colors")
        response.json(data)
    })

    // private create one row
    app.post("/api/examples", async (request, response) => {
        // check if user exists before writing
        if(!request.session.user){
            response.status(403) // forbidden
            response.json({error:'not logged in'})
            return;
        }
        let result = await db.query("INSERT INTO examples SET ?", request.body)
        response.json(result)
    })

    // private update one row
    app.put("/api/examples/:id", async (request, response) => {
        // check if user exists before writing
        if(!request.session.user){
            response.status(403) // forbidden
            response.json({error:'not logged in'})
            return;
        }
        let result = await db.query("UPDATE examples SET ? WHERE id = ?", [request.body, request.params.id] )
        response.json(result)
    })

    // private delete one row
    app.delete("/api/examples/:id", async (request, response) => {
        // check if user exists before writing
        if(!request.session.user){
            response.status(403) // forbidden
            response.json({error:'not logged in'})
            return;
        }
        let result = await db.query("DELETE FROM examples WHERE id = ?", request.params.id)
        response.json(result)
    })


}
