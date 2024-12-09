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

###

### Proposal: Adding Permission-Based Filtering to the /manifest API

**Description:**
The current Service Hub exposes a `/manifest` API to retrieve all available policies. To optimize performance and reduce memory usage, we propose adding a `permissions` query parameter to this API. This parameter will allow clients to filter the returned policies based on specific permissions they require.

If the `permissions` query parameter is not provided, the API will return all policies as it does currently. However, if a value is provided, the API will only return policies that are related to the specified permissions. This filtering mechanism will significantly reduce the amount of data that needs to be transferred between the client and the server, especially in environments with a large number of policies.

**Benefits:**

- **Improved performance:** By allowing clients to request only the policies they need, we can reduce the amount of data that needs to be processed and transmitted, resulting in faster response times.
- **Reduced memory usage:** Filtering policies based on permissions will reduce the memory footprint of the Service Hub, as it will no longer need to load all policies into memory for every request.
- **Enhanced flexibility:** The `permissions` query parameter provides a more granular way to control which policies are returned to the client, giving developers greater flexibility in their applications.
- **Increased scalability:** As the number of policies grows, the ability to filter policies based on permissions will become increasingly important for maintaining performance and scalability.

**Technical Implementation:**

- **API Endpoint:** `/manifest?permissions=<comma-separated-list-of-permissions>`
- **Data Format:** The API will continue to return policies in the existing JSON format.
- **Filtering Logic:** The backend will implement a filtering algorithm to efficiently identify policies that match the specified permissions.

**Additional Considerations:**

- **Permission Granularity:** Consider the level of granularity at which permissions will be defined. For example, will permissions be defined at the policy level or at a more granular level within a policy?
- **Performance Optimization:** Evaluate the performance implications of the filtering algorithm, especially for large datasets.
- **Error Handling:** Implement appropriate error handling for invalid permission values or other unexpected input.

By adding this permission-based filtering capability to the `/manifest` API, we can significantly improve the performance, scalability, and flexibility of the Service Hub.
