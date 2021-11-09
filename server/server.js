const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const { text } = require("express");

const publicPATH = path.join(__dirname, "../public");
// const node_mPATH = path.join(__dirname, "../node_modules");
const fichierManette = publicPATH + "/manette.html";
const fichierEcran = publicPATH + "/ecran.html";

const port = 3000;
let user;
let userLogin;

// Creation de l'objet joueurs dans laquelle on va stocker toutes les infos de chaque joueur
let joueurs = {};

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPATH));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(fichierManette);
});

app.get("/ecran", (req, res) => {
	res.sendFile(fichierEcran);
})

// app.post('/', (req, res) => {
//     console.log(req.body);

//     // Stockage des informations recu du formulaire dans la variable user
//     user = req.body;

//     // Recuperation du pseudo du joueur qui l'a mit dans le formulaire
//     userLogin = user.pseudo;
//     // console.log(user.pseudo);

//     // On redirige vers le jeu
//     res.sendFile(path.join(publicPATH, "/jeu.html"))
// })

function manette(socket) 
{
	socket.on("manetteLogin", (pseudo) => {
		    // Creation d'un joueur d'objet joueurs avec une postition random, login et id
			joueurs[socket.id] = {
				rotation: 0,
				x: Math.floor(Math.random() * 700) + 50,
				y: Math.floor(Math.random() * 500) + 50,
				id: socket.id,
				nickname: pseudo,
			};
			// console.table(joueurs)

					
	})
}

function ecran(socket) 
{
	socket.emit("ecranUpdate", joueurs);

	let loop = setInterval( () => {
		socket.emit("ecranUpdate", joueurs);
	}, 1000);

	return loop;
}

io.on("connection", (socket) => {
    console.log(`User ${socket.id} just connected.`);
	let isPlayer = false;
	let socketGameLoop

    socket.on("firstConnection", (data) => {
        if (data === "manette") {
			isPlayer = true;
            manette(socket);
        } else if (data === "ecran") {
           socketGameLoop  = ecran(socket);
        }
    });

    // On supprime un joueur de l'objets joueurs quand il se deconnecte
    socket.on("disconnect", () => {
        console.log(`User ${socket.id} has disconnected.`);
		if(isPlayer)
		{
			delete joueurs[socket.id];
		}
		else
		{
			clearInterval(socketGameLoop)
		}
    });
});

server.listen(port, () => {
    console.log(`Listening on ${server.address().port}`);
});
