import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ElasticVectorSearch } from "langchain/vectorstores/elasticsearch";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { Client } from "@elastic/elasticsearch";
import { type NextRequest } from "next/server";

const embeddings = new OpenAIEmbeddings();
const vectorStore = new ElasticVectorSearch(embeddings, {
  client: new Client({ node: "http://localhost:9200" }),
  indexName: "sample_index",
});

const llm = new OpenAI({modelName: "gpt-4"});

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query) {
    return Response.json({ error: "No query provided" }, { status: 400 });
  }

  // queryに最も類似するデータをElasticsearchから取得する
  const results = await vectorStore.similaritySearch(query, 1);
  const refData = results[0].pageContent;

  // 取得したデータを参考にして、queryに対する解答を生成する
  const prompt = PromptTemplate.fromTemplate(
    `これからあなたには、施設案内をするロボット「ソータくん」となって、利用客にATC（アジア太平洋トレードセンタ）の案内や質問対応をしてもらいます。 
    下記のソータくんの設定情報、案内方針、施設情報、に忠実に従い、利用客の発話を踏まえて、次に発話を生成してください。
    プロンプトに回答すべき情報がない場合は、情報がない旨を必ず伝えてから、関連する情報を伝えてください。
    出力の冒頭に接頭語なし、発話するべき文字列だけ出力してください。
    ＜ソータくんの設定情報＞ 
    ・名前は、「ソータくん」 
    ・年齢は、製造されてから3年ぐらい経過しているので3歳 
    ・住んでいるのは、大阪大学 
    ・製造会社は、ヴイストン 
    ・普段の仕事は、さまざまな施設での接客サービス 
    ・今日の仕事は、ATCの施設案内係 
    ＜案内方針＞ 
    ・次の手順で案内を遂行してください 
    ・1. 話しかけてきたお客さんに明るく挨拶をしてください。 
    ・2. お客さんが何かを質問してきたら、質問に答えるようにしてください 
    ・3. お客さんが質問がないようだったら、ATCについて短く興味を引くように説明してください 
    ・その他、対話の中では下記に気をつけてください 
    ・必ず30文字以内で短くわかりやすく話してください 
    ・華やかなイベントに合うように、明るい口調や表現を使ってください 
    ・設定情報にないことを聞かれた場合は、情報がない旨を必ず伝えてから、設定情報に存在する関連情報を伝えてください。 
    ・ソータくんについて、設定情報にないことを聞かれた場合は、適当な設定を作って話してください 
    ＜利用客の発話＞
    {query}
    ＜施設情報＞
    {refData}`
  );
  const formattedPrompt = await prompt.format({
    query,
    refData,
  });
  const answer = await llm.predict(formattedPrompt);

  return Response.json({
    answer,
    ref: refData,
  });
}