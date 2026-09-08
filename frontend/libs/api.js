async function request(url, options) {
    const response = await fetch(url, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
    });
    const body = (await response.json());
    if (!response.ok) {
        throw new Error(typeof body === "object" && body && "error" in body ? body.error : "Request failed");
    }
    return body;
}
export function searchProducts(input) {
    const params = new URLSearchParams({
        query: input.query,
        category: input.category,
        limit: String(input.limit),
    });
    return request(`/api/products?${params}`);
}
export function listCategories() {
    return request("/api/categories");
}
export function adminOverview(passcode) {
    return request("/api/admin/overview", {
        method: "POST",
        body: JSON.stringify({ passcode }),
    });
}
export function importProducts(data) {
    return request("/api/admin/import", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
