# DESk

Files sorted automatically, documents scanned into clean PDFs, passwords encrypted, devices synced with a QR code.
Everything is stored on the user's own device. No server, no database, no sign-up.

## What's new in 2.5
- **Selecting files**: simple grey rounded checkboxes that fill blue when ticked, and a clean white panel showing the count and size, *Select all*, cancel, and evenly spaced actions with the icon above each label.
- **Moving many files to Hidden** now moves files one at a time. Each copy is checked before the original is removed, and you see a progress bar plus a "Moved n of N" report.
- **Preview**: files fit inside a rounded frame. Swipe left or right, use the arrow buttons, or press ← → to go through the list. The Hidden viewer works the same way, with Unhide / Download / Delete centred.
- **Hidden closes when you leave**: switching tabs or apps, or locking the phone, closes what's open, locks Hidden and the Vault, and takes you back to Home.
- **Scanner**: the camera screen fits any phone, down to iPhone SE / 7 size. Auto capture only fires once a real page is in view, then waits until you move to the next page.

## Put it online with GitHub Pages (free)

1. Create a new **public** repository on GitHub (e.g. `desk`).
2. Upload everything in this folder to the repository root (drag-and-drop on the GitHub website works). Keep the folder structure: `index.html`, `sw.js`, `manifest.webmanifest`, `favicon.ico`, `.nojekyll`, `css/`, `js/`, `icons/` (and `src/` + `build.py` if you want to edit later). `index.html` must be at the top level of the repo.
3. Repository → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → Save.
4. After a minute DESk is live at `https://<your-username>.github.io/desk/`.

Users can install it like an app: browser menu → **Install** / **Add to Home Screen**. It works offline after the first visit.

You can double-click `index.html` to try it on your computer, but sync, share links, the offline app and the camera need the hosted `https://` address.

## How it works

- **First visit**: an immersive landing page (also at `#/about`), then a one-tap welcome — a name, an optional photo and accepting the terms. No email, no password. An existing user can pick *I use DESk on another device* or *Restore from a backup file*.
- **Appearance**: *Settings → Appearance* — System (default), Light or Dark, remembered per device.
- **Locks**: the password vault and Hidden lock the moment you leave the tab or app, and after the idle time you choose.
- **Big uploads**: files are fingerprinted and stored 4 at a time; big files are fingerprinted from samples (not read in full), and thumbnails are made in the background. Progress shows speed, time left and a Cancel button. Before an upload starts DESk compares it with the free space the browser gives it; if it's too big you see exactly how much too big (and which file), with options to add what fits, save to an SD card / USB drive, or free up space. If storage fills up part-way, DESk stops cleanly and lists what didn't fit.
- **Phone photos, including the iPhone Hidden album**: *From Photos* (Files and Hidden) opens the system photo picker. On iPhone/iPad, turn on *Settings › Apps › Photos › Show Hidden Album*; the picker then shows *Hidden* after Face ID / Touch ID. Big videos going into DESk's Hidden folder are encrypted in 8 MB pieces so they never need to fit in memory. On Android, Google Photos' Locked Folder is blocked by Android for all apps; installed DESk appears in the **Share** menu so you can send files straight in.
- **Everything local**: files, scans, hidden items, the vault and settings live in the browser's IndexedDB. *Settings → Erase this device* wipes it.
- **Sync your devices (no account)** — the same model as BAZINGA!: *Devices → Link a device* shows a QR code, a link and an 8-character short code (works once for 15 minutes; short link `…/#/c/K7M2Q9XA`). Scan / open / type it on another phone, computer or browser and they stay in sync. Rename, pause or remove any device; *Stop syncing this device*; *Turn off sync everywhere*.
- **Share links**: any file up to 15 MB becomes a short encrypted link + QR code (`…/#/s/<id>/<key>`). The key is only in the part after `#`, which browsers never send to a server.

## External storage (SD cards, USB flash drives, external disks)

