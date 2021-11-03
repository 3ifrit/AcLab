let socket = io()

const config = {
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 200}
        }
    },
    scene:{
        preload: preload,
        create: create,
        update: update
    }
}

const game = new Phaser.Game(config)

let cursor

let color = ["green", "blue", "red", "dark", "sand"]

// Dev mozilla Math.random()
function getRandomInt(max) 
{
    return Math.floor(Math.random() * Math.floor(max));
  }

function preload() {
    this.load.image('tank', '../assets/tank_blue.png')
    this.load.image('autreJoueur', `../assets/tank_${couleurRandom}.png`)
}


function create() {

    // Creation d'un groupe de joueur
    this.groupeJoueur = this.physics.add.group()

    socket.on("JoueursCourants", (joueurs) =>{
        Object.keys(joueurs).forEach((id) => {
            if(joueurs[id].idJoueur === socket.id)
            {
                addJoueur(this, joueurs[id])
            }
        })
    })

    // cursor = this.input.keyboard.createCursorKeys()

    // On ajoute un nouveau joueur
    socket.on("nvJoueur", (infoJoueur) =>{
        addNvJoueur(this, infoJoueur)
    })

    // On detruit le joueur quand il se deconencte
    socket.on("disconnect", (joueurId) =>{
        this.groupeJoueur.getChildren().forEach((autreJoueur) => {
            if (joueurId === autreJoueur.idJoueur)
            {
                autreJoueur.destroy()
            }
        })
    })
    
}

function update() 
{
    
}

function addJoueur(joueur, infoJoueur) 
{
    // Ajouter le tank au jeu
    joueur.tank = joueur.physics.add.image(infoJoueur.x, infoJoueur.y, 'tank').setOrigin(0.5, 0.5).setDisplaySize(60, 40)

    // Controler la force de resistance
    joueur.tank.setDrag(100)
    joueur.tank.setAngularDrag(100)

    // Vitesse maximale du tank a 200 VROUM VROUUUM !!!
    joueur.tank.setMaxVelocity(200)

    // Tank ' reste ' dans le jeu
    joueur.tank.body.collideWorldBounds = true
}

function addNvJoueur(joueur, infoJoueur)
{
    const couleurRandom = color[getRandomInt(color.length)]
    let autreJoueur = joueur.add.sprite(infoJoueur.x, infoJoueur.y, 'autreJoueur').setOrigin(0.5, 0.5).setDisplaySize(60, 40)

    autreJoueur.idJoueur = infoJoueur.idJoueur
    joueur.groupeJoueur.add(autreJoueur)

    console.log(autreJoueur);
    console.log(joueur.groupeJoueur.add(autreJoueur));

    autreJoueur.body.collideWorldBounds = true
}