type ApiMessage = {
  message?: string;
};

export async function readApiJson<T extends ApiMessage>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return { message: fallbackMessage } as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return { message: fallbackMessage } as T;
  }
}
