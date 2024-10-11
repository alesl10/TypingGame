import { palabras as Palabras_iniciales } from "./data.js";

const $tiempo = document.querySelector("tiempo");
const $parrafo = document.querySelector("p");
const $input = document.querySelector("input");
const $juego = document.querySelector("#juego");
const $resultados = document.querySelector("#resultados");
const $ppm = $resultados.querySelector("#resultados-ppm");
const $exactitud = $resultados.querySelector("#resultados-exactitud");
const $button = document.querySelector("#recargar-button");

const Tiempo_inicial = 20;
let PalabrasCorrectas =0
let LetrasCorrectas=0
let LetrasIncorrectas=0

let palabras = [];
let tiempoActual = Tiempo_inicial;
let jugando;

initGame();
initEvents();

function initGame() {
  $juego.style.display = "flex";
  $resultados.style.display = "none";
  $input.value = "";

  jugando = false;

  palabras = Palabras_iniciales.toSorted(() => Math.random() - 0.5).slice(0, 50);
  tiempoActual = Tiempo_inicial;

  $tiempo.textContent = tiempoActual;

  $parrafo.innerHTML = palabras
    .map((palabra, index) => {
      const letras = palabra.split("");

      return `<palabra>
        ${letras.map((letra) => `<letra>${letra}</letra>`).join("")}
      </palabra>
      `;
    })
    .join("");

  const $primeraPalabra = $parrafo.querySelector("palabra");
  $primeraPalabra.classList.add("active");
  $primeraPalabra.querySelector("letra").classList.add("active");
}

function continuous() {
  palabras = Palabras_iniciales.toSorted(() => Math.random() - 0.5).slice(0, 50);

  $parrafo.value = "";

  $parrafo.innerHTML = palabras
    .map((palabra, index) => {
      const letras = palabra.split("");

      return `<palabra>
        ${letras.map((letra) => `<letra>${letra}</letra>`).join("")}
      </palabra>
      `;
    })
    .join("");

  const $primeraPalabra = $parrafo.querySelector("palabra");
  $primeraPalabra.classList.add("active");
  $primeraPalabra.querySelector("letra").classList.add("active");

  $input.addEventListener("keydown", onKeyDown);
  $input.addEventListener("keyup", onKeyUp);
}

function initEvents() {
  document.addEventListener("keydown", () => {
    $input.focus();
    if (!jugando) {
      jugando = true;
      const intervalId = setInterval(() => {
        tiempoActual--;
        $tiempo.textContent = tiempoActual;

        if (tiempoActual === 0) {
          clearInterval(intervalId);
          gameOver();
        }
      }, 1000);
    }
  });
  $input.addEventListener("keydown", onKeyDown);
  $input.addEventListener("keyup", onKeyUp);
  $button.addEventListener("click", initGame);
}

function onKeyDown(event) {
  const $actualPalabra = $parrafo.querySelector("palabra.active");
  const $actualLetra = $actualPalabra.querySelector("letra.active");

  const { key } = event;
  if (key === " ") {
    event.preventDefault();

    const $siguientePalabra = $actualPalabra.nextElementSibling;

    if ($siguientePalabra == null) {
      PalabrasCorrectas += $parrafo.querySelectorAll("palabra.correct").length;
      LetrasCorrectas += $parrafo.querySelectorAll("letra.correct").length;
      LetrasIncorrectas +=
        $parrafo.querySelectorAll("letra.incorrect").length;

      continuous();
    }

    const $siguienteLetra = $siguientePalabra.querySelector("letra");

    $actualPalabra.classList.remove("active");
    $actualLetra.classList.remove("active");

    $siguientePalabra.classList.add("active");
    $siguienteLetra.classList.add("active");

    $input.value = "";

    const letraError =
      $actualPalabra.querySelectorAll("letra:not(.correct)").length > 0;

    const classToAdd = letraError ? "marked" : "correct";
    $actualPalabra.classList.add(classToAdd);


    return;
  }

  if (key === "Backspace") {
    const $antPalabra = $actualPalabra.previousElementSibling;
    const $antLetra = $actualLetra.previousElementSibling;

    if (!$antPalabra && !$antLetra) {
      event.preventDefault();
      return;
    }

    const $palabraMarked = $parrafo.querySelector("palabra.marked");
    if ($palabraMarked && !$antLetra) {
      event.preventDefault();
      $antPalabra.classList.remove("marked");
      $antPalabra.classList.add("active");

      const $irALetra = $antPalabra.querySelector("letra:last-child");

      $actualLetra.classList.remove("active");
      $irALetra.classList.add("active");

      $input.value = [
        ...$antPalabra.querySelectorAll("letra.correct, letra.incorrect"),
      ]
        .map(($el) => {
          return $el.classList.contains("correct") ? $el.innerText : "*";
        })
        .join("");
    }
  }
}

function onKeyUp() {
  const $actualPalabra = $parrafo.querySelector("palabra.active");
  const $actualLetra = $actualPalabra.querySelector("letra.active");

  const actualPalabra = $actualPalabra.innerText.trim();
  $input.maxLength = actualPalabra.length;

  const $allLetters = $actualPalabra.querySelectorAll("letra");

  $allLetters.forEach(($letra) =>
    $letra.classList.remove("correct", "incorrect")
  );

  $input.value.split("").forEach((char, index) => {
    const $letra = $allLetters[index];
    const letterToCheck = actualPalabra[index];

    const isCorrect = char === letterToCheck;
    const letterClass = isCorrect ? "correct" : "incorrect";
    $letra.classList.add(letterClass);
  });

  $actualLetra.classList.remove("active", "is-last");
  const inputLength = $input.value.length;
  const $nextActiveLetter = $allLetters[inputLength];

  if ($nextActiveLetter) {
    $nextActiveLetter.classList.add("active");
  } else {
    $actualLetra.classList.add("active", "is-last");
  }
}

function gameOver() {
  PalabrasCorrectas += $parrafo.querySelectorAll("palabra.correct").length;
  LetrasCorrectas += $parrafo.querySelectorAll("letra.correct").length;
  LetrasIncorrectas += $parrafo.querySelectorAll("letra.incorrect").length;

  $juego.style.display = "none";
  $resultados.style.display = "flex";

  const letrasTotales = LetrasCorrectas + LetrasIncorrectas;
  const exactitud = letrasTotales > 0 ? (LetrasCorrectas / letrasTotales) * 100 : 0;

  const tiempoTranscurridoEnMinutos = Tiempo_inicial / 60;
  const ppm = tiempoTranscurridoEnMinutos > 0 ? PalabrasCorrectas / tiempoTranscurridoEnMinutos : 0;

  $ppm.textContent = ppm.toFixed(2);
  $exactitud.textContent = `${exactitud.toFixed(2)}%`;
}
