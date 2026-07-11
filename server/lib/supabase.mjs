import { createClient } from "@supabase/supabase-js";
import { config } from "../config.mjs";
import { HttpError } from "./errors.mjs";

let client;

export function getSupabaseAdmin() {
  if (client) return client;

  if (!config.supabaseUrl || !config.supabaseSecretKey) {
    throw new HttpError(
      503,
      "SUPABASE_NOT_CONFIGURED",
      "Supabase 尚未配置，请填写服务端环境变量。",
    );
  }

  client = createClient(config.supabaseUrl, config.supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return client;
}

export function throwSupabaseError(error, fallbackMessage, sqlStateMap = {}) {
  if (!error) return;

  const mapped = sqlStateMap[error.code];
  if (mapped) {
    const wrapped = new HttpError(
      mapped.statusCode,
      mapped.code,
      mapped.message || fallbackMessage || "数据库操作失败。",
    );
    wrapped.cause = error;
    throw wrapped;
  }

  const wrapped = new HttpError(
    500,
    "DATABASE_ERROR",
    fallbackMessage || "数据库操作失败。",
  );
  wrapped.cause = error;
  throw wrapped;
}
