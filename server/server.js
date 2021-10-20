const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const { text } = require("express");

const publicPATH = path.join(__dirname, "../public");
// const node_mPATH = path.join(__dirname, "../node_modules");
const index = publicPATH + "/index.html";

const port = 3000;
let user
let userLogin

// Creation de l'objet joueurs dans laquelle on va stocker toutes les infos de chaque joueur
let joueurs = {};

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPATH));

app.use(express.json());
app.use(express.urlencoded({extended:true}))


app.get("/", (req, res) =>{
  res.sendFile(index);
});

app.post('/', (req, res) => {
    console.log(req.body);

    // Stockage des informations recu du formulaire dans la variable user
    user = req.body;
    
    // Recuperation du pseudo du joueur qui l'a mit dans le formulaire
    userLogin = user.pseudo;
    // console.log(user.pseudo);

    // On redirige vers le jeu
    res.sendFile(path.join(publicPATH, "/jeu.html"))
})

io.on("connection", (socket) => {
    console.log(`User ${userLogin} ${socket.id} just connected.`);

    // Creation d'un joueur d'objet joueurs avec une postition random, login et id
    joueurs[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        idJoueur: socket.id,
        loginJoueur: userLogin,
    };

    console.log(joueurs)

    // Envoie de l'objet joueur au nouveau joueur
    socket.emit("JoueursCourants", joueurs)
    
    // On transmet qu'on a un nouveau joueur
    socket.broadcast.emit("nvJoueur", joueurs[socket.id])

    // On supprime un joueur de l'objets joueurs quand il se deconnecte
    socket.on("disconnect", () => {
      console.log(`User ${userLogin} has disconnected.`);
      delete joueurs[socket.id]
      io.emit("disconnect", socket.id)
    });
  });

server.listen(port, () => {
  console.log("Server listening on http://localhost:3000");
  console.log(`Listening on ${server.address().port}`);
});
