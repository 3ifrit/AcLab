let socket = io()

let joueursCourants = {};

const config = {
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
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

let cursor
let tank
let couleur = ["green", "blue", "red", "dark", "sand"]
let couleurRand = getRandomInt(couleur.length)


// Dev mozilla Math.random()
function getRandomInt(max) 
{
    return Math.floor(Math.random() * Math.floor(max));
}

function preload() 
{
    this.load.image('tank', '../assets/tank_blue.png')
    // this.load.image('tank', `../assets/tank_${couleur[getRandomInt(couleur.length)]}.png`)
}


function create() 
{
    socket.on("ecranUpdate", (joueurs) => {
        for (const joueur in joueursCourants)
        {
            let player = joueursCourants[joueur]
            player.tank.destroy();
        }
        joueursCourants = joueurs;
        for (const joueur in joueursCourants)
        {
            let player = joueursCourants[joueur]
            joueursCourants[joueur].tank = this.add.image(player.x, player.y, 'tank').setDisplaySize(60, 40);
        }
    })
    
}

function update() 
{
    
}  

function ecranConnexion()
{
    socket.emit("firstConnection", "ecran");
}

function main()
{
    ecranConnexion()
    let game = new Phaser.Game(config)
}

window.onload = main;