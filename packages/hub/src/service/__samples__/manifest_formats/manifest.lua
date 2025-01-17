return {
	["permissions"] = {
		"users.list",
		"users.create",
		"users.delete",
		"sales.read",
		"sales.write",
	};
	["roles"] = {
		{
			["id"] = "rrhh";
			["permissions"] = {
				"users.list",
				"users.create",
			};
		},
		{
			["id"] = "admin";
			["permissions"] = {
				"users.list",
				"users.create",
				"users.delete",
			};
		},
	};
	["principals"] = {
		{
			["id"] = "bob";
			["roles"] = {
				"rrhh",
			};
		},
		{
			["id"] = "alice";
			["roles"] = {
				{
					["role"] = "admin";
					["condition"] = {
						["equal"] = {
							"group.office",
							"NY",
						};
					};
				},
			};
		},
	};
};
