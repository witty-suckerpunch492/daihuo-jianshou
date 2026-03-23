import { NextRequest, NextResponse } from "next/server";
import { generateScript, analyzeProduct } from "@/lib/script-engine/generator";
import type { ScriptStyleType } from "@/lib/script-engine/prompts";
import type { ProductCategory } from "@/lib/script-engine/templates";

// 生成带货脚本
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    productImages,
    productName,
    productCategory,
    productDescription,
    styleType,
    duration,
    llmConfig,
  } = body;

  if (!productName) {
    return NextResponse.json({ error: "请填写商品名称" }, { status: 400 });
  }

  if (!llmConfig?.baseUrl || !llmConfig?.apiKey || !llmConfig?.model) {
    return NextResponse.json({ error: "请配置 LLM 参数（baseUrl、apiKey、model）" }, { status: 400 });
  }

  try {
    // 商品图分析：只在图片是完整 URL（http开头）时才调用视觉模型
    // 本地路径（/api/files/...）外部 LLM 无法访问，跳过分析
    let analysis = body.productAnalysis;
    if (!analysis && productImages?.length > 0 && llmConfig) {
      const httpImages = productImages.filter((url: string) => url.startsWith("http"));
      if (httpImages.length > 0) {
        try {
          analysis = await analyzeProduct(httpImages, llmConfig);
        } catch (e) {
          // 图片分析失败不阻塞脚本生成
          console.warn("商品图片分析失败（已跳过）:", e);
        }
      }
    }

    // 生成脚本
    const scripts = await generateScript({
      productName,
      category: (productCategory || "beauty") as ProductCategory,
      productDescription,
      productAnalysis: analysis,
      styleType: (styleType || "pain_point") as ScriptStyleType,
      targetDuration: duration || 30,
      llmConfig,
    });

    return NextResponse.json({ scripts, analysis });
  } catch (error) {
    console.error("脚本生成失败:", error);
    // 提取更详细的错误信息
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `脚本生成失败: ${errMsg}` },
      { status: 500 }
    );
  }
}
