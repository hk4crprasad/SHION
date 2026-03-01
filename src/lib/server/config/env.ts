import z from 'zod';

const envSchema = z.object({
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_BASE_URL: z.string().optional(),
    OPENAI_CHAT_MODELS: z.string().optional(),
    OPENAI_EMBED_MODELS: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    SEARXNG_URL: z.string().optional(),
    AZURE_OPENAI_API_KEY: z.string().optional(),
    AZURE_OPENAI_ENDPOINT: z.string().optional(),
    AZURE_OPENAI_DEPLOYMENT: z.string().optional(),
    AZURE_OPENAI_API_VERSION: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let env: Env = {};

try {
    env = envSchema.parse(process.env);
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error('Invalid environment variables:', error.format());
    } else {
        console.error('Error parsing environment variables:', error);
    }
}

export const getEnv = () => env;

export const getAzureEnv = () => ({
    apiKey: env.AZURE_OPENAI_API_KEY,
    endpoint: env.AZURE_OPENAI_ENDPOINT,
    deployment: env.AZURE_OPENAI_DEPLOYMENT,
    apiVersion: env.AZURE_OPENAI_API_VERSION,
});

// Parse a comma-separated model list env var into an array of keys
export const parseModelList = (raw: string | undefined): string[] =>
    raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
