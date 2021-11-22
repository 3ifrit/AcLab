const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const { text } = require("express");

require('@geckos.io/phaser-on-nodejs')
const Phaser = require('phaser')

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

class ServerScene extends Phaser.Scene {
	constructor(){
		super();
	}
}


class Tank extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, vie, degats, nom, equipe){
		super(scene, x, y, '')

		this.vie = vie;
		this.degats = degats;
		this.nom = nom;
		this.equipe = equipe;

		scene.add.existing(this)
    	scene.physics.add.existing(this)

    	this.body.setSize(100, 100)
    	this.setCollideWorldBounds(true)
	}
}


	function create() {
		this.physics.world.setBounds(0, 0, 1280, 720);

		io.on("connection", socket => {
			const tank = new Tank(this, 100, 200);

			this.tanks[socket.id].socket = socket;
			this.tanks[socket.id].joueur = tank;
		})

		
	}


const config = {
	type: Phaser.HEADLESS,
	width: 1280,
	height: 720,
	banner: false,
	audio: false,
	scene: [ServerScene],
	physics: {
	  default: 'arcade',
	  arcade: {
		gravity: { y: 50 }
	  }
	}
}

new Phaser.Game(config)

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
