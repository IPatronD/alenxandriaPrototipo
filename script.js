let current = 0;

function goTo(n) {
  document.getElementById("screen-" + current).classList.remove("active");

  document
    .querySelectorAll(".nav-btn")
    .forEach((b, i) => b.classList.toggle("active", i === n));

  current = n;

  document.getElementById("screen-" + current).classList.add("active");

  // Cambiar color de la barra de estado
  const sb = document.getElementById("statusBar");

  sb.style.background =
    n === 0 ? "#1A3A6B" : n === 5 ? "#0D2147" : "var(--azul)";
}
