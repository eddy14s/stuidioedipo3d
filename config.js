const CONFIG = {
  pasta: "imagens_360",
  extensao: "jpg",
  totalImagens: 4
};

function getAssetPath(fileName) {
  const cleanFile = String(fileName).replace(/^\/+/, "");
  const cleanFolder = CONFIG.pasta.replace(/^\/+|\/+$/g, "");
  const isGitHubPages = window.location.hostname.endsWith("github.io");

  if (!isGitHubPages) {
    return `${cleanFolder}/${cleanFile}`;
  }

  const firstPathSegment = window.location.pathname.split("/").filter(Boolean)[0] || "";
  if (!firstPathSegment) {
    return `${cleanFolder}/${cleanFile}`;
  }

  return `/${firstPathSegment}/${cleanFolder}/${cleanFile}`.replace(/\/{2,}/g, "/");
}