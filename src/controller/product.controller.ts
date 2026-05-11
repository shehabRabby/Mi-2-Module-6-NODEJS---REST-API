import type { IncomingMessage, ServerResponse } from "http";
import { insertProduct, readProduct } from "../service/product.service";
import type { IProduct } from "../types/product.type";
import { parseBody } from "../utility/parseBody";
import { sendResponse } from "../utility/sendResponse";

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

    const products = readProduct();

    try {
      return sendResponse(
        res,
        200,
        true,
        "Product Retrived Successfully",
        products,
      );
    } catch (error) {
      return sendResponse(res, 500, false, "Something went wrong!", error);
    }
  } else if (method === "GET" && id !== null) {
    try {
      //get single product
      const products = readProduct();
      const product = products.find((p: IProduct) => p.id === id);
      // console.log(product);

      //product na paile single error show korabe
      if (!product) {
        return sendResponse(res, 404, false, "Product Not Found", product);
      }

      return sendResponse(
        res,
        200,
        true,
        "Product Retrived Successfully",
        product,
      );
    } catch (error) {
      return sendResponse(res, 500, false, "Something went wrong!", error);
    }
  } else if (method === "POST" && url === "/products") {
    //create product by post method
    let body = await parseBody(req);
    if (typeof body === "string") {
      body = JSON.parse(body);
    }
    const products = readProduct();
    // console.log("Body: ",body);
    const newProduct = {
      id: Date.now(),
      ...body,
    };
    // console.log(newProduct);

    products.push(newProduct);
    // console.log(products);
    insertProduct(products);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Product Created Successfully",
        data: newProduct,
      }),
    );
  } else if (method === "PUT" && id !== null) {
    const body = await parseBody(req);
    const products = readProduct();

    const index = products.findIndex((p: IProduct) => p.id === id);
    // console.log(index);
    if (index < 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          message: "Product Not Found",
          data: null,
        }),
      );
    }
    // console.log(products[index]);
    products[index] = { ...products[index], ...body, id: products[index].id };

    insertProduct(products);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Product Updated Successfuly",
        data: products[index],
      }),
    );
  } else if (method === "DELETE" && id !== null) {
    const products = readProduct();
    const index = products.findIndex((p: IProduct) => p.id === id);
    if (index < 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          message: "Product Not Found",
          data: null,
        }),
      );
    }

    products.splice(index, 1);
    console.log(products);
    insertProduct(products);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        message: "Product Deleted Successfully",
        data: null,
      }),
    );
  }
};
