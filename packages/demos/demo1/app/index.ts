const HUB_URL = process.env.HUB_URL;

const readSales = async (principalId: string) => {
  const res = await fetch(new URL("./is-allowed", HUB_URL), {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      principalId,
      action: "sales.read",
    }),
  });

  const validation = await res.json();

  if (!validation.allowed) return null;

  return {
    sales: [
      {
        id: "1",
        name: "Laptop",
        price: 1200,
        date: new Date("2024-01-20"),
      },
      {
        id: "2",
        name: "Keyboard",
        price: 75,
        date: new Date("2024-01-21"),
      },
      {
        id: "3",
        name: "Mouse",
        price: 25,
        date: new Date("2024-01-22"),
      },
      {
        id: "4",
        name: "Monitor",
        price: 300,
        date: new Date("2024-01-23"),
      },
      {
        id: "5",
        name: "Webcam",
        price: 50,
        date: new Date("2024-01-24"),
      },
    ],
  };
};

const parseAuthorization = (authorization: null | string) => {
  if (!authorization) return null;
  const [authScheme, authorizationParameters] = authorization.split(" ");
  if (authScheme !== "Basic") return null;
  const [username, password] = atob(authorizationParameters).split(":");
  return { username, password };
};

const server = Bun.serve({
  port: 3000,
  fetch: async (req) => {
    const url = new URL(req.url);
    const authorization = parseAuthorization(req.headers.get("authorization"));
    console.log("🚀 ~ fetch: ~ authorization:", authorization);

    if (url.pathname === "/") {
      const nextUrl = new URL(url);
      nextUrl.pathname = "/app";
      return Response.redirect(nextUrl);
    }

    if (url.pathname === "/app")
      return new Response(Bun.file("./app.html"), {
        headers: { "content-type": "text/html" },
      });

    if (!authorization)
      return new Response(null, {
        status: 401,
      });

    if (url.pathname === "/api/sales") {
      const sales = await readSales(authorization.username);
      if (!sales) return new Response(null, { status: 401 });
      return Response.json(sales);
    }

    if (url.pathname === "/stat")
      return Response.json({
        authorization,
      });

    return new Response(null, { status: 404 });
  },
});

console.log(`Server ready on ${server.url}`);
