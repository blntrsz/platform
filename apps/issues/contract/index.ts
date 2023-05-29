/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/issues": {
    /** @description Receive all issues */
    get: operations["getIssues"];
    /** @description Create issue */
    post: operations["postIssues"];
    options: {
      responses: {
        /** @description Default response */
        200: never;
      };
    };
  };
  "/issues/{userId}": {
    /** @description Receive all issues for the user */
    get: operations["getIssuesForUserId"];
    options: {
      responses: {
        /** @description Default response */
        200: never;
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /** Issues */
    IssuesResponse: ({
        id: number;
        title: string;
        userName: string;
        userId: number;
      })[];
    /** Issues */
    IssuesRequest: {
      title: string;
      userName: string;
      userId: number;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

  /** @description Receive all issues */
  getIssues: {
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["IssuesResponse"];
        };
      };
    };
  };
  /** @description Create issue */
  postIssues: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["IssuesRequest"];
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": {
            status: string;
          };
        };
      };
    };
  };
  /** @description Receive all issues for the user */
  getIssuesForUserId: {
    parameters: {
      path: {
        userId: number;
      };
    };
    responses: {
      /** @description OK */
      200: {
        content: {
          "application/json": components["schemas"]["IssuesResponse"];
        };
      };
    };
  };
}
