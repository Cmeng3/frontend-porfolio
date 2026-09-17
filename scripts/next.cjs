/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS CLI bootstrap. */
const path = require("node:path");
const fs = require("node:fs");

// WASM skips Next's native dev lock. Keep one CLI owner per checkout so
// competing servers cannot remove each other's compiled pages.
if (process.argv[2] === "dev") {
  const lockPath = path.join(__dirname, "..", ".portfolio-dev.lock");
  function acquireLock() {
    try {
      fs.writeFileSync(lockPath, String(process.pid), { flag: "wx" });
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      const pid = Number(fs.readFileSync(lockPath, "utf8"));
      let alive = true;
      if (Number.isInteger(pid) && pid > 0) {
        try {
          process.kill(pid, 0);
        } catch (probe) {
          if (probe.code === "ESRCH") alive = false;
          else throw probe;
        }
      }
      if (alive) {
        console.error(
          "A portfolio dev server is already running. Use its existing URL, or stop it with Ctrl+C before restarting.",
        );
        process.exit(1);
      }
      fs.unlinkSync(lockPath);
      acquireLock();
    }
  }
  acquireLock();
  process.on("exit", () => {
    try {
      if (fs.readFileSync(lockPath, "utf8") === String(process.pid))
        fs.unlinkSync(lockPath);
    } catch {
      /* A terminated process may leave a stale lock, recovered above. */
    }
  });
}

// Next 16.3.5's native Windows SWC worker exits with 0xC0000005 on this
// machine. Use its matching WASM compiler with Webpack on Windows only.
// These internal Next switches are version-specific; recheck on upgrades.
if (process.platform === "win32") {
  process.env.NEXT_TEST_WASM = "1";
  process.env.NEXT_TEST_WASM_DIR = path.dirname(
    require.resolve("@next/swc-wasm-nodejs"),
  );
}

require("next/dist/bin/next");
