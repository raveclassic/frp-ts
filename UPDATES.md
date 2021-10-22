# Updates

## 1.0.0.alpha

This release announces major changes in the structure of the library including transition to monorepo,
splitting the monolith into subpackages and reducing core API, rethinking public package APIs etc.

### Reduced core API

Core functionality (`Property`, `Atom`, `Emitter`) is moved to `@frp-ts/core` which aims to provide
a minimal set of functionality for working with the concept of mutable reactive values.

This is the main entry point to the library.
Current npm package `frp-ts` is considered deprecated but might still be used in the future.

The API of the core has also changed:

-   interfaces and types are now reexported from package index together with their namespaces;
-   contents of the namespaces were slightly changed (some functions were moved and some wer renamed),
    please refer to the [API reference](https://raveclassic.github.io/frp-ts/).

### New subpackages

Additional functionality like lenses and integration with fp-ts is moved to corresponding subpackages:

-   `@frp-ts/lens`
-   `@frp-ts/fp-ts`

These packages define `@frp-ts/core` as a strict dependency under a wide semver range, so you don't need to
install it yourself and worry about package duplication, modern package managers should handle hoisting gracefully.

### Misc

The release contains lots of low level updates such updated linter, updated typescript and others.
