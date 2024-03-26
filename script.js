const home = document.querySelector(".homePage");
const startButton = document.querySelector(".start");
const arena = document.querySelector(".fight");
const player1 = document.querySelector("#player1");
const player2 = document.querySelector("#player2");
const attack1 = document.querySelector(".attack1");
const attack2 = document.querySelector(".attack2");
const health1 = document.querySelector("#health1");
const health2 = document.querySelector("#health2");
const winner = document.querySelector(".winner");
const winInfos = document.querySelector(".win-infos");
const modal = document.querySelector(".modal");
const restart = document.querySelector(".restart");
const text = document.querySelector(".list");
const form = document.querySelector("form");
const name1 = document.querySelector("#name1");
const name2 = document.querySelector("#name2");

const fightSong = document.createElement("audio");
fightSong.src = "./media/fight-song.mp3";
fightSong.volume = 0.05;

const winSong = document.createElement("audio");
winSong.src = "./media/win-song.mp3";
winSong.volume = 0.05;

const animAttack = new Audio();
animAttack.src = "./media/attack.mp3";

const x = form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const name1 = formData.get("player1Name");
  const name2 = formData.get("player2Name");
  const pokemon1 = createPokemon(
    formData.get("player1"),
    player1,
    health1,
    `./images/${formData.get("player1")}-fight.gif`,
    `./media/${formData.get("player1")}-cri.mp3`
  );

  const pokemon2 = createPokemon(
    formData.get("player2"),
    player2,
    health2,
    `./images/${formData.get("player2")}-fight.gif`,
    `./media/${formData.get("player2")}-cri.mp3`
  );

  console.log(pokemon1);

  const attack = (attacker, defender, attackerBtn, defenderBtn) => {
    const player = attacker.player.id === "player1" ? `${name1}` : `${name2}`;
    text.innerText = `${attacker.name} de ${player} a attaqué ${defender.name}`;
    attacker.attack(defender);
    // attacker.generateDamage(defender.player.id, defender.player);
    animAttack.play();
    defender.pv(attacker);
    if (!defender.isAlive()) {
      defender.isDead();
      attack2.setAttribute("disabled", "");
      winInfos.innerText = `${player} a gagné avec ${attacker.name} !!`;
      winner.innerHTML = `<img src="./images/${attacker.name}-fight.gif">`;
      modal.classList.add("visible");
      fightSong.pause();
      winSong.play();
      return;
    }
    attackerBtn.setAttribute("disabled", "");
    defenderBtn.removeAttribute("disabled");
  };

  attack1.addEventListener("click", () => {
    attack(pokemon1, pokemon2, attack1, attack2);
  });

  attack2.addEventListener("click", () => {
    attack(pokemon2, pokemon1, attack2, attack1);
  });
});

startButton.addEventListener("click", (e) => {
  if (name1.value === "" && name2.value === "") {
    alert("Veuillez entrer votre nom/pseudo");
  } else {
    text.innerText = `${name1.value} commence`;
    home.classList.add("hidden");
    fightSong.play();
    player1.style.transform = "translateX(0px)";
    player1.style.transition = "transform 2s";
    player1.style.transitionDelay = "1s";
    player2.style.transform = "translateX(0px)";
    player2.style.transition = "transform 2s";
    player2.style.transitionDelay = "4s";
  }
});

restart.addEventListener("click", () => {
  location.assign("/");
});

class Pokemon {
  constructor(name, life, power, url, player, health, shout) {
    this.name = name;
    this.life = life;
    this.power = power;
    this.url = url;
    this.player = player;
    this.health = health;
    this.shout = shout;

    const playerChoice = this.getPlayerId(this.player.id);

    this.generatePlayer(
      this.generateImage(playerChoice, this.url),
      this.generateSound(this.url),
      this.player
    );
  }

  getPlayerId(playerId) {
    return playerId === "player1"
      ? {
          y: 5,
          x: player1.getBoundingClientRect().width / 2.5,
        }
      : {
          y: 5,
          x: player2.getBoundingClientRect().width / 2.5,
        };
  }
  attack(opponent) {
    opponent.life -= this.power;
    this.generateDamage(opponent.player.id, opponent.player);
  }
  generateDamage(playerId, opponent) {
    const playerIdFound = this.getPlayerId(playerId);
    console.log(playerIdFound);
    const image = new Image();
    image.src = "./images/anim-attack.gif";
    image.style.zIndex = "20";

    image.onload = () => {
      image.style.position = "absolute";
      image.style.left = `${playerIdFound.x}px`;
      image.style.bottom = `${playerIdFound.y}px`;
    };
    opponent.appendChild(image);
    setTimeout(() => {
      opponent.removeChild(image);
    }, 500);
  }

  generatePlayer(image, shout, player) {
    player.appendChild(image);
    player.appendChild(shout);
  }

  generateImage(position, url) {
    const image = new Image();
    image.src = url;
    image.onload = () => {
      const scale = 0.5;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.image.style.position = "absolute";
      this.image.style.left = `${position.x}px`;
      this.image.style.bottom = `${position.y}px`;
    };
    return image;
  }

  generateSound(url) {
    const shout = new Audio();
    shout.src = url;
    shout.play();
    return shout;
  }
  isAlive() {
    return this.life > 0;
  }
  isDead() {
    this.image.src = `./images/${this.name}-sleepy.png`;
  }
  pv() {
    if (this.life < 0) {
      this.life = 0;
    }
    if (this.life <= 50) {
      this.health.style.background = "orange";
    }
    if (this.life <= 22) {
      this.health.style.background = "red";
    }
    this.health.style.width = `${this.life}%`;
    this.health.style.transition = "width 3s";
    this.health.children[0].innerText = `${this.life}/100PV`;
  }
}

class Plant extends Pokemon {
  constructor(name, life, power, url, player, health, shout) {
    super(name, life, power, url, player, health, shout);
  }
  attack(opponent) {
    if (opponent instanceof Water) {
      opponent.life -= this.power * 2;
    } else {
      super.attack(opponent);
    }
  }
}

class Water extends Pokemon {
  constructor(name, life, power, url, player, health, shout) {
    super(name, life, power, url, player, health, shout);
  }
  attack(opponent) {
    if (opponent instanceof Fire) {
      opponent.life -= this.power * 2;
    } else {
      super.attack(opponent);
    }
  }
}

class Fire extends Pokemon {
  constructor(name, life, power, url, player, health, shout) {
    super(name, life, power, url, player, health, shout);
  }
  attack(opponent) {
    if (opponent instanceof Plant) {
      opponent.life -= this.power * 2;
    } else {
      super.attack(opponent);
    }
  }
}

class Electric extends Pokemon {
  constructor(name, life, power, url, player, health, shout) {
    super(name, life, power, url, player, health, shout);
  }
  attack(opponent) {
    if (opponent instanceof Water) {
      opponent.life -= this.power * 2;
    } else {
      super.attack(opponent);
    }
  }
}

const createPokemon = (name, player, health, url, shout) => {
  switch (name) {
    case "salameche":
      return new Fire(name, 100, 20, url, player, health, shout);
    case "carapuce":
      return new Water(name, 100, 20, url, player, health, shout);
    case "pikachu":
      return new Electric(name, 100, 20, url, player, health, shout);
    case "bulbizarre":
      return new Plant(name, 100, 20, url, player, health, shout);
    default:
      return null;
  }
};
