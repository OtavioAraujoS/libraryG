import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import edge from "selenium-webdriver/edge.js";
import fs from "fs";
import path from "path";

const ENV_PATH = path.resolve(process.cwd(), ".env");

function updateEnvFile(updates) {
  let envContent = "";
  if (fs.existsSync(ENV_PATH)) {
    envContent = fs.readFileSync(ENV_PATH, "utf-8");
  }

  for (const [key, value] of Object.entries(updates)) {
    if (!value) continue;
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}="${value}"`);
    } else {
      envContent = envContent.trimEnd() + `\n${key}="${value}"\n`;
    }
  }

  fs.writeFileSync(ENV_PATH, envContent, "utf-8");
  console.log("Arquivo .env atualizado com sucesso!");
}

async function createDriver() {
  console.log("Inicializando o navegador com Selenium...");

  try {
    const edgeOptions = new edge.Options();
    edgeOptions.addArguments("--disable-blink-features=AutomationControlled");
    edgeOptions.addArguments("--start-maximized");
    return await new Builder()
      .forBrowser("MicrosoftEdge")
      .setEdgeOptions(edgeOptions)
      .build();
  } catch (edgeError) {
    console.log("Edge não disponível, tentando Chrome...", edgeError.message);
    const chromeOptions = new chrome.Options();
    chromeOptions.addArguments("--disable-blink-features=AutomationControlled");
    chromeOptions.addArguments("--start-maximized");
    return await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(chromeOptions)
      .build();
  }
}

async function main() {
  let driver;
  try {
    driver = await createDriver();

    console.log("\n=======================================================");
    console.log(" Abrindo página de login da Steam...");
    console.log(
      " Por favor, realize o login (via QR Code no app Steam ou usuário/senha)",
    );
    console.log("=======================================================\n");

    await driver.get("https://store.steampowered.com/login/");

    const timeoutMs = 180000; // 3 minutos
    const startTime = Date.now();
    let accessToken = null;
    let steamId = null;

    while (Date.now() - startTime < timeoutMs) {
      const currentUrl = await driver.getCurrentUrl();

      if (!currentUrl.includes("/login")) {
        console.log("Login detectado! Extraindo tokens da sessão Steam...");

        const result = await driver.executeAsyncScript((callback) => {
          fetch(
            "https://store.steampowered.com/pointssummary/ajaxgetasyncconfig",
          )
            .then((r) => r.json())
            .then((data) => {
              const token = data?.data?.webapi_token || null;
              callback({ success: true, token, data });
            })
            .catch((err) => callback({ success: false, error: err.message }));
        });

        if (result && result.token) {
          accessToken = result.token;
          console.log(
            "Token de acesso (STEAM_ACCESS_TOKEN) obtido com sucesso!",
          );
          break;
        }
      }

      await driver.sleep(2000);
    }

    if (!accessToken) {
      throw new Error(
        "Tempo limite de login esgotado ou token não encontrado.",
      );
    }

    const cookies = await driver.manage().getCookies();
    const loginSecureCookie = cookies.find(
      (c) => c.name === "steamLoginSecure",
    );
    if (loginSecureCookie) {
      const decoded = decodeURIComponent(loginSecureCookie.value);
      const match = decoded.match(/^(\d{17})/);
      if (match) {
        steamId = match[1];
        console.log(`Steam ID identificado: ${steamId}`);
      }
    }

    console.log("Consultando grupo familiar via IFamilyGroupsService...");
    let familyGroupId = null;
    try {
      const familyRes = await driver.executeAsyncScript((token, callback) => {
        fetch(
          `https://api.steampowered.com/IFamilyGroupsService/GetFamilyGroupForUser/v1/?access_token=${token}&include_family_group_response=true`,
        )
          .then((r) => r.json())
          .then((data) => callback({ success: true, data }))
          .catch((err) => callback({ success: false, error: err.message }));
      }, accessToken);

      if (
        familyRes?.data?.response?.family_groupid ||
        familyRes?.data?.response?.family_group?.family_groupid
      ) {
        familyGroupId = String(
          familyRes.data.response.family_group?.family_groupid ??
            familyRes.data.response.family_groupid,
        );
        console.log(`ID do Grupo Familiar encontrado: ${familyGroupId}`);
      }
    } catch (familyErr) {
      console.log(
        "Não foi possível consultar grupo familiar:",
        familyErr.message,
      );
    }

    const envUpdates = {
      STEAM_ACCESS_TOKEN: accessToken,
    };
    if (familyGroupId) {
      envUpdates.STEAM_FAMILY_GROUP_ID = familyGroupId;
    }
    if (steamId) {
      envUpdates.STEAM_ID = steamId;
    }

    updateEnvFile(envUpdates);

    console.log("\n=======================================================");
    console.log(" Autenticação concluída!");
    console.log(" O .env foi atualizado com as credenciais da Família Steam.");
    console.log(" Agora você pode executar a sincronização na aplicação!");
    console.log("=======================================================\n");
  } catch (error) {
    console.error("Erro durante a automação com Selenium:", error.message);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

main();
