// input.ts
export const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
};

window.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "ArrowUp") keys.up = true;
    if (e.key === "s" || e.key === "ArrowDown") keys.down = true;
    if (e.key === "a" || e.key === "ArrowLeft") keys.left = true;
    if (e.key === "d" || e.key === "ArrowRight") keys.right = true;
});

window.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "ArrowUp") keys.up = false;
    if (e.key === "s" || e.key === "ArrowDown") keys.down = false;
    if (e.key === "a" || e.key === "ArrowLeft") keys.left = false;
    if (e.key === "d" || e.key === "ArrowRight") keys.right = false;
});