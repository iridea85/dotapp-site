# dōtapp

La tua scorta di oli, organizzata.

This repository deploys the approved dōtapp build prepared for the root `/` of the future domain https://do-tapp.it/.

The immutable release archive is stored in numbered parts under `deploy-artifacts/`; the Pages workflow reconstructs it, verifies its SHA-256, and publishes its exact contents without rebuilding the application.

Approved source: preview V42, commit `750fe8f326b2e9efa54471596152145aa510a7fd`.
Archive SHA-256: `dcc0b8cc440734f3bf3561ab0e292fc41aa3ad2c8bfa310cb2ec2b554734f20e`.

`base href`, manifest `id`, `start_url` and `scope` target `/`. The temporary github.io repository path is not the final build target.

The sharing URL remains https://iridea85.github.io/scorta-doterra-download/app/ and backups retain the `DOTAPP_BACKUP_V1` format.

No custom domain or DNS configuration is applied here. The legacy repository and site remain independent and unchanged.
