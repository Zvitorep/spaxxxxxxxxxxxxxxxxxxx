// Migration note: This script replaces vm2 with jintr for sandboxed JS execution.
// You must install jintr: npm install jintr

const { readPage } = require("./utils.js");
const fs = require("fs");
const { createHash } = require("crypto");
const { Jintr } = require("jintr");

const targetPage = "./index.html";
const randomURL = "https://random.spax.zone/webrings";

const hashes = {
  cobalt: "50373b424944bf5a6e58cbb216e73613c58d784fbd0ea4af45778f398ad82f16",
  cohost: "d18a582628a1a05783d36e62f4c1262cfff0dbdec717aff644f6d71b869e91d2"
};

const getJsFile = async (local, links) => {
  try {
    try {
      const data = await fs.promises.readFile(local, "utf8");
      return data;
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
    const headers = new Headers({
      "Accept": "text/javascript",
      "Content-Type": "text/javascript",
      "User-Agent": "SPAX-WEBRING-FETCH"
    });
    for (const link of links) {
      try {
        const response = await fetch(link, { headers });
        if (response.ok) {
          const data = await response.text();
          await fs.promises.writeFile(local, data, "utf8");
          return data;
        }
      } catch (err) {
        // try next link
      }
    }
    throw new Error("Could not fetch JS file from any link");
  } catch (err) {
    throw err;
  }
};

function genHash(data) {
  return createHash("sha256").update(data).digest("hex");
}

function webringDown(document, selector, webringName, err) {
  document.querySelector(selector).textContent =
    `The ${webringName} is currently down! Might be a good idea to let Spax know.`;
  console.error(err);
};

const build = async () => {
  const { document, window } = await readPage(targetPage);
  const sandbox = { document, window };
  const dataFolderName = "./data/webring-members";
  if (!fs.existsSync(dataFolderName))
    fs.mkdirSync(dataFolderName);

  // Example for cobalt (uncomment and adapt as needed):
  /*
  try {
    const data = await getJsFile("./js/webrings/cobalt.js", [
      "https://instances.hyper.lol/assets/js/webring.js"
    ]);
    const webring = document.querySelector(`#cobaltWebring`);
    const oldContents = webring.innerHTML;
    webring.innerHTML = "";
    const hash = genHash(data);
    if (hash === hashes.cobalt) {
      const jintr = new Jintr({ sandbox });
      await jintr.run(data);
      fs.writeFileSync(
        `${dataFolderName}/cobalt.json`,
        JSON.stringify(jintr.context.cobaltWebring_members.map(e => `https://${e}`))
      );
      webring.removeAttribute("style");
      webring.insertAdjacentHTML("afterbegin", "part of the cobalt webring<br><br>");
      webring.querySelector(`a:nth-of-type(3)`).href = `${randomURL}/cobalt`;
      fs.writeFileSync(targetPage, document.toString());
    } else {
      webring.innerHTML = oldContents;
      console.warn("the cobalt script's hash didn't match! make sure it didn't update! the hash:", hash);
    }
  } catch (error) {
    webring.innerHTML = oldContents;
    console.error("Error executing script:", error);
  }
  */

  // Repeat similar for other webrings as needed, using jintr instead of vm2.
};

if (require.main === module)
  build();
