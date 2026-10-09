import type { APIContext, MiddlewareHandler } from "astro";

const MARKDOWN_TYPE = "text/markdown; charset=utf-8";

function acceptsMarkdown(request: Request) {
  return request.headers.get("accept")
    ?.split(",")
    .some((value) => {
      const [type, ...parameters] = value.trim().toLowerCase().split(";");
      const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const qualityValue = quality?.split("=")[1];
      return type === "text/markdown" && (qualityValue === undefined || Number(qualityValue) > 0);
    }) ?? false;
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function inlineMarkdown(value: string) {
  return decodeEntities(value)
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*")
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<br\s*\/?>(\s*)/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
}

function htmlToMarkdown(html: string, url: URL) {
  const metadata = {
    title: html.match(/<meta\s+name=["']title["']\s+content=["']([^"']*)["']/i)?.[1]
      ?? html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],
    description: html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1],
  };

  const jsonLd = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => decodeEntities(match[1].trim()))
    .filter(Boolean);

  let body = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<(header|footer|nav|aside)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, content) => `${"#".repeat(Number(level))} ${inlineMarkdown(content)}\n\n`)
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, content) => `- ${inlineMarkdown(content)}\n`)
    .replace(/<(p|div|section|article|main|dt|dd)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, content) => `${inlineMarkdown(content)}\n\n`)
    .replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_, content) => `\n\`\`\`\n${decodeEntities(content).trim()}\n\`\`\`\n\n`);

  body = inlineMarkdown(body)
    .replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, "\n\n")
    .trim();

  if (jsonLd.length) {
    body += `\n\n\`\`\`json\n${jsonLd.join("\n")}\n\`\`\``;
  }

  const frontmatter = [
    metadata.title && `title: ${decodeEntities(metadata.title).replace(/\n/g, " ")}`,
    metadata.description && `description: ${decodeEntities(metadata.description).replace(/\n/g, " ")}`,
  ].filter(Boolean);
  const prefix = frontmatter.length ? `---\n${frontmatter.join("\n")}\n---\n\n` : "";
  const markdown = `${prefix}${body}\n`;
  return { markdown, tokens: Math.max(1, Math.ceil(markdown.length / 4)), url };
}

function appendVary(headers: Headers, value: string) {
  const values = headers.get("Vary")?.split(",").map((item) => item.trim().toLowerCase()) ?? [];
  if (!values.includes(value.toLowerCase())) values.push(value);
  headers.set("Vary", values.join(", "));
}

export const onRequest: MiddlewareHandler = async (context: APIContext, next) => {
  const response = await next();
  if (!acceptsMarkdown(context.request) || !response.headers.get("content-type")?.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const { markdown, tokens } = htmlToMarkdown(html, context.url);
  const headers = new Headers(response.headers);
  headers.set("Content-Type", MARKDOWN_TYPE);
  headers.delete("Content-Length");
  headers.delete("Content-Encoding");
  headers.delete("Content-Range");
  headers.delete("Transfer-Encoding");
  headers.delete("ETag");
  headers.delete("Last-Modified");
  headers.set("x-markdown-tokens", String(tokens));
  appendVary(headers, "Accept");

  return new Response(markdown, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
