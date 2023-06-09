# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-beta.4](https://github.com/raveclassic/frp-ts/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2023-06-09)


### Bug Fixes

* **util:** fix memoization for functions dropping their arguments to 0 ([41ddc7f](https://github.com/raveclassic/frp-ts/commit/41ddc7f9ba98cab17cc855c203be44c4a363e86b))


### Features

* **core:** async iterators ([#70](https://github.com/raveclassic/frp-ts/issues/70)) ([6c2dac9](https://github.com/raveclassic/frp-ts/commit/6c2dac9df9477aa12af156d2612f4691ca0cef54))





# [1.0.0-beta.3](https://github.com/raveclassic/frp-ts/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-09-08)


### Features

* **react:** Use sync external store ([#69](https://github.com/raveclassic/frp-ts/issues/69)) ([d287d2c](https://github.com/raveclassic/frp-ts/commit/d287d2cc7c2099c60794f7407eaa15a9f9e8d390))


### BREAKING CHANGES

* **react:** change required react peer dependency to >=16.8.0





# [1.0.0-beta.2](https://github.com/raveclassic/frp-ts/compare/v1.0.0-beta.0...v1.0.0-beta.2) (2022-07-29)


### Bug Fixes

* **core:** bringing back lazy behavior for combine ([#66](https://github.com/raveclassic/frp-ts/issues/66)) ([4598adb](https://github.com/raveclassic/frp-ts/commit/4598adb2dc89e9188724a278377f70cfae6564bf))


### Features

* **core:** skip duplicates on push in combine ([#67](https://github.com/raveclassic/frp-ts/issues/67)) ([645970f](https://github.com/raveclassic/frp-ts/commit/645970fc17bc886da54cdda60b40daccee1d5e86))





# [1.0.0-beta.1](https://github.com/raveclassic/frp-ts/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-25)

**Note:** Version bump only for package frp-ts





# [1.0.0-beta.0](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.16...v1.0.0-beta.0) (2022-07-23)


### Bug Fixes

* **core:** combine lost notification of middle node ([#61](https://github.com/raveclassic/frp-ts/issues/61)) ([2b022b5](https://github.com/raveclassic/frp-ts/commit/2b022b5242944dc49a61dc3a7648a2834297cd70))
* **lens:** lensed atom distinct changes ([#57](https://github.com/raveclassic/frp-ts/issues/57)) ([d56fd2b](https://github.com/raveclassic/frp-ts/commit/d56fd2b690bf651d46e49a394429860279b79c61))


### Features

* **core:** add fromInteropObservable to observable namespace ([9390892](https://github.com/raveclassic/frp-ts/commit/9390892b917545b6b098654f57fa971d1ae071b2))
* **react:** useObservable ([b23f772](https://github.com/raveclassic/frp-ts/commit/b23f7728a28fe98ffa60f23a75ebd8a18d6895ad))
* **test-utils:** newAdapter ([3f6c3cc](https://github.com/raveclassic/frp-ts/commit/3f6c3cc057749f431c9e7491038872ae4e9dea0d))





# [1.0.0-alpha.16](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.15...v1.0.0-alpha.16) (2022-05-21)


### Performance Improvements

* **utils, core:** perf improvements ([#55](https://github.com/raveclassic/frp-ts/issues/55)) ([1d48d2d](https://github.com/raveclassic/frp-ts/commit/1d48d2d7638b1129b6cc884719f99b52001f6686))





# [1.0.0-alpha.15](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.14...v1.0.0-alpha.15) (2022-04-07)


### Bug Fixes

* **react:** fix race condition in usePropertyFromProp ([#50](https://github.com/raveclassic/frp-ts/issues/50)) ([859e4c5](https://github.com/raveclassic/frp-ts/commit/859e4c5f9590cd1408fa6351af02fb4a8e60f205))





# [1.0.0-alpha.14](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.13...v1.0.0-alpha.14) (2022-03-24)


### Bug Fixes

* **react:** resolve bad `setState` in `usePropertyFromProps` ([#49](https://github.com/raveclassic/frp-ts/issues/49)) ([a0c83f9](https://github.com/raveclassic/frp-ts/commit/a0c83f9fb87aaf16fffe52f6891d88d75f8c9b56))





# [1.0.0-alpha.13](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.12...v1.0.0-alpha.13) (2022-01-21)


### Bug Fixes

* **core:** fix property.combine emission to skip duplicates in result ([#42](https://github.com/raveclassic/frp-ts/issues/42)) ([ff1436e](https://github.com/raveclassic/frp-ts/commit/ff1436ed575033c1c16210687b55525b4e459f9b))


### BREAKING CHANGES

* **core:** emitter.mergeMany does not multicast anymore





# [1.0.0-alpha.12](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.11...v1.0.0-alpha.12) (2022-01-17)


### Bug Fixes

* **react:** `useProperty` didn't subscribed in `Strict` mode ([#31](https://github.com/raveclassic/frp-ts/issues/31)) ([9898edc](https://github.com/raveclassic/frp-ts/commit/9898edc89c26eabfa55b33cd5d8fc3ed8e3815fc))


### Features

* Remove env and add actions ([#33](https://github.com/raveclassic/frp-ts/issues/33)) ([a6bcec7](https://github.com/raveclassic/frp-ts/commit/a6bcec79884d8a36e05511fbae817a963fa21a5f))


### BREAKING CHANGES

* all functions requiring Env now don't need it, some functions were removed





# [1.0.0-alpha.11](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.10...v1.0.0-alpha.11) (2022-01-14)


### Bug Fixes

* **core:** add readonly for `Symbol.observable` to `property` ([abcf21e](https://github.com/raveclassic/frp-ts/commit/abcf21e69d0fcaecfde289c85d216238010d850b))
* fix lockfile ([af803aa](https://github.com/raveclassic/frp-ts/commit/af803aac26064cb54f86bba20ec4bafdacee6cb6))


### Features

* **core:** add compatibility with `RxJs` and `Most` ([6df5739](https://github.com/raveclassic/frp-ts/commit/6df573965657eef311b43559e840bf94fe23f188))
* **core:** add constructor for `property` & remove interop export ([282abef](https://github.com/raveclassic/frp-ts/commit/282abefa4e38d9cd6b10be2f48ac1c85144345c4))
* **fp-ts:** migrate to new signature ([1005889](https://github.com/raveclassic/frp-ts/commit/100588929eafb592c2ba382242f3bf83ec23d497))
* **lens:** migrate to new signature ([fa6e5d1](https://github.com/raveclassic/frp-ts/commit/fa6e5d159b47fbe40c303b48ab01a8a08fd4caeb))





# [1.0.0-alpha.10](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.9...v1.0.0-alpha.10) (2021-12-28)

**Note:** Version bump only for package frp-ts





# [1.0.0-alpha.9](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.8...v1.0.0-alpha.9) (2021-12-28)

**Note:** Version bump only for package frp-ts





# [1.0.0-alpha.8](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.7...v1.0.0-alpha.8) (2021-12-24)

**Note:** Version bump only for package frp-ts





# [1.0.0-alpha.7](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.6...v1.0.0-alpha.7) (2021-12-24)

**Note:** Version bump only for package frp-ts





# [1.0.0-alpha.6](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.5...v1.0.0-alpha.6) (2021-12-24)

**Note:** Version bump only for package frp-ts





# [1.0.0-alpha.5](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.4...v1.0.0-alpha.5) (2021-12-21)


### Bug Fixes

* **react:** add `useProperties` re-export from index.ts ([95efde4](https://github.com/raveclassic/frp-ts/commit/95efde4dcc9f3537cf38a224a22db1f7bd147b6e))





# [1.0.0-alpha.4](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2021-12-21)


### Features

* **react:** add `useProperties` hook for multiple properties ([3f0e366](https://github.com/raveclassic/frp-ts/commit/3f0e366270a1e01115d2bb45077aafd82b88b6fa))





# [1.0.0-alpha.3](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2021-12-17)


### Bug Fixes

* **react:** fix incorrect imports from src ([73e78a4](https://github.com/raveclassic/frp-ts/commit/73e78a48adc6ac1b8a813dab768994a87e89ed53))





# [1.0.0-alpha.2](https://github.com/raveclassic/frp-ts/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2021-12-17)


### Bug Fixes

* **react:** fix useProperty ([809a9b2](https://github.com/raveclassic/frp-ts/commit/809a9b2a5baf53debeabde6915dd0a9b67778ff3))


### Features

* **react:** add usePropertyFromProps hook ([5e026b1](https://github.com/raveclassic/frp-ts/commit/5e026b17c14601ffe15153da377dbc14cc92bd26))





# [1.0.0-alpha.1](https://github.com/raveclassic/frp-ts/compare/v0.0.1...v1.0.0-alpha.1) (2021-11-17)


### Features

* **react:** add @frp-ts/react package ([ec274ea](https://github.com/raveclassic/frp-ts/commit/ec274eaffd32a2b9bdf49a8729046ba4d1cf8881))





# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.2](https://github.com/raveclassic/frp-ts/compare/v0.0.1...v0.0.2) (2020-06-08)

### 0.0.1 (2020-06-08)


### Features

* add fromEvent ([3285a46](https://github.com/raveclassic/frp-ts/commit/3285a463878fef14ec512df8803e364bbd26727c))
* initial ([51eac97](https://github.com/raveclassic/frp-ts/commit/51eac97a89822ceea7d30f66ea1a16f6f239888b))
* support batch modifications in atoms ([8600d7a](https://github.com/raveclassic/frp-ts/commit/8600d7a1a4b95ecb714a77d1701f9e7abe7ed559))
* support viewing of atoms with lenses ([a093b34](https://github.com/raveclassic/frp-ts/commit/a093b348557933592334416f4a5abf68d28cfcfd))
* take Functor instead of Observable ([c1c7b3e](https://github.com/raveclassic/frp-ts/commit/c1c7b3ea4f165d2ac50ca10d36a175392a6b508c))
* use Observer instead of Listener ([e86105d](https://github.com/raveclassic/frp-ts/commit/e86105d36b7147a1ba562a6c27c86bfd7fc31af6))
