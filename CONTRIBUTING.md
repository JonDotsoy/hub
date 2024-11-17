## Packages

The packages are stored on `packages/*`.

### new version

New versions are created on the `develop` branch. the [release.yml](./.github/workflows/release.yml) workflow automates the release process using [`release-please`](https://github.com/googleapis/release-please?#readme).

### Delivery versions

Refer to the [release.yml](./.github/workflows/release.yml) workflow to add new delivery jobs.

Steps for adding a new delivery job:

1. Add a new output to signal the release. For example: https://github.com/JonDotsoy/ondina/blob/81d3618e1ebc63f3d0bcb40a1e45660d36bab651/.github/workflows/release.yml#L16
2. Add a new job for artifact delivery. Sample delivery npm package https://github.com/JonDotsoy/ondina/blob/81d3618e1ebc63f3d0bcb40a1e45660d36bab651/.github/workflows/release.yml#L24-L42