*Settings → External storage → Add a drive or folder*: pick a folder on the drive once and DESk remembers it. Whenever the drive is plugged in you can:
- **Save to drive** — select files (or open one) and choose *Save to drive*. Files go to `DESk/<folder>/<name>` on the drive, matching DESk's sorting. Files already there with the same size are skipped.
- **Move to drive** — *Clean up* → select files → *Move to drive*: copied to the drive, then removed from DESk to free space.
- **Back up** — copies every file to the drive. Turn on *Copy new files automatically when connected* to keep it up to date.
- **Import** — reads files from the drive back into DESk (they're sorted again on the way in).

This uses the browser's folder access, available in **Chrome, Edge and Opera on computers and Chromebooks**. Phones and other browsers don't allow apps to keep a drive linked, so there *Save to drive* opens the system share/save sheet, where you pick the SD card or USB drive (Android: Files › SD card; iPhone/iPad: Save to Files › your drive). DESk shows these steps on the device.

## Add to home screen

- **One-tap install**: on Chrome, Edge, Samsung Internet and Android, DESk shows an *Install DESk* bar (and buttons on the landing page, Home and Settings). One tap opens the browser's install dialog — browsers always ask you to confirm, so that's as automatic as the web allows. iPhone/iPad Safari has no install API, so the button shows the 3 Share → Add to Home Screen steps.

The manifest, icons (192, 512, maskable, Apple touch icon) and offline service worker are included, so DESk installs with its blue paperclip icon and opens full-screen:
- **Android / Chrome / Edge**: DESk shows an *Install* / *Add to home screen* button (landing page, Home and Settings) that opens the browser's install prompt.
- **iPhone / iPad**: the same button shows the Safari steps (Share → Add to Home Screen).

## Device sync — nothing to set up

Devices pass data to each other through the free public relay **ntfy.sh**, encrypted on the device first (AES-GCM; the relay only sees unreadable bytes under a random topic name derived from the sync key).

- **What syncs:** file list, folders, tags, favorites, Trash and permanent deletes; scans; settings; name & photo; the encrypted password vault (can be turned off). Changes go out within seconds as small updates, and open devices hear about them straight away over a live connection. A full copy is re-sent every ~2 hours.
- **File contents** travel in encrypted parts. New files are offered to your other devices automatically; a device that's missing a file asks for it and any linked device that has it answers. Each device chooses how large a file it downloads automatically (*Devices → This device downloads*, default 10 MB); bigger files download when opened.
- **Hidden files never leave the device.**
- Copies on ntfy.sh expire after about **3 hours**, so a file sent while another device was closed is re-sent when that device asks for it. The device that has the file must be open at some point while the other one is.
- ntfy.sh is a free community service with fair-use limits (roughly a few hundred messages per day per visitor and ~2 MB per attachment; DESk splits files into 1.5 MB parts and shrinks them if needed). That's plenty for documents, photos and the file list. For heavy use (lots of large videos) run your own relay:

### Use your own relay (optional)

Run an [ntfy server](https://docs.ntfy.sh/install/) (it's a single binary or Docker container) and set its address in `index.html`:

```html
window.DESK_CONFIG = Object.assign({ syncRelay: 'https://ntfy.example.com', relayMaxMB: 50 }, window.DESK_CONFIG || {});
```

Edit `src/index.template.html` too (then run `python3 build.py`) so the change survives rebuilds. `relayMaxMB` is the largest file sent through the relay (sync and share links).

## Editing the code

The readable source is in `src/`:

| File | What's in it |
|---|---|
| `core.js` | helpers, icons, IndexedDB storage, encryption, zip & PDF writers, dialogs, downloads |
| `qr.js` | built-in QR code maker (from BAZINGA!) |
| `files.js` | auto-sorting, batch upload, file views, preview |
| `scan.js` | document scanner (edge detection, perspective correction, clean-up filters, multi-page PDFs, review & crop editor) |
| `vault.js` | password manager and Hidden folder |
| `sync.js` | device linking & encrypted relay sync, share links, QR scanning, backup files |
| `devices.js` | Devices page, link/join dialogs, share dialog and share landing page |
| `views.js` | Home, Insights, Clean up |
| `drives.js` | SD cards, USB drives and external disks |
| `landing.js` | splash, landing page, welcome screen |
| `shell.js` | Settings, navigation, routes (`#/home`, `#/files`, …), events, start-up |

After changing anything in `src/` (or `css/app.css`), run:

```
python3 build.py
```

It regenerates `js/desk.js`, `index.html` and `sw.js` with fresh version stamps, so installed copies update themselves the next time they're opened. Then upload the changed files.

## Browser notes

- **Live camera scanning** needs `https://` (GitHub Pages is fine). On any browser you can also scan from photos.
- **Deleting files in folders on your computer** (Clean up → Clean a folder) needs Chrome or Edge on a desktop. Other browsers can analyze a folder but not delete from it.
- **Share via apps** uses the phone's share sheet where the browser supports sharing files.

## Credits

- QR code reading: [jsQR](https://github.com/cozmo/jsQR) (Apache-2.0, `js/jsQR-LICENSE.txt`), loaded only when scanning a code.
- QR code maker and the sync design: BAZINGA! by Abbel Dawit.
