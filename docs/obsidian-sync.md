# Obsidian ↔ Git Sync (VallartaVoxVault)

This guide gets your offline **Obsidian** vault talking to the GitHub repo so:

- Research that Perplexity (or the agent) commits to git **shows up in Obsidian** within a few minutes.
- Notes you write in Obsidian (Inbox, Daily Debriefs, WordLens, Grammar) **flow back to git**, and the running app reads them.

There is no Replit-side daemon, no webhook, no extra service. The whole thing runs through the [Obsidian Git community plugin](https://github.com/Vinzent03/obsidian-git) using GitHub as the meeting point.

---

## How the pieces fit

```
┌─────────────────────────┐         git push/pull         ┌────────────────────────┐
│  Laptop                 │  ◄───────────────────────►   │  GitHub                │
│  ┌───────────────────┐  │                              │  warrenghaad/          │
│  │  Working clone    │  │                              │  TripSpanishTutor      │
│  │  TripSpanishTutor │  │                              │                        │
│  │   └─ VallartaVoxVault/  ◄── Obsidian vault root     │                        │
│  └───────────────────┘  │                              └────────────────────────┘
│        ▲                │                                          ▲
│        │ Obsidian Git plugin                                       │
│        │ (auto-pull every 5 min, auto-commit-push every 10 min)    │
│        ▼                │                                          │
│  Obsidian app           │                                          │
└─────────────────────────┘                                          │
                                                                     │
            Replit dev container ── git push ───────────────────────►┘
            (the running app + agent commits)
```

The vault is **a subfolder of the repo clone** (`VallartaVoxVault/`), not the whole clone. That keeps your vault clean: you only see the twelve numbered folders, not `client/`, `server/`, `node_modules/`, etc.

---

## First-time setup (laptop)

Do this once, on the machine where Obsidian lives.

### 1. Install Obsidian + the Git plugin

1. Install [Obsidian](https://obsidian.md/) if you haven't already.
2. Open Obsidian → **Settings → Community plugins** → **Browse**.
3. Search for **"Obsidian Git"** by Vinzent03 → **Install** → **Enable**.

### 2. Get a GitHub Personal Access Token (PAT)

You need a token for the plugin to push to GitHub.

1. Go to <https://github.com/settings/tokens> → **Generate new token (classic)**.
2. Note: *VallartaVoxVault sync*
3. Expiration: 1 year (or no expiration if you prefer convenience)
4. Scopes: tick only **`repo`**.
5. **Generate token** → copy it immediately (you only see it once). Treat it like a password.

### 3. Clone the repo on your laptop

Open a terminal:

```bash
mkdir -p ~/code
cd ~/code
git clone https://github.com/warrenghaad/TripSpanishTutor.git
cd TripSpanishTutor
```

When git prompts for your GitHub password, paste the **PAT** from step 2 (not your account password). On macOS the credential will be saved to Keychain after the first push so you won't be asked again.

### 4. Open the vault subfolder in Obsidian

This is the important part: you point Obsidian at **`~/code/TripSpanishTutor/VallartaVoxVault/`**, *not* the repo root.

1. In Obsidian: **Open another vault → Open folder as vault**.
2. Choose `~/code/TripSpanishTutor/VallartaVoxVault`.
3. Obsidian will create a `.obsidian/` config folder inside `VallartaVoxVault/`. That folder is gitignored (see below) so your per-machine settings won't pollute the repo.

### 5. Configure Obsidian Git

In Obsidian: **Settings → Community plugins → Obsidian Git**.

Set these values (others can stay default):

| Setting | Value |
|---|---|
| **Vault backup interval (minutes)** | `10` — auto-commit-and-push every 10 minutes if anything changed. |
| **Auto pull interval (minutes)** | `5` — pull from GitHub every 5 minutes. |
| **Auto pull on startup** | `on` |
| **Pull updates on startup** | `on` |
| **Commit message** | `vault: {{date}} {{numFiles}} files` |
| **Commit date format** | `YYYY-MM-DD HH:mm` |
| **List filenames affected by commit in the commit body** | `on` |
| **Disable notifications** | `off` (leave on so you see push/pull confirmations) |
| **Sync method** | `Merge` (rebase can be confusing for non-coders; merge is forgiving) |

Restart Obsidian. The plugin will pull immediately and start its timers.

---

## Day-to-day flow

You barely have to think about it:

- **Open Obsidian** → it pulls the latest from GitHub. Any research Perplexity committed since yesterday appears in `11_Research/`. Auto-built day packs appear in `08_ProjectPacks/`.
- **Type a note** in `00_Inbox/` or anywhere → within 10 minutes the plugin commits and pushes it. The app on Replit will see it on the next read.
- **Closing the laptop / going offline** is fine. When you reopen, the plugin syncs.

---

## Conflict handling (in plain language)

A "conflict" happens when the same line of the same file was edited both in Obsidian and on git (e.g. you edited `learner-profile.md` on the laptop while ChatGPT also edited it through the agent) before either side synced.

When the plugin can't merge automatically, you'll see a notification: **"Conflict in <filename>"**.

What to do:

1. **Open the file in Obsidian.** You'll see something like:

   ```
   <<<<<<< HEAD
   - Mood meter trended high before ordering
   =======
   - Mood meter trended high at customs
   >>>>>>> origin/main
   ```

2. **Decide which version you want** (or merge both into one line). Delete the `<<<<<<<`, `=======`, `>>>>>>>` markers.
3. **Save the file** (Cmd/Ctrl-S).
4. In the Obsidian Git side panel: click **Commit** → **Push**.

That's it. There is no special "resolve" command — you just edit the file like any other note, then commit.

If conflicts feel scary, run the **Source Control View** (Obsidian Git command: *"Open source control view"*) — it gives you a visual diff like a code editor would.

---

## If the laptop has been offline for days

Nothing breaks. When you reopen Obsidian:

1. The plugin pulls everything new from GitHub. This can take 10–30 seconds if there's a lot.
2. If you also made local changes during the offline window, the plugin tries to merge. If it can't, you'll see one or more conflicts — handle each one as above.
3. Once everything is clean, the next auto-push goes out and you're back in sync.

If something feels truly stuck, the safest reset is:

```bash
cd ~/code/TripSpanishTutor
git status              # see what's local
git stash               # tuck local changes aside
git pull --rebase       # get the server state cleanly
git stash pop           # bring local changes back on top
# resolve any conflicts in Obsidian as above
```

Don't run `git reset --hard` or `git push --force` unless you really know what those do — those can erase work.

---

## What's tracked, what's ignored

Inside the vault subfolder:

- **Tracked**: everything in the twelve numbered folders (`00_Inbox/` through `12_Schemas/`).
- **Ignored**: `.obsidian/` itself — your per-machine plugin config, themes, hotkeys, workspace layout. Each machine has its own.

So if you have Obsidian on two computers, they'll share **content** but each can have its own theme and panel layout. That's intentional.

---

## When in doubt: vault-doctor

The repo ships a small script that sanity-checks the vault:

```bash
cd ~/code/TripSpanishTutor
bash scripts/vault-doctor.sh
```

It will report:
- Tracked files inside `VallartaVoxVault/` that live outside the twelve canonical folders (strays).
- Markdown files that look spec-noncompliant (missing frontmatter, missing `kind`, etc.).

Run it whenever something feels off.

---

## Cross-references

- `VallartaVoxVault/01_Constitution/VAULT.md` — folder purposes
- `VallartaVoxVault/01_Constitution/SPEC.md` — content format rules
- `VallartaVoxVault/.obsidian-vault.yml` — machine-readable vault contract
- `scripts/vault-doctor.sh` — health check
