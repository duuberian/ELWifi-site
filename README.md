# ELWifi download site

Static product site for ELWifi. Serve this directory from any static host:

```sh
python3 -m http.server 8080 --directory website
```

The download button points to the stable `downloads/ELWifi.dmg` URL.

To rebuild the DMG from `build/ELWifi.app`:

```sh
chmod +x scripts/build-dmg.sh
./scripts/build-dmg.sh
```

Every push to `main` runs `.github/workflows/publish.yml`, rebuilds the DMG, commits the refreshed download and checksum, and deploys this directory to GitHub Pages. The stable download URL does not change between releases.

When the app version changes, update the visible version copy in `website/index.html`.
