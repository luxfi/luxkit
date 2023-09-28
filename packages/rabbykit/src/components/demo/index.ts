import App from "./demo.svelte";

export const mount = () => {
  let mountNode = document.querySelector("[data-rk-mounted]");
  if (!mountNode) {
    mountNode = document.createElement("div");
    mountNode.setAttribute("data-rk-mounted", "");
    document.body.insertAdjacentElement("afterend", mountNode);
  }
  new App({ target: mountNode });
};