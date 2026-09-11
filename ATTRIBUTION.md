# Attribution

This application continues Nagi / nagisanzenin's Trưa Nay Ăn Gì. Original Git history, authorship and community contributions are preserved. Walter authorized reusing the source, food artwork and data within this project.

The frontend was adapted from the Trưa Nay Ăn Gì web implementation; no private repository Git history is published.

## Third-party assets

- **Food photos**: lunch atlases (`public/food-*.webp`) and per-item stills (`public/items/`) cloned from the public [truanayangi.com/dishes](https://truanayangi.com/dishes) catalog, with Walter's authorization to reuse food artwork. Rebuild with `python3 tools/dishes/import.py`.
- **3D case model**: ["CS:GO Case"](https://sketchfab.com/3d-models/csgo-case-1d0b7a108aa64a3394ae21c88b8ae23f) by [artfreex](https://sketchfab.com/artfreex), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Modified: converted from FBX to glTF/GLB, mesh quantized, textures resized to 1024 px and re-encoded as WebP, and recolored per case at runtime. Shipped as `public/models/csgo-case.v1.glb`.
- **Font**: [Saira](https://github.com/Omnibus-Type/Saira) by Omnibus-Type, SIL Open Font License 1.1, self-hosted via `@fontsource-variable/saira`.
- **3D runtime**: [three.js](https://threejs.org/) and [@react-three/fiber](https://github.com/pmndrs/react-three-fiber), MIT.
- **CS-style sounds**: https://github.com/sourcesounds/csgo. Original game assets and sounds remain subject to their respective owners' rights. CS-inspired mechanics reference https://github.com/Desynci/CSGO_Panorama_Code.pbin.
- **Layout**: the inventory and "Unlock Container" screens are inspired by Counter-Strike 2's UI. No Valve artwork, fonts or logos are used. This is a fan-made project, not affiliated with Valve.
- **18+ case names and illustrations**: well-known position titles and supplied reference stills from the [Men's Health position guide](https://www.menshealth.com/sex-women/a19547362/45-sex-positions-guys-should-know/). The illustrations retain their embedded Allie Folino credit; descriptions in this app are original. The supplied set does not include an illustration for “The Fusion”, so that item keeps the local heart placeholder.

Public source visibility does not itself grant a new blanket license for third-party assets. No new license is imposed on existing contributions or assets by this migration.
