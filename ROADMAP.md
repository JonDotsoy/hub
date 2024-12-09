## Objective of this document

This document serves as a public declaration of the improvements that will be made to our project. It outlines the key milestones, goals, and timelines for the development and delivery of these enhancements.

## Roadmap

The following roadmap provides an overview of the planned features, their expected release dates, and the current status:

### 🚧 Active

<!--
| Feature | Expected Release Date |
| --- | --- |
| User Interface Updates | Q2 2023 |
| Improved Performance | Q3 2023 |
-->

| Feature | Expected Release Date |
| ------- | --------------------- |

### ⏳ Planned

<!--
| Feature | Status | Expected Completion Date |
| --- | --- | --- |
| Bug Fixing | In Progress | March 15, 2023 |
| New Features Development | In Progress | April 30, 2023 |
-->

| Feature | Status | Expected Completion Date |
| ------- | ------ | ------------------------ |

## Proposals

The following proposal outlines a potential feature and its expected timeline:

<!--
### Proposal: [Insert Proposal Title]

[Description]
-->

### Reflect Polices between hubs

### Proposal: Pull Policies from Local and HTTP Services with Live Updates

This proposal introduces two enhancements to improve policy management:

1. **Support for HTTP/HTTPS Manifest Locations:**

   - Expands the flexibility of `MANIFEST_LOCATION` by allowing you to specify the URL of an HTTP or HTTPS service that provides the policy manifest.
   - This enables retrieving policies from remote servers, centralizing management, and simplifying deployments.

2. **Live Updates using EventSource:**
   - Enables subscribing to policy changes on the remote server, ensuring your application always uses the latest policies.
   - This feature relies on the `X-Content-Refresh` header in the HTTP response to indicate the refresh interval.
   - An `EventSource` is established during the initial policy pull to receive subsequent updates.

**Detailed Description:**

**1. HTTP/HTTPS Manifest Location Support:**

- Modifies the behavior of the `MANIFEST_LOCATION` property to accept URLs starting with `http://` or `https://`.
- When an HTTP/HTTPS location is specified:
  - The application initiates an HTTP request to the provided URL to retrieve the policy manifest.
  - Standard HTTP methods and response codes are used for communication.
  - Error handling should be implemented to gracefully handle unsuccessful retrievals (e.g., network issues, server errors).

**2. Live Updates using EventSource:**

- During the initial policy pull using the HTTP/HTTPS location:
  - Checks the response headers for the presence of the `X-Content-Refresh` header.
  - If the header exists:
    - Extracts the refresh interval (in seconds) from the header value.
    - Creates an `EventSource` object connected to the HTTP/HTTPS location.
    - Sets up a listener to handle incoming policy update events from the server.
    - Upon receiving an update event, the application re-fetches the policy manifest to obtain the latest version.

**Benefits:**

- **Centralized Policy Management:** Remotely store and manage policies, facilitating updates and ensuring consistency across deployments.
- **Improved Efficiency:** Reduces the need for manual updates, keeping applications automatically synchronized with the latest policies.
- **Enhanced Scalability:** Easily scales by adding new policy sources on remote servers without modifying application code.
