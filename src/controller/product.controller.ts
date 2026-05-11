import type { IncomingMessage, ServerResponse } from "http";
import { insertProduct, readProduct } from "../service/product.service";
import type { IProduct } from "../types/product.type";
import { parseBody } from "../utility/parseBody";
import { sendResponse } from "../utility/sendResponse";

export const productController = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  const url = req.url;
  const method = req.method;

  const urlParts = url?.split("/");
  const id =
    urlParts && urlParts[1] === "products" ? Number(urlParts[2]) : null;

  // GET all products
  if (url === "/products" && method === "GET") {
    try {
      const products = readProduct();
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
  }

  // GET single product
  else if (method === "GET" && id !== null) {
    try {
      const products = readProduct();
      const product = products.find((p: IProduct) => p.id === id);

      if (!product) {
        return sendResponse(res, 404, false, "Product Not Found", null);
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
  }

  // POST create product
  else if (method === "POST" && url === "/products") {
    try {
      let body = await parseBody(req);
      if (typeof body === "string") {
        body = JSON.parse(body);
      }
      const products = readProduct();
      const newProduct = {
        id: Date.now(),
        ...body,
      };

      products.push(newProduct);
      insertProduct(products);

      return sendResponse(
        res,
        201, // 201 is better for creation
        true,
        "Product Created Successfully",
        newProduct,
      );
    } catch (error) {
      return sendResponse(res, 400, false, "Invalid product data", error);
    }
  }

  // PUT update product
  else if (method === "PUT" && id !== null) {
    try {
      let body = await parseBody(req);
      if (typeof body === "string") {
        body = JSON.parse(body);
      }
      const products = readProduct();
      const index = products.findIndex((p: IProduct) => p.id === id);

      if (index < 0) {
        return sendResponse(res, 404, false, "Product Not Found", null);
      }

      products[index] = { ...products[index], ...body, id: products[index].id };
      insertProduct(products);

      return sendResponse(
        res,
        200,
        true,
        "Product Updated Successfully",
        products[index],
      );
    } catch (error) {
      return sendResponse(res, 500, false, "Update failed", error);
    }
  }

  // DELETE product
  else if (method === "DELETE" && id !== null) {
    try {
      const products = readProduct();
      const index = products.findIndex((p: IProduct) => p.id === id);

      if (index < 0) {
        return sendResponse(res, 404, false, "Product Not Found", null);
      }

      products.splice(index, 1);
      insertProduct(products);

      return sendResponse(res, 200, true, "Product Deleted Successfully", null);
    } catch (error) {
      return sendResponse(res, 500, false, "Delete failed", error);
    }
  }
};
