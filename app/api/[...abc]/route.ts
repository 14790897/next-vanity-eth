export async function POST(req: Request) {
  try {
    // 创建新 URL
    const url = new URL(req.url);
    const apiPath = url.pathname.replace("/api/https:/", "");
    const upstreamEndpoint =
      `https://${apiPath}` + "/" + process.env.ALCHEMY_API_KEY; // 拼接完整的上游 URL
    console.log("upstreamEndpoint", upstreamEndpoint);
    // 创建新请求的headers对象
    const headers = new Headers(req.headers);
    // 移除或替换可能引起问题的头部
    headers.delete("Host");
    headers.delete("Content-Length");
    headers.delete("cf-connecting-ip");
    headers.delete("cf-ipcountry");
    headers.delete("cf-visitor");
    headers.delete("cf-ray");
    headers.delete("x-forwarded-for");
    headers.delete("x-forwarded-proto");

    // 读取并解析 JSON 请求体
    const requestBody = await req.text();

    // 尝试解析为 JSON
    let jsonBody;
    try {
      jsonBody = JSON.parse(requestBody);
    } catch (error) {
      throw new Error("Failed to parse request body as JSON");
    }

    // 使用fetch方法转发请求到上游服务器
    const response = await fetch(upstreamEndpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(jsonBody), // 确保将请求体转换为字符串
    });
    console.log("headers:", headers);
    console.log("req.body:", jsonBody);
    // 将响应数据发送回客户端
    return new Response(response.body, {
      status: response.status,
      headers: headers,
    });
  } catch (error) {
    // 错误处理
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error in NEXT" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function GET(req: Request) {
  try {
    // 创建新 URL
    const url = new URL(req.url);
    const apiPath = url.pathname.replace("/api", "");

    const upstreamEndpoint =  apiPath + url.search + "/" + process.env.ALCHEMY_API_KEY ;

    // 创建新请求的headers对象
    const headers = new Headers(req.headers);
    // 移除或替换可能引起问题的头部
    headers.delete("Host");

    // 使用fetch方法转发请求到上游服务器
    const response = await fetch(upstreamEndpoint, {
      method: "GET",
      headers: headers,
    });
    console.log("response:", response);
    // 将响应数据发送回客户端
    let text = await response.text();
    console.log("text", text);
    return new Response(text, {
      headers: headers,
      status: response.status,
    });
  } catch (error) {
    // 错误处理
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error in NEXT" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

// const nextConfig = {
//   trailingSlash: true,
// };

// export default nextConfig;
