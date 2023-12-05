import { Client } from "@elastic/elasticsearch";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { ElasticVectorSearch } from "langchain/vectorstores/elasticsearch";

const embeddings = new OpenAIEmbeddings();
const vectorStore = new ElasticVectorSearch(embeddings, {
    client: new Client({ node: "http://localhost:9200" }),
    indexName: "sample_index",
});

async function loadDocument(textFilePath: string) {
    
    const loader = new TextLoader(textFilePath);
    const docs = await loader.load();

    const splitter = new CharacterTextSplitter({
        chunkSize: 7,
        chunkOverlap: 3,
    })
    const splitDocs = await splitter.splitDocuments(docs);
    console.log("Split documents", splitDocs);

    const ids = await vectorStore.addDocuments(
        splitDocs.map((d) => ({
            pageContent: d.pageContent,
            metadata: { source: d.metadata.source },
        }))
    );

    console.log("Added documents", ids);
    console.info("Loaded documents", textFilePath);
}

const main = async () => {
    await loadDocument("./data/example_1.txt");
}

main();
