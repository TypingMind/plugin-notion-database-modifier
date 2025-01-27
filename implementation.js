/**
 * Perform a CRUD operation on a Notion database.
 * @param {Object} params - The parameters for the operation.
 * @param {string} params.operation - The CRUD operation to perform: create, read, update, or archive.
 * @param {string} [params.databaseId] - The ID of the Notion database for create and read operations.
 * @param {Array} [params.databaseStructure] - A list of properties in the Notion database structure, used to generate filter or sort criteria..
 * @param {string} [params.pageId] - The ID of the page for update and archive operations.
 * @param {Object} [params.notionProperties] - The properties for create or update operations.
 * @returns {Promise<Object>} - The response data from the Notion API.
 */
async function perform_notion_database_actions(params, userSettings) {
  const { databaseId, operation, databaseStructure = [] } = params;
  const { pluginServer, notionApiKey } = userSettings;

  if (!pluginServer) {
    throw new Error(
      "Missing the Plugin Server URL. Please set it in the plugin settings."
    );
  }

  if (!notionApiKey) {
    throw new Error(
      "Missing the Notion API Key. Please set it in the plugin settings."
    );
  }

  const baseConfigs = {
    pluginServerUrl: pluginServer,
    notionApiKey: notionApiKey,
  };
  try {
    switch (operation) {
      case "create":
        if (!databaseId) {
          throw new Error(
            "Missing the Database Id. Please set it in the plugin settings."
          );
        }

        if (!databaseStructure.length) {
          throw new Error(
            "Missing the Database Structure Properties. Please provide valid structure of your provided database."
          );
        }

        return createPage({
          ...baseConfigs,
          databaseId: databaseId,
          databaseStructure: databaseStructure,
          properties: params.notionProperties ?? [],
        });

      case "update":
        if (!params.pageId) {
          throw new Error("Page id is required for update action");
        }

        if (!databaseStructure.length) {
          throw new Error(
            "Missing the Database Structure Properties. Please provide valid structure of your provided database."
          );
        }

        return updatePage({
          ...baseConfigs,
          pageId: params.pageId,
          databaseStructure: databaseStructure,
          properties: params.notionProperties ?? [],
        });
      case "archive":
        if (!params.pageId) {
          throw new Error("Page id is required for delete action");
        }
        return archivePage({
          ...baseConfigs,
          pageId: params.pageId,
        });
      default:
        throw new Error("Invalid operation type.");
    }
  } catch (error) {
    return { error: error.message };
  }
}

async function createPage({
  notionApiKey,
  pluginServerUrl,
  databaseId,
  properties,
  databaseStructure,
}) {
  const requestBody = {
    notionApiKey: notionApiKey,
    databaseId: databaseId,
    properties: properties,
    databaseStructure: databaseStructure,
  };

  try {
    const response = await fetch(
      `${pluginServerUrl}/notion-database/create-page`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Error create page: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to create page: ${error.message}`);
  }
}

async function updatePage({
  notionApiKey,
  pluginServerUrl,
  pageId,
  properties,
  databaseStructure,
}) {
  const requestBody = {
    notionApiKey: notionApiKey,
    pageId: pageId,
    properties: properties,
    databaseStructure: databaseStructure,
  };

  try {
    const response = await fetch(
      `${pluginServerUrl}/notion-database/update-page`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Error update page: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to update page: ${error.message}`);
  }
}

async function archivePage({ notionApiKey, pluginServerUrl, pageId }) {
  const requestBody = {
    notionApiKey: notionApiKey,
    pageId: pageId,
  };

  try {
    const response = await fetch(
      `${pluginServerUrl}/notion-database/archive-page`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Error archive page: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to archive page: ${error.message}`);
  }
}
