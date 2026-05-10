import type { IncomingMessage, ServerResponse } from "http";
import { readProduct } from "../service/product.service";
import type { IProduct } from "../types/product.type";
import { parseBody } from "../utility/parseBody";

export const productController = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  // console.log("Request: ", req);
  const url = req.url;
  const method = req.method;

  //single products
  const urlParts = url?.split("/");
  // console.log(urlParts);
  const id =
    urlParts && urlParts[1] === "products" ? Number(urlParts[2]) : null;
  // console.log("this is actual id: ", id);

  //get all product
  if (url === "/products" && method === "GET") {
    // const products =
    //   {
    //     id: 1,
    //     name: "product-1",
    //   },
    // ];
    const products = readProduct();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Product Retrived Successfully",
        data: products,
      }),
    );
  } else if (method === "GET" && id !== null) {
    //get single product
    const products = readProduct();
    const product = products.find((p: IProduct) => p.id === id);
    // console.log(product);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Product Retrived Successfully",
        data: product,
      }),
    );
  } else if (method === "POST" && url === "/products") {
    const body = await parseBody(req);
    // console.log("Body: ",body);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Product Created Successfully",
        // data: product,
      }),
    );
  }
};
