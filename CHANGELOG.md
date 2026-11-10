# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Connect sales, customers, purchases, analytics and the dashboard to the web services.

## [0.1.0] - 2026-11-10

### Added

- `.env.development` pointing to the local web services and `.env.production` pointing to the deployed web services.
- Sign up and sign in through `/users` and `/sessions`.
- Catalog and inventory connected to the web services; a supplier is required when registering a product.
- Profile edition through `PUT /users/{id}`, including the phone number.

### Changed

- The IAM, catalog, inventory and profile modules use the PetStock web services instead of the json-server fake API.
