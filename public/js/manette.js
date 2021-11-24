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


function preload ()
{
    /* load les images qu'il faudra DL je pense */
}

function create ()
{
    main();
    var move = new JoyStick('move');
    var aim = new JoyStick('aim');

}

function update ()
{
    
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

function main() {
    ecranConnexion();
}

window.onload = main;
