function ativarAjuda() {
  const btn = document.getElementById("help-btn");
  const modal = document.getElementById("help-modal");
  const close = document.getElementById("close-help");

  btn.style.display = "block";

  btn.onclick = () => modal.style.display = "flex";
  close.onclick = () => modal.style.display = "none";
}
