export const serviceProtoobject = {
  "file": [
    {
      "name": "root.proto",
      "messageType": [
        {
          "name": "Body",
          "field": [
            {
              "name": "principalId",
              "number": 1,
              "label": "LABEL_OPTIONAL",
              "type": "TYPE_STRING",
              "options": {
                "packed": true
              }
            },
            {
              "name": "resourceJson",
              "number": 2,
              "label": "LABEL_OPTIONAL",
              "type": "TYPE_STRING",
              "options": {
                "packed": true
              },
              "oneofIndex": 0
            },
            {
              "name": "action",
              "number": 3,
              "label": "LABEL_OPTIONAL",
              "type": "TYPE_STRING",
              "options": {
                "packed": true
              }
            }
          ],
          "oneofDecl": [
            {
              "name": "_resourceJson"
            }
          ]
        },
        {
          "name": "Validation",
          "field": [
            {
              "name": "allowed",
              "number": 1,
              "label": "LABEL_OPTIONAL",
              "type": "TYPE_BOOL",
              "options": {
                "packed": true
              }
            }
          ]
        }
      ],
      "service": [
        {
          "name": "HubService",
          "method": [
            {
              "name": "isAllowed",
              "inputType": ".Body",
              "outputType": ".Validation"
            }
          ]
        }
      ]
    }
  ]
}

