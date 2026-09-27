# How to download and run Happy Abs Club

This is a small static website. You do **not** need to buy anything, create an account, or run `npm install` to preview it locally.

## 1. Download the files

1. Open the [Workoutprogram GitHub repository](https://github.com/aidenmar21/Workoutprogram).
2. Click the green **Code** button, then **Download ZIP**.
3. Unzip the download. Open the extracted `Workoutprogram-main` folder. You should see `README.md`, `start-local.js`, and a `dist` folder.

If you already use Git, you can instead run:

```bash
git clone https://github.com/aidenmar21/Workoutprogram.git
cd Workoutprogram
```

## 2. Start the site

You need [Node.js](https://nodejs.org/en/download) installed. To check, open Terminal (macOS) or PowerShell (Windows) and run `node --version`. If that command is not found, install Node.js from the link and reopen Terminal/PowerShell.

Open a terminal **inside that extracted folder**:

- **Windows:** Open the folder in File Explorer, click the address bar, type `powershell`, and press Enter.
- **macOS:** Open Terminal, type `cd ` (with a space), drag the extracted folder into Terminal, and press Enter.

Run:

```bash
node start-local.js
```

Open **http://127.0.0.1:4173** in your browser. Leave the terminal open while using the site. Press **Ctrl+C** in the terminal to stop it.

## Good to know

- There is no build step and no package installation. The website files are in `dist/`.
- Workout progress, notes, and creator drafts are saved in **that browser on that device**, not in an online account. Use **My journey → Export my progress** if you want a copy.
- The 14-day videos are placeholders until Eliana adds them. The 30-day interactive routines are a working adaptation that still needs checking against the final paid guide.
- The current purchase button opens Gumroad; running the site locally does not set up payments or paid access.
