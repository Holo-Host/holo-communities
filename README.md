# hylo-evo

## Getting Started

1. `git clone git@github.com:Hylozoic/hylo-evo.git`
2. `cd hylo-evo`

## Running local:

1. `yarn install`
2. `yarn start`

## Building for standard Hylo API deployment

1. Run `yarn build`
2. Once complete Hylo is ready to be served at `<projectRoot>/build`

## Building for Holochain

1. Optionally set `HOLOCHAIN_BUILD_PATH` in your local `.env` file. Defaults to `<projectRoot>/build-hc`
2. Run `yarn build:hc`
3. Once complete Hylo+Holochain is ready to be served at `<HOLOCHAIN_BUILD_PATH>`

## Further documentation

So long as this repo remains private, remaining docs are available in [Confluence](https://hylozoic.atlassian.net/wiki/spaces/DEV/pages/87195649/Web+Client).

## License

Cryptographic Autonomy License version 1.0

[CAL-1.0](https://github.com/holochain/cryptographic-autonomy-license/blob/master/README.md)
