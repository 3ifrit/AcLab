const socket = io();

const config = {
    type: Phaser.AUTO,
    width : 800,
    height : 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0}
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var game = new Phaser.Game(config);

var move;
var aim;
var direction;
var pression;

function preload ()
{
    /* load les images qu'il faudra DL je pense */
}

function create ()
{
    ecranConnexion();
    move = new JoyStick('move');
    aim = new JoyStick('aim');
}

function update () 
{
   if( (move.getDir) != "C")
        socket.emit("mouvement", move.GetX, move.GetY); 
    
    }

function ecranConnexion() {
    socket.emit("firstConnection", "manette");

    const boutonEntrer = document.getElementById("entrer");
    const champLogin = document.getElementById("login");

    boutonEntrer.addEventListener("click", () => {
        socket.emit("manetteLogin", champLogin.value);
        document.getElementById("form").style.display = "none";
    });
}
