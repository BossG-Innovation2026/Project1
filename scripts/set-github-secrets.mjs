import { randomBytes } from "node:crypto";
import libsodium from "libsodium-wrappers";

const [owner, repo] = "BossG-Innovation2026/Project1".split("/");
const token = process.env.GH_TOKEN;

if (!token || !owner || !repo) {
  console.error("Missing GH_TOKEN");
  process.exit(1);
}

await libsodium.ready;

const secrets = {
  CLOUDFLARE_API_TOKEN: process.env.CF_TOKEN,
  CLOUDFLARE_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
};

for (const [name, value] of Object.entries(secrets)) {
  if (!value) {
    console.error(`Missing value for ${name}`);
    process.exit(1);
  }
}

export async function setSecret(name, value) {
  const keyRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  );
  if (!keyRes.ok) throw new Error(`public-key ${keyRes.status}`);
  const { key, key_id } = await keyRes.json();
  const keyBuf = Buffer.from(key, "base64");
  const enc = libsodium.crypto_box_seal(Uint8Array.from(Buffer.from(value)), keyBuf);
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/secrets/${name}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        encrypted_value: Buffer.from(enc).toString("base64"),
        key_id,
      }),
    }
  );
  if (res.status !== 201 && res.status !== 204) {
    throw new Error(`${name} ${res.status}: ${await res.text()}`);
  }
  console.log(`Secret set: ${name}`);
}

for (const [name, value] of Object.entries(secrets)) {
  await setSecret(name, value);
}