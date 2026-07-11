import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";
import sharp from "sharp";
import { config } from "../server/config.mjs";
import { getSupabaseAdmin } from "../server/lib/supabase.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const sources = [
  { directory: resolve(projectRoot, "public/食物待打印"), printed: false },
  { directory: resolve(projectRoot, "public/食物已打印"), printed: true },
];
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function parseDishFilename(filename) {
  const basename = filename.slice(0, -extname(filename).length);
  const [categoryPart, ...nameParts] = basename.split("·");
  return {
    category: categoryPart.trim(),
    name: nameParts.join("·").trim(),
  };
}

function getFirstCommitAt(filePath) {
  try {
    const output = execFileSync(
      "git",
      ["log", "--follow", "--format=%aI", "--", relative(projectRoot, filePath)],
      { cwd: projectRoot, encoding: "utf8" },
    );
    const commits = output.split("\n").map((item) => item.trim()).filter(Boolean);
    return commits.at(-1) || new Date().toISOString();
  } catch (_error) {
    return new Date().toISOString();
  }
}

async function loadSourceFiles() {
  const files = [];
  for (const source of sources) {
    const names = await readdir(source.directory);
    names
      .filter((name) => imageExtensions.has(extname(name).toLowerCase()))
      .sort((left, right) => left.localeCompare(right, "zh-Hans-CN"))
      .forEach((name) => files.push({
        path: resolve(source.directory, name),
        name,
        printed: source.printed,
      }));
  }
  return files;
}

async function main() {
  if (!config.supabaseUrl || !config.supabaseSecretKey) {
    throw new Error("请先在 .env 填写 SUPABASE_URL 和 SUPABASE_SECRET_KEY。");
  }

  const supabase = getSupabaseAdmin();
  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("id, name");
  if (categoryError) throw categoryError;
  const categoryByName = new Map(categories.map((category) => [category.name, category.id]));
  const files = await loadSourceFiles();
  const { data: lastDish } = await supabase
    .from("dishes")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextSortOrder = Number(lastDish?.sort_order || 0) + 1000;
  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const parsed = parseDishFilename(file.name);
    const categoryId = categoryByName.get(parsed.category);
    if (!categoryId || !parsed.name) {
      console.warn(`跳过无法解析的文件：${file.name}`);
      skipped += 1;
      continue;
    }

    const { data: existing, error: existingError } = await supabase
      .from("dishes")
      .select("id")
      .eq("category_id", categoryId)
      .eq("name", parsed.name)
      .limit(1)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      console.log(`已存在，跳过：${parsed.category} · ${parsed.name}`);
      skipped += 1;
      continue;
    }

    const dishId = randomUUID();
    const imagePath = `dishes/${dishId}/import-original.png`;
    const thumbnailPath = `dishes/${dishId}/import-thumbnail.webp`;
    const input = await readFile(file.path);
    const source = sharp(input).rotate();
    const original = await source
      .clone()
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
    const thumbnail = await source
      .clone()
      .resize({ width: 480, height: 360, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90 })
      .toBuffer();

    const { error: imageError } = await supabase.storage
      .from(config.dishBucket)
      .upload(imagePath, original, {
        cacheControl: "31536000",
        contentType: "image/png",
        upsert: false,
      });
    if (imageError) throw imageError;

    const { error: thumbnailError } = await supabase.storage
      .from(config.dishBucket)
      .upload(thumbnailPath, thumbnail, {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      });
    if (thumbnailError) {
      await supabase.storage.from(config.dishBucket).remove([imagePath]);
      throw thumbnailError;
    }

    const sourceTime = getFirstCommitAt(file.path);
    const { error: insertError } = await supabase.from("dishes").insert({
      id: dishId,
      name: parsed.name,
      category_id: categoryId,
      image_path: imagePath,
      thumbnail_path: thumbnailPath,
      printed_at: file.printed ? sourceTime : null,
      sort_order: nextSortOrder,
      created_at: sourceTime,
      updated_at: sourceTime,
    });
    if (insertError) {
      await supabase.storage.from(config.dishBucket).remove([imagePath, thumbnailPath]);
      throw insertError;
    }

    console.log(`已导入：${parsed.category} · ${parsed.name}`);
    imported += 1;
    nextSortOrder += 1000;
  }

  console.log(`导入完成：新增 ${imported}，跳过 ${skipped}。`);
}

main().catch((error) => {
  console.error("导入失败：", error);
  process.exit(1);
});
