import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export function yn(message: string): Promise<boolean> {
  return new Promise((resolve) =>
    rl.question(message, (answer) => {
      resolve(answer.toLowerCase()[0] === "y");
    })
  );
}
